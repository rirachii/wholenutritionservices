import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Papa from 'papaparse';

const MEAL_DATA = {
  breakfast: [
    {
      id: "apple-spice-oatmeal",
      name: "Apple Spice Oatmeal",
      servings: "4",
      type: "breakfast",
      dietaryTags: ["gluten-free", "dairy-optional", "contains-tree-nuts"]
    },
    {
      id: "cherry-oat-crumble",
      name: "Cherry Oat Crumble",
      servings: "4",
      type: "breakfast",
      dietaryTags: ["contains-eggs", "contains-dairy", "contains-gluten"]
    },
    {
      id: "banana-nut-oatmeal",
      name: "Banana Nut Oatmeal",
      servings: "4",
      type: "breakfast",
      dietaryTags: ["gluten-free", "dairy-optional", "contains-tree-nuts"]
    }
  ],
  lunch: [
    {
      id: "blt-kale-salad",
      name: "BLT Kale Salad",
      servings: "4",
      type: "lunch",
      dietaryTags: ["gluten-free", "dairy-free"]
    },
    {
      id: "chicken-caesar-salad",
      name: "Chicken Caesar Salad",
      servings: "4",
      type: "lunch",
      dietaryTags: ["contains-dairy", "contains-eggs", "contains-gluten"]
    },
    {
      id: "cobb-salad",
      name: "Cobb Salad",
      servings: "4",
      type: "lunch",
      dietaryTags: ["gluten-free", "contains-dairy"]
    }
  ],
  dinner: [
    {
      id: "chicken-curry",
      name: "Chicken Curry",
      servings: "6",
      type: "dinner",
      dietaryTags: ["gluten-free", "dairy-free", "contains-cashews"]
    },
    {
      id: "butter-chicken",
      name: "Butter Chicken",
      servings: "4",
      type: "dinner",
      dietaryTags: ["gluten-free", "dairy-optional"]
    },
    {
      id: "lemon-chicken-and-asparagus",
      name: "Lemon Chicken and Asparagus",
      servings: "4",
      type: "dinner",
      dietaryTags: ["gluten-free", "dairy-free"]
    }
  ]
};

const MenuGenerator = () => {
  const [homes, setHomes] = useState([]);
  const [generatedMenus, setGeneratedMenus] = useState({});
  const [status, setStatus] = useState('');
  
  // Calculate popularity scores for meals
  const calculatePopularity = (homes, mealType) => {
    const popularity = {};
    
    homes.forEach(home => {
      home.preferences[mealType].forEach(pref => {
        popularity[pref] = (popularity[pref] || 0) + 1;
      });
    });
    
    return Object.entries(popularity)
      .sort(([,a], [,b]) => b - a)
      .map(([id, count]) => ({
        id,
        count,
        percentage: (count / homes.length) * 100
      }));
  };
  
  // Calculate days a meal can cover based on servings and home size
  const calculateMealCoverage = (mealServings, homeSize) => {
    const servingsPerMeal = parseInt(mealServings);
    return Math.floor(servingsPerMeal / homeSize);
  };
  
  // Generate menu for one home
  const generateHomeMenu = (home, mealData) => {
    const DAYS_IN_CYCLE = 28; // 4 weeks
    const menu = {
      breakfast: Array(DAYS_IN_CYCLE).fill(null),
      lunch: Array(DAYS_IN_CYCLE).fill(null),
      dinner: Array(DAYS_IN_CYCLE).fill(null)
    };
    
    // Helper to find next available slot
    const findNextSlot = (mealType, startIndex, daysNeeded) => {
      for (let i = startIndex; i < DAYS_IN_CYCLE; i++) {
        let canFit = true;
        for (let j = 0; j < daysNeeded; j++) {
          if (i + j >= DAYS_IN_CYCLE || menu[mealType][i + j] !== null) {
            canFit = false;
            break;
          }
        }
        if (canFit) return i;
      }
      return -1;
    };
    
    // Fill menu with popular items that match preferences
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const popularItems = calculatePopularity(homes, mealType);
      let currentDay = 0;
      
      popularItems.forEach(popularItem => {
        if (home.preferences[mealType].includes(popularItem.id)) {
          const meal = MEAL_DATA[mealType].find(m => m.id === popularItem.id);
          if (meal) {
            const daysCovers = calculateMealCoverage(meal.servings, home.people);
            const slot = findNextSlot(mealType, currentDay, daysCovers);
            
            if (slot !== -1) {
              for (let i = 0; i < daysCovers; i++) {
                menu[mealType][slot + i] = meal;
              }
              currentDay = slot + daysCovers;
            }
          }
        }
      });
      
      // Fill remaining slots with random preferences if needed
      while (currentDay < DAYS_IN_CYCLE) {
        const remainingPrefs = home.preferences[mealType].filter(prefId => {
          const meal = MEAL_DATA[mealType].find(m => m.id === prefId);
          return meal && menu[mealType].filter(m => m && m.id === prefId).length === 0;
        });
        
        if (remainingPrefs.length === 0) break;
        
        const randomPrefId = remainingPrefs[Math.floor(Math.random() * remainingPrefs.length)];
        const meal = MEAL_DATA[mealType].find(m => m.id === randomPrefId);
        
        if (meal) {
          const daysCovers = calculateMealCoverage(meal.servings, home.people);
          const slot = findNextSlot(mealType, currentDay, daysCovers);
          
          if (slot !== -1) {
            for (let i = 0; i < daysCovers; i++) {
              menu[mealType][slot + i] = meal;
            }
            currentDay = slot + daysCovers;
          } else {
            break;
          }
        }
      }
    });
    
    return menu;
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setStatus('Loading file...');
        const text = await file.text();
        
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            setStatus('Processing homes...');
            
            try {
              const processedHomes = results.data.map(row => ({
                id: row.home_id,
                people: parseInt(row.residents),
                dietaryRestrictions: row.dietary_restrictions.split(',').map(s => s.trim()),
                preferences: {
                  breakfast: row.breakfast_preferences.split(',').map(s => s.trim()),
                  lunch: row.lunch_preferences.split(',').map(s => s.trim()),
                  dinner: row.dinner_preferences.split(',').map(s => s.trim())
                }
              }));
              
              setHomes(processedHomes);
              
              setStatus('Generating menus...');
              const menus = {};
              processedHomes.forEach(home => {
                menus[home.id] = generateHomeMenu(home, MEAL_DATA);
              });
              
              setGeneratedMenus(menus);
              setStatus('Menus generated successfully!');
            } catch (error) {
              setStatus('Error processing CSV: ' + error.message);
              console.error('Error processing homes:', error);
            }
          },
          error: (error) => {
            setStatus('Error parsing CSV: ' + error.message);
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        setStatus('Error reading file: ' + error.message);
        console.error('Error reading file:', error);
      }
    }
  };
  
  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>Menu Generator</CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mb-2 block"
            />
            {status && (
              <div className="text-sm text-gray-600 mt-2">{status}</div>
            )}
          </div>
          
          {Object.entries(generatedMenus).map(([homeId, menu]) => (
            <div key={homeId} className="mb-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Menu for {homeId}</h3>
              {['breakfast', 'lunch', 'dinner'].map(mealType => (
                <div key={mealType} className="mb-4">
                  <h4 className="font-medium mb-2 capitalize">{mealType}</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {menu[mealType].map((meal, i) => (
                      <div 
                        key={i} 
                        className="p-2 border rounded min-h-20 bg-white"
                      >
                        <div className="text-sm">Day {i + 1}</div>
                        <div className="font-medium">
                          {meal ? meal.name : 'TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuGenerator;