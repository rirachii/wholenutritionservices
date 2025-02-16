import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { fetchMeals, fetchBagging, fetchInstructions } from '../data/api';
import { PopularityCharts, HomePopularityCharts } from './PopularityCharts';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function ScheduleGenerator() {
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});
  const [mealData, setMealData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [servingSizes, setServingSizes] = useState({});

  useEffect(() => {
    const loadMealData = async () => {
      try {
        const data = await fetchMeals();
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meal Plan Generator</h1>
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload CSV
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <PopularityCharts homes={homes} mealData={mealData} />

      {/* Generated Menus */}
      {Object.entries(menus).map(([home_id, homeMenu]) => {
        const home = homes.find(h => h.home_id === home_id);
        if (!home) return null;

        return (
          <div key={home_id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Home {home_id}</h2>
              <div className="text-sm text-gray-600">
                {home.residents} resident(s)
              </div>
            </div>

            {/* Serving Size Configuration */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Serving Size Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['breakfast', 'lunch', 'dinner'].map(mealType => (
                  <div key={mealType}>
                    <ServingSizeSelector
                      homeId={home_id}
                      mealType={mealType}
                      preferences={home[`${mealType}_preferences`]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <MealCard
                  key={day}
                  day={day}
                  meals={{
                    breakfast: homeMenu.breakfast.filter(m => m.day === day),
                    lunch: homeMenu.lunch.filter(m => m.day === day),
                    dinner: homeMenu.dinner.filter(m => m.day === day)
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}