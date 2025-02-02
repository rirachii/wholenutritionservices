import { useState } from 'react';
import mealData from '../data/meals.json';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MenuGenerator() {
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});

  const calculateMealCycle = (residents, servingsPerMeal) => {
    // Returns array of objects representing each day in the cycle
    const cycle = [];
    let leftoverServings = 0;
    let dayInCycle = 0;
    
    while (true) {
      const todaysPlan = {
        day: dayInCycle + 1,
        needNewMeal: false,
        servingsFromPrevious: 0,
        servingsNeededToday: residents,
        leftoverForNext: 0
      };

      // First, use any leftovers from previous day
      if (leftoverServings > 0) {
        todaysPlan.servingsFromPrevious = Math.min(leftoverServings, residents);
        leftoverServings -= todaysPlan.servingsFromPrevious;
      }

      // If we still need more servings, make a new meal
      if (todaysPlan.servingsFromPrevious < residents) {
        todaysPlan.needNewMeal = true;
        const additionalServingsNeeded = residents - todaysPlan.servingsFromPrevious;
        leftoverServings = servingsPerMeal - additionalServingsNeeded;
      }

      todaysPlan.leftoverForNext = leftoverServings;
      cycle.push(todaysPlan);
      dayInCycle++;

      // Check if we've found a repeating pattern
      if (dayInCycle > 1 && leftoverServings === cycle[0].leftoverForNext) {
        break;
      }
    }

    return cycle;
  };

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

  const generateMenus = (homesData) => {
    const generatedMenus = {};
    
    homesData.forEach(home => {
      const residents = parseInt(home.residents) || 1;
      generatedMenus[home.phone] = { breakfast: [], lunch: [], dinner: [] };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const preferences = home[`${mealType}_preferences`]?.split(',') || [];
        let currentPreferenceIndex = 0;
        
        // Get the cycle pattern for this home's residents
        const servingsPerMeal = 4; // Standard serving size
        const mealCycle = calculateMealCycle(residents, servingsPerMeal);
        const cycleLength = mealCycle.length;

        // Generate 28 days of meals using the cycle
        for (let day = 1; day <= 28; day++) {
          const cycleDay = mealCycle[(day - 1) % cycleLength];
          const dayMeals = [];

          // If we have servings from previous day
          if (cycleDay.servingsFromPrevious > 0) {
            dayMeals.push({
              day,
              dish: mealData[mealType][currentPreferenceIndex]?.name,
              isNewMeal: false,
              servingsUsed: cycleDay.servingsFromPrevious,
              fromDay: day - 1
            });
          }

          // If we need to make a new meal
          if (cycleDay.needNewMeal) {
            currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
            const dishId = preferences[currentPreferenceIndex];
            const dish = mealData[mealType].find(d => d.id === dishId);

            if (dish) {
              dayMeals.push({
                day,
                dish: dish.name,
                isNewMeal: true,
                servingsNeeded: residents - cycleDay.servingsFromPrevious,
                totalServings: servingsPerMeal,
                leftoverForNext: cycleDay.leftoverForNext
              });
            }
          }

          generatedMenus[home.phone][mealType].push(...dayMeals);
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
                            Make new meal ({meal.totalServings} servings)
                          </div>
                          <div className="text-blue-600">
                            Use {meal.servingsNeeded} serving(s) today
                          </div>
                          {meal.leftoverForNext > 0 && (
                            <div className="text-blue-600">
                              Save {meal.leftoverForNext} serving(s) for Day {day + 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-amber-600">
                          Use {meal.servingsUsed} leftover serving(s) from Day {meal.fromDay}
                        </div>
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meal Plan Generator</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-6 block"
      />

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