import { useState } from 'react';
import Papa from 'papaparse';
import mealData from '../data/meals.json';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MenuGenerator() {
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    console.log('Processing file:', file.name);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('File parsing complete. Raw data:', results.data);
        const transformedData = results.data.map(home => ({
          ...home,
          breakfast_preferences: home.breakfast_preferences?.trim() || '',
          lunch_preferences: home.lunch_preferences?.trim() || '',
          dinner_preferences: home.dinner_preferences?.trim() || '',
          dietary_restrictions: home.dietary_restrictions?.trim() || 'none',
          residents: parseInt(home.residents) || 1
        }));
        console.log('Transformed data:', transformedData);
        setHomes(transformedData);
        console.log('Starting menu generation...');
        generateMenus(transformedData);
      },
      error: (error) => {
        console.error('Error parsing file:', error);
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
    console.log('Generating menus for homes:', homesData.length);
    const generatedMenus = {};
    
    homesData.forEach(home => {
      console.log(`Processing menu for home ${home.home_id}`);
      const residents = parseInt(home.residents) || 1;
      generatedMenus[home.home_id] = { breakfast: [], lunch: [], dinner: [] };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        console.log(`Generating ${mealType} menu for home ${home.home_id}`);
        const preferences = home[`${mealType}_preferences`]?.split(',') || [];
        
        if (residents === 3) {
          generatedMenus[home.home_id][mealType] = generateMenuFor3Residents(preferences, mealType, homesData);
        } else {
          generatedMenus[home.home_id][mealType] = generateRegularMenu(preferences, mealType, residents, homesData);
        }
        console.log(`Completed ${mealType} menu for home ${home.home_id}`);
      });
    });

    console.log('Menu generation complete');
    setMenus(generatedMenus);
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
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Generator</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CSV File</label>
              <p className="text-sm text-gray-500 mb-2">Upload a CSV file with meal preferences</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>
  
      <PopularityCharts homes={homes} />
  
      {/* Generated Menus */}
      {Object.entries(menus).map(([home_id, homeMenu]) => {
        const daysMenu = Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          const meals = {
            breakfast: homeMenu.breakfast.filter(meal => meal.day === day),
            lunch: homeMenu.lunch.filter(meal => meal.day === day),
            dinner: homeMenu.dinner.filter(meal => meal.day === day)
          };

          return { day, meals };
        });

        return (
          <div key={home_id} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Home {home_id}</h2>
            <div className="text-sm text-gray-600 mb-4">
              <p>Residents: {homes.find(h => h.home_id === home_id)?.residents || 'N/A'}</p>
              <p>Dietary Restrictions: {homes.find(h => h.home_id === home_id)?.dietary_restrictions || 'None'}</p>
            </div>
            
            <div className="sticky top-4 z-10 bg-gray-50 py-4">
              <HomePopularityCharts homeId={home_id} homes={homes} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {daysMenu.map(({ day, meals }) => (
                <MealCard 
                  key={day}
                  day={day}
                  meals={meals}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)};