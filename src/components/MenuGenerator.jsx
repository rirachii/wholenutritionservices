import { useState } from 'react';
import Papa from 'papaparse';
import mealData from '../data/meals.json';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MenuGenerator() {
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const transformedData = results.data.map(home => ({
          ...home,
          breakfast_preferences: home.breakfast_preferences?.trim() || '',
          lunch_preferences: home.lunch_preferences?.trim() || '',
          dinner_preferences: home.dinner_preferences?.trim() || '',
          dietary_restrictions: home.dietary_restrictions?.trim() || 'none',
          residents: parseInt(home.residents) || 1
        }));
        setHomes(transformedData);
        generateMenus(transformedData);
      },
    });
  };

  const generateMenuFor3Residents = (preferences, mealType) => {
    const menuForType = [];
    let currentPreferenceIndex = 0;
    let day = 1;
    
    while (day <= 28) {
      const cycleDay = (day - 1) % 4;
      const dishId = preferences[currentPreferenceIndex];
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
      }
      
      day++;
    }
    return menuForType;
  };

  const generateRegularMenu = (preferences, mealType, residents) => {
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
      generatedMenus[home.phone] = { breakfast: [], lunch: [], dinner: [] };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const preferences = home[`${mealType}_preferences`]?.split(',') || [];
        
        if (residents === 3) {
          generatedMenus[home.phone][mealType] = generateMenuFor3Residents(preferences, mealType);
        } else {
          generatedMenus[home.phone][mealType] = generateRegularMenu(preferences, mealType, residents);
        }
      });
    });

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
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 most popular meals
  };
  
  const PopularityCharts = ({ homes }) => {
    if (homes.length === 0) return null;
  
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Meal Popularity</h2>
        <div className="space-y-8">
          {['breakfast', 'lunch', 'dinner'].map(mealType => (
            <div key={mealType} className="bg-white p-4 rounded-lg shadow-sm w-full">
              <h3 className="text-lg font-medium mb-4 capitalize">{mealType} Popularity</h3>
              <BarChart width={1000} height={400} data={calculateMealPopularity(homes, mealType)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis type="number" tickCount={5} domain={[0, 'dataMax']} allowDecimals={false} />
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
                  wrapperStyle={{ whiteSpace: 'pre-line' }}
                />
                <Bar dataKey="count" fill="#8884d8" barSize={20} />
              </BarChart>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meal Plan Generator</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-6 block"
      />
  
      <PopularityCharts homes={homes} />
  
      {/* Generated Menus */}
      {Object.entries(menus).map(([phone, homeMenu]) => {
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
          <div key={phone} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Home {phone}</h2>
            <div className="text-sm text-gray-600 mb-4">
              <p>Residents: {homes.find(h => h.phone === phone)?.residents || 'N/A'}</p>
              <p>Dietary Restrictions: {homes.find(h => h.phone === phone)?.dietary_restrictions || 'None'}</p>
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
  );
}