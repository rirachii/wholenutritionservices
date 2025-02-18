import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { fetchMeals, fetchBagging, fetchInstructions } from '../data/api';
import { PopularityCharts, HomePopularityCharts } from './PopularityCharts';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function ScheduleGenerator() {
  const [activeTab, setActiveTab] = useState('generator');
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});
  const [mealData, setMealData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [servingSizes, setServingSizes] = useState({});
  const [currentHomeIndex, setCurrentHomeIndex] = useState(0);

  const nextHome = () => {
    setCurrentHomeIndex(prev => (prev + 1) % homes.length);
  };

  const previousHome = () => {
    setCurrentHomeIndex(prev => (prev - 1 + homes.length) % homes.length);
  };

  useEffect(() => {
    const loadMealData = async () => {
      try {
        const data = await fetchMeals();
        setMealData(data);
        console.log(data);
        console.log(await fetchBagging());
        console.log(await fetchInstructions());
        initializeServingSizes(data);
      } catch (err) {
        setError('Failed to load meal data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadMealData();
  }, []);

  const initializeServingSizes = (data) => {
    const sizes = {};
    Object.keys(data).forEach(mealType => {
      sizes[mealType] = {};
      data[mealType].forEach(meal => {
        sizes[mealType][meal.id] = parseInt(meal.servings) || 4;
      });
    });
    setServingSizes(sizes);
  };

  const handleServingSizeChange = (homeId, mealType, mealId, value) => {
    setServingSizes(prev => ({
      ...prev,
      [homeId]: {
        ...prev[homeId],
        [mealType]: {
          ...prev[homeId]?.[mealType],
          [mealId]: parseInt(value)
        }
      }
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the file format.');
          return;
        }

        const transformedData = results.data
          .filter(home => home.home_id && home.residents) // Filter out invalid entries
          .map(home => ({
            ...home,
            breakfast_preferences: home.breakfast_preferences?.trim() || '',
            lunch_preferences: home.lunch_preferences?.trim() || '',
            dinner_preferences: home.dinner_preferences?.trim() || '',
            dietary_restrictions: home.dietary_restrictions?.trim() || 'none',
            residents: parseInt(home.residents) || 1
          }));

        if (transformedData.length === 0) {
          setError('No valid data found in the CSV file.');
          return;
        }

        setHomes(transformedData);
        generateMenus(transformedData);
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
      }
    });
  };

  const calculateMealPopularityForHome = (preferences, mealType, homesData) => {
    const mealCounts = {};
    
    homesData.forEach(home => {
      const homePreferences = home[`${mealType}_preferences`]?.split(',') || [];
      homePreferences.forEach(mealId => {
        if (mealId) {
          mealCounts[mealId] = (mealCounts[mealId] || 0) + 1;
        }
      });
    });
  
    return preferences
      .sort((a, b) => (mealCounts[b] || 0) - (mealCounts[a] || 0));
  };

  const generateMenuFor3Residents = (preferences, mealType, homesData) => {
    const sortedPreferences = calculateMealPopularityForHome(preferences, mealType, homesData);
    const menuForType = [];
    let currentPreferenceIndex = 0;
    let day = 1;
    
    while (day <= 28) {
      const cycleDay = (day - 1) % 4;
      const dishId = sortedPreferences[currentPreferenceIndex];
      const dish = mealData[mealType].find(d => d.id === dishId);
      
      if (!dish) {
        day++;
        continue;
      }
  
      switch (cycleDay) {
        case 0: // Day 1 of cycle
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            totalServings: 4,
            useTodayServings: 3,
            leftoverServings: 1
          });
          currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
          break;

        case 1: // Day 2 of cycle
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            totalServings: 4,
            useTodayServings: 2,
            leftoverServings: 2,
            useLeftoverServings: 1,
            fromDay: day - 1
          });
          currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
          break;

        case 2: // Day 3 of cycle
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            totalServings: 4,
            useTodayServings: 1,
            leftoverServings: 3,
            useLeftoverServings: 2,
            fromDay: day - 1
          });
          currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
          break;

        case 3: // Day 4 of cycle
          menuForType.push({
            day,
            dish: menuForType[day - 2].dish, // Use dish from Day 3
            isNewMeal: false,
            useLeftoverServings: 3,
            fromDay: day - 1
          });
          break;

        default:
          console.warn(`Unexpected cycle day: ${cycleDay}`);
          break;
      }
      
      day++;
    }
    return menuForType;
  };

  const generateRegularMenu = (preferences, mealType, residents, homesData) => {
    const menuForType = [];
    let currentPreferenceIndex = 0;
    let day = 1;
    let leftoverServings = 0;
    let currentDish = null;

    while (day <= 28) {
      if (leftoverServings >= residents) {
        // Use leftovers
        menuForType.push({
          day,
          dish: currentDish.name,
          isNewMeal: false,
          servingsUsed: residents,
          fromDay: day - 1,
          leftoverServings: leftoverServings - residents
        });
        leftoverServings -= residents;
      } else {
        // Make new meal
        const dishId = preferences[currentPreferenceIndex];
        const dish = mealData[mealType].find(d => d.id === dishId);
        currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;

        if (dish) {
          const servingsPerMeal = 4;
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            servingsNeeded: residents,
            totalServings: servingsPerMeal,
            useTodayServings: residents,
            leftoverServings: servingsPerMeal - residents
          });

          currentDish = dish;
          leftoverServings = servingsPerMeal - residents;
        }
      }
      day++;
    }
    return menuForType;
  };

  const generateMenus = (homesData) => {
    const generatedMenus = {};
    
    homesData.forEach(home => {
      const residents = parseInt(home.residents) || 1;
      generatedMenus[home.home_id] = { breakfast: [], lunch: [], dinner: [] };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const preferences = home[`${mealType}_preferences`]?.split(',') || [];
        
        if (residents === 3) {
          generatedMenus[home.home_id][mealType] = generateMenuFor3Residents(preferences, mealType, homesData);
        } else {
          generatedMenus[home.home_id][mealType] = generateRegularMenu(
            preferences,
            mealType,
            residents,
            homesData,
            servingSizes[home.home_id]?.[mealType] || {}
          );
        }
      });
    });

    setMenus(generatedMenus);
  };

  const ServingSizeSelector = ({ homeId, mealType, preferences }) => {
    if (!preferences || preferences.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 capitalize">{mealType} Serving Sizes</h4>
        <div className="space-y-2">
          {preferences.split(',').map(mealId => {
            const meal = mealData[mealType]?.find(m => m.id === mealId);
            if (!meal) return null;

            const servingSize = meal.servings || 4;
            const hasMultipleServings = Array.isArray(servingSize) && servingSize.length > 1;

            return (
              <div key={mealId} className="flex items-center space-x-2">
                <label className="text-sm flex-grow">{meal.name}</label>
                {hasMultipleServings ? (
                  <select
                    className="form-select text-sm border rounded px-2 py-1"
                    value={servingSizes[homeId]?.[mealType]?.[mealId] || servingSize[0]}
                    onChange={(e) => handleServingSizeChange(homeId, mealType, mealId, e.target.value)}
                  >
                    {servingSize.map(size => (
                      <option key={size} value={size}>{size} servings</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-600">{servingSize} servings</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MealCard = ({ day, meals }) => {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3">Day {day}</h3>
        <div className="space-y-3">
          {Object.entries(meals).map(([mealType, mealInfo]) => (
            <div key={mealType} className="border-b pb-2 last:border-b-0">
              <div className="text-sm font-medium capitalize text-gray-600">{mealType}</div>
              <div className="space-y-2">
                {mealInfo.map((meal, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-medium">{meal.dish}</div>
                    <div className="text-xs space-y-1">
                      {meal.isNewMeal ? (
                        <>
                          <div className="text-green-600">
                            Make new meal (4 servings)
                          </div>
                          {meal.useLeftoverServings > 0 && (
                            <div className="text-amber-600">
                              Use {meal.useLeftoverServings} leftover serving(s) from Day {meal.fromDay}
                            </div>
                          )}
                          <div className="text-blue-600">
                            Use {meal.useTodayServings} serving(s) from new meal
                          </div>
                          {meal.leftoverServings > 0 && (
                            <div className="text-blue-600">
                              Save {meal.leftoverServings} serving(s) for Day {day + 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-amber-600">
                            Use {meal.useLeftoverServings} leftover serving(s) from Day {meal.fromDay}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateMealPopularity = (homes, mealType) => {
    const mealCounts = {};
    const mealHomes = {};
    
    homes.forEach(home => {
      const preferences = home[`${mealType}_preferences`]?.split(',') || [];
      preferences.forEach(mealId => {
        if (mealId) {
          const meal = mealData[mealType].find(m => m.id === mealId);
          if (meal) {
            mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1;
            if (!mealHomes[meal.name]) mealHomes[meal.name] = [];
            mealHomes[meal.name].push(home.phone);
          }
        }
      });
    });
  
    return Object.entries(mealCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        homes: mealHomes[name]
      }))
      .sort((a, b) => b.count - a.count);
  };
  
  const PopularityCharts = ({ homes }) => {
    if (homes.length === 0) return null;
  
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Meal Popularity</h2>
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner'].map(mealType => (
            <div key={mealType} className="bg-white p-4 pb-2 rounded-lg shadow-sm w-full">
              <h3 className="text-base font-medium mb-3 capitalize">{mealType} Popularity</h3>
              <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                <BarChart width={600} height={Math.max(300, calculateMealPopularity(homes, mealType).length * 25)} data={calculateMealPopularity(homes, mealType)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} tickCount={5} allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'count') {
                        return [
                          `${Math.round(value)}`,
                          'Count'
                        ];
                      }
                      return [value, name];
                    }}
                    contentStyle={{ fontSize: '12px' }}
                    wrapperStyle={{ whiteSpace: 'pre-line' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" barSize={18} />
                </BarChart>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateHomeSpecificPopularity = (homeId, homes, mealType) => {
    const currentHome = homes.find(h => h.home_id === homeId);
    if (!currentHome) return [];

    const homeMealIds = currentHome[`${mealType}_preferences`]?.split(',') || [];
    const mealCounts = {};
    const mealHomes = {};
    
    homes.forEach(home => {
      const preferences = home[`${mealType}_preferences`]?.split(',') || [];
      preferences.forEach(mealId => {
        if (mealId && homeMealIds.includes(mealId)) {
          const meal = mealData[mealType].find(m => m.id === mealId);
          if (meal) {
            mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1;
            if (!mealHomes[meal.name]) mealHomes[meal.name] = [];
            mealHomes[meal.name].push(home.phone);
          }
        }
      });
    });
  
    return Object.entries(mealCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        homes: mealHomes[name]
      }))
      .sort((a, b) => b.count - a.count);
  };

  const HomePopularityCharts = ({ homeId, homes }) => {
    if (homes.length === 0) return null;
  
    return (
      <div className="mb-2">
        <p className="text-lg font-semibold mb-4">Home: {homeId} Meal Rankings</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['breakfast', 'lunch', 'dinner'].map(mealType => {
            const popularityData = calculateHomeSpecificPopularity(homeId, homes, mealType);
            if (popularityData.length === 0) return null;

            return (
              <div key={mealType} className="bg-white p-4 rounded-lg shadow-sm w-full overflow-y-auto" style={{ maxHeight: '400px' }}>
                <h4 className="text-sm font-medium mb-4 capitalize">{mealType} Popularity</h4>
                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                  <BarChart width={280} height={Math.max(150, popularityData.length * 25)} data={popularityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 'dataMax']} tickCount={5} allowDecimals={false} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'count') {
                          return [
                            `${Math.round(value)}`,
                            'Count'
                          ];
                        }
                        return [value, name];
                      }}
                      contentStyle={{ fontSize: '11px' }}
                      wrapperStyle={{ whiteSpace: 'pre-line' }}
                    />
                    <Bar dataKey="count" fill="#8884d8" barSize={15} />
                  </BarChart>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-8 text-red-600">{error}</div>;
    }

    switch (activeTab) {
      case 'generator':
        return (
          <div className="space-y-6">
            

            {homes.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={previousHome}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    disabled={homes.length <= 1}
                  >
                    Previous Home
                  </button>
                  <span className="text-sm text-gray-600">
                    Home {currentHomeIndex + 1} of {homes.length}
                  </span>
                  <button
                    onClick={nextHome}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    disabled={homes.length <= 1}
                  >
                    Next Home
                  </button>
                </div>
                {Object.entries(menus)
                  .filter(([homeId]) => homeId === homes[currentHomeIndex].home_id)
                  .map(([homeId, homeMeals]) => (
                    <div key={homeId} className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Home: {homeId}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(28)].map((_, index) => (
                          <MealCard
                            key={index + 1}
                            day={index + 1}
                            meals={{
                              breakfast: homeMeals.breakfast.find(m => m.day === index + 1) ? [homeMeals.breakfast.find(m => m.day === index + 1)] : [],
                              lunch: homeMeals.lunch.find(m => m.day === index + 1) ? [homeMeals.lunch.find(m => m.day === index + 1)] : [],
                              dinner: homeMeals.dinner.find(m => m.day === index + 1) ? [homeMeals.dinner.find(m => m.day === index + 1)] : []
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'popularity':
        return homes.length > 0 ? (
          <div className="space-y-8">
            <PopularityCharts homes={homes} mealData={mealData} />
            {Object.keys(menus).map(homeId => (
              <HomePopularityCharts
                key={homeId}
                homeId={homeId}
                homes={homes}
                mealData={mealData}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            Upload menu preferences to view popularity charts
          </div>
        );

      case 'prep':
        return homes.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(menus).map(([homeId, homeMeals]) => (
              <div key={homeId} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Home: {homeId}</h3>
                <ServingSizeSelector
                  homeId={homeId}
                  mealType="breakfast"
                  preferences={homes.find(h => h.home_id === homeId)?.breakfast_preferences}
                  mealData={mealData}
                  servingSizes={servingSizes}
                  onServingSizeChange={handleServingSizeChange}
                />
                <ServingSizeSelector
                  homeId={homeId}
                  mealType="lunch"
                  preferences={homes.find(h => h.home_id === homeId)?.lunch_preferences}
                  mealData={mealData}
                  servingSizes={servingSizes}
                  onServingSizeChange={handleServingSizeChange}
                />
                <ServingSizeSelector
                  homeId={homeId}
                  mealType="dinner"
                  preferences={homes.find(h => h.home_id === homeId)?.dinner_preferences}
                  mealData={mealData}
                  servingSizes={servingSizes}
                  onServingSizeChange={handleServingSizeChange}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            Upload menu preferences to view prep instructions
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meal Plan Generator</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upload Menu Preferences</h2>
        <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </div>
      
      <div className="mb-6 bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('generator')}
              className={`${
                activeTab === 'generator'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Menu Generator
            </button>
            <button
              onClick={() => setActiveTab('popularity')}
              className={`${
                activeTab === 'popularity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Meal Popularity
            </button>
            <button
              onClick={() => setActiveTab('prep')}
              className={`${
                activeTab === 'prep'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Prep Instructions
            </button>
          </nav>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}