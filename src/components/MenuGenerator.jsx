import { useState } from 'react';
import Papa from 'papaparse';
import mealData from '../data/meals.json';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';



function mapRestrictionToField(restriction) {
  const mapping = {
    'gluten-free': 'Gluten',
    'dairy-free': 'Dairy',
    'contains-tree-nuts': 'Tree Nuts',
    'peanut-free': 'Peanuts',
    'soy-free': 'Soy',
    'shellfish-free': 'Shellfish',
    'egg-free': 'Eggs',
    'sesame-free': 'Sesame'
  };
  return mapping[restriction] || '';
}

export default function MenuGenerator() {
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});
  const [popularity, setPopularity] = useState({ breakfast: [], lunch: [], dinner: [] });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Transform data to ensure backward compatibility
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
    // Calculate popularity for each dish
    const popularity = { breakfast: {}, lunch: {}, dinner: {} };
    
    homesData.forEach(home => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        const prefs = home[`${meal}_preferences`]?.split(',') || [];
        prefs.forEach(dishId => {
          popularity[meal][dishId] = (popularity[meal][dishId] || 0) + 1;
        });
      });
    });

    // Convert popularity data for charts
    const popularityChartData = {};
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      popularityChartData[meal] = Object.entries(popularity[meal])
        .map(([id, count]) => ({
          name: mealData[meal].find(dish => dish.id === id)?.name || id,
          count
        }))
        .sort((a, b) => b.count - a.count);
    });

    setPopularity(popularityChartData);

    // Generate menu for each home
    const generatedMenus = {};
    
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      // Sort dishes by popularity for each meal type
      const dishPopularity = {};
      homesData.forEach(home => {
        const prefs = home[`${mealType}_preferences`]?.split(',') || [];
        prefs.forEach(dishId => {
          dishPopularity[dishId] = (dishPopularity[dishId] || 0) + 1;
        });
      });

      // Process homes in order of most popular dishes
      const sortedDishes = Object.entries(dishPopularity)
        .sort(([, a], [, b]) => b - a)
        .map(([id]) => id);

      // Initialize menu tracking for each home
      homesData.forEach(home => {
        if (!generatedMenus[home.phone]) {
          generatedMenus[home.phone] = { breakfast: [], lunch: [], dinner: [] };
        }
      });

      // Assign dishes based on popularity
      sortedDishes.forEach(dishId => {
        const dish = mealData[mealType].find(d => d.id === dishId);
        if (!dish) return;

        homesData.forEach(home => {
          const homeMenu = generatedMenus[home.phone][mealType];
          const totalDaysCovered = homeMenu.reduce((sum, item) => sum + item.daysCovered, 0);
          
          // Allow repetition after all preferred meals have been used once
          const hasUsedAllPreferences = home[`${mealType}_preferences`]?.split(',').every(prefId => {
            return homeMenu.some(item => mealData[mealType].find(d => d.id === prefId)?.name === item.dish);
          });

          if (totalDaysCovered >= 28) return;
          if (!hasUsedAllPreferences && !home[`${mealType}_preferences`]?.split(',').includes(dishId)) return;

          // Check dietary restrictions
          const restrictions = home.dietary_restrictions.split(',');
          const isCompatible = restrictions.every(restriction => {
            if (restriction === 'vegetarian') {
              return dish['Protein'] === 'Meatless' || dish['Protein'] === 'Vegan';
            }
            if (restriction === 'vegan') {
              return dish['Protein'] === 'Vegan' && dish['Eggs'] === 'no' && dish['Dairy'] === 'no';
            }
            const field = mapRestrictionToField(restriction);
            if (!field) return true;
            if (field === 'Tree Nuts') {
              return dish[field] === 'no' && dish['Almonds'] === 'no' && 
                     dish['Coconut'] === 'no' && dish['Cashews'] === 'no';
            }
            return dish[field] === 'no' || dish[field] === 'optional';
          });
          if (!isCompatible) return;

          const residents = parseInt(home.residents) || 1;
          const servings = parseInt(dish.servings) || 4;
          let remainingServings = servings;
          let currentDay = Math.ceil(totalDaysCovered);

          while (remainingServings > 0 && currentDay < 28) {
            const servingsForDay = Math.min(residents, remainingServings);
            const isLeftover = remainingServings < servings;

            homeMenu.push({
              dish: dish.name,
              daysCovered: 1,
              startDay: currentDay + 1,
              endDay: currentDay + 1,
              servingsUsed: servingsForDay,
              isLeftover,
              totalServings: servings
            });

            remainingServings -= servingsForDay;
            currentDay++;
          }
        });
      });
    });

    setMenus(generatedMenus);
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

      {homes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Homes Information</h2>
          {homes.map((home) => (
            <div key={home.phone} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Home {home.phone}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Residents: {home.residents || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Dietary Restrictions: {home.dietary_restrictions || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Breakfast Preferences: {home.breakfast_preferences || 'None'}</p>
                  <p className="text-sm text-gray-600">Lunch Preferences: {home.lunch_preferences || 'None'}</p>
                  <p className="text-sm text-gray-600">Dinner Preferences: {home.dinner_preferences || 'None'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Popularity Charts */}
      {Object.entries(popularity).map(([mealType, data]) => (
        <div key={mealType} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">{mealType} Dish Popularity</h2>
          <BarChart width={800} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>
      ))}

      {/* Menus organized by day */}
      {Object.entries(menus).map(([phone, menu]) => {
        const daysMenu = Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          return {
            day,
            meals: {
              breakfast: menu.breakfast.find(entry => day === entry.startDay),
              lunch: menu.lunch.find(entry => day === entry.startDay),
              dinner: menu.dinner.find(entry => day === entry.startDay)
            }
          };
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
                <div key={day} className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-3">Day {day}</h3>
                  <div className="space-y-3">
                    {Object.entries(meals).map(([mealType, mealInfo]) => (
                      <div key={mealType} className="border-b pb-2 last:border-b-0">
                        <div className="text-sm font-medium capitalize text-gray-600">{mealType}</div>
                        {mealInfo ? (
                          <div className="text-sm">
                            <div>{mealInfo.dish}</div>
                            <div className="text-xs text-gray-500">
                              {mealInfo.isLeftover ? 
                                `Use ${mealInfo.servingsUsed} leftover serving(s)` : 
                                `Make new (${mealInfo.totalServings} servings)`}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">No meal assigned</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
              </div>
            
          )}
    