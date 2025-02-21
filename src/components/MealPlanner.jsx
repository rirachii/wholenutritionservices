import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as XLSX from 'xlsx';
import { fetchMeals, fetchBagging, fetchInstructions } from "../data/api.js";
import { generateMenu } from '../utils/generateMenu';

const MealPlanner = () => {
    const [homes, setHomes] = useState({});
    const [meals, setMeals] = useState([]);
    const [bagging, setBagging] = useState({});
    const [instructions, setInstructions] = useState({});
    const [menus, setMenus] = useState({});
    const [activeTab, setActiveTab] = useState('mealRanking');
    const [loading, setLoading] = useState(true);
    const [xlsxFile, setXlsxFile] = useState(null);
    const [currentHomeIndex, setCurrentHomeIndex] = useState(0);
    const [mealRankings, setMealRankings] = useState({
        breakfast: [],
        lunch: [],
        dinner: [],
    });
    const [homePreferences, setHomePreferences] = useState({});
    const [mealServings, setMealServings] = useState({}); // { [mealId]: servingSize }
    const [mealCounts, setMealCounts] = useState({});
    const [generatedMenu, setGeneratedMenu] = useState({}); // Store generated menu

    const homeIds = Object.keys(homes);
    const totalHomes = homeIds.length;
    const currentHomeId = homeIds[currentHomeIndex];
    const currentHome = homes[currentHomeId];
    const residents = currentHome?.residents || 1;

    const handlePrevHome = () => {
        setCurrentHomeIndex((prev) => (prev > 0 ? prev - 1 : totalHomes - 1));
    };

    const handleNextHome = () => {
        setCurrentHomeIndex((prev) => (prev < totalHomes - 1 ? prev + 1 : 0));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const mealsResponse = await fetchMeals();
                const baggingData = await fetchBagging();
                const instructionsResponse = fetchInstructions();

                setMeals([
                    ...mealsResponse.breakfast,
                    ...mealsResponse.lunch,
                    ...mealsResponse.dinner
                ]);
                setBagging(baggingData);
                setInstructions(instructionsResponse);
                
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (Object.keys(homes).length > 0) {
            const initialMenus = {};
            Object.keys(homes).forEach(homeId => {
            initialMenus[homeId] = {
                breakfast: null,
                lunch: null,
                dinner: null
            };
            });
            setGeneratedMenus(initialMenus);
        }
    }, [homes]);


    const transformXlsxData = (jsonData) => {
        const homes = {};
        jsonData.forEach(row => {
            const homeId = row['home_id']; // Adjust if your header is different
            homes[homeId] = {
                phone: row['phone'] || '',
                email: row['email'] || '',
                residents: parseInt(row['residents'] || 0, 10) || 0,
                dietary_restrictions: row['dietary_restrictions'] ? String(row['dietary_restrictions']).split(',') : [],
                breakfast_preferences: row['breakfast_preferences'] ? String(row['breakfast_preferences']).split(',') : [],
                lunch_preferences: row['lunch_preferences'] ? String(row['lunch_preferences']).split(',') : [],
                dinner_preferences: row['dinner_preferences'] ? String(row['dinner_preferences']).split(',') : [],
            };
        });
        return homes;
    };

    const parseXlsx = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];  // Assuming first sheet
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    };

    const compileMealPopularity = (homesData) => {
        const allBreakfasts = Object.values(homesData).flatMap(home => home.breakfast_preferences);
        const allLunches = Object.values(homesData).flatMap(home => home.lunch_preferences);
        const allDinners = Object.values(homesData).flatMap(home => home.dinner_preferences);

        // Calculate meal counts
        const counts = {};
        [...allBreakfasts, ...allLunches, ...allDinners].forEach(mealId => {
            if (mealId) {
                counts[mealId] = (counts[mealId] || 0) + 1;
            }
        });
        setMealCounts(counts);

        const rankMeals = (mealPreferences) => {
            const mealCounts = {};
            mealPreferences.forEach(meal => {
                mealCounts[meal] = (mealCounts[meal] || 0) + 1;
            });

            // Sort meals by popularity (descending) and then alphabetically by mealId.
            const sortedMeals = Object.entries(mealCounts).sort((
                [mealIdA, countA],
                [mealIdB, countB]
            ) => {
                if (countB !== countA) {
                    return countB - countA; // Sort by count first
                }
                return mealIdA.localeCompare(mealIdB); // Then sort alphabetically
            });

            const rankedMeals = [];
            let currentRank = 1;
            let previousCount = null;

            for (let i = 0; i < sortedMeals.length; i++) {
                const [mealId, count] = sortedMeals[i];

                if (previousCount === null) {
                    // For the first meal, always assign rank 1
                } else if (count < previousCount) {
                    currentRank = rankedMeals.length + 1; // Number of all meals that have already been ranked + 1
                }

                rankedMeals.push({ mealId, rank: currentRank });
                previousCount = count;
            }

            // Return the rankedMeals as an array of mealIds, preserving the order.
            return rankedMeals.map(({ mealId }) => mealId);
        };

        const breakfastRankings = rankMeals(allBreakfasts);
        const lunchRankings = rankMeals(allLunches);
        const dinnerRankings = rankMeals(allDinners);

        setMealRankings({
            breakfast: breakfastRankings,
            lunch: lunchRankings,
            dinner: dinnerRankings,
        });

        const initialHomePreferences = {};
        for (const homeId in homesData) {
            initialHomePreferences[homeId] = {
                breakfast: homesData[homeId].breakfast_preferences.sort((a, b) => {
                    const aCount = allBreakfasts.filter(id => id === a).length;
                    const bCount = allBreakfasts.filter(id => id === b).length;
                    return bCount - aCount;
                }),
                lunch: homesData[homeId].lunch_preferences.sort((a, b) => {
                    const aCount = allLunches.filter(id => id === a).length;
                    const bCount = allLunches.filter(id => id === b).length;
                    return bCount - aCount;
                }),
                dinner: homesData[homeId].dinner_preferences.sort((a, b) => {
                    const aCount = allDinners.filter(id => id === a).length;
                    const bCount = allDinners.filter(id => id === b).length;
                    return bCount - aCount;
                }),
            };
        }
        setHomePreferences(initialHomePreferences);

        // Initialize meal servings state
        const initialMealServings = {};
        for (const mealType of ['breakfast', 'lunch', 'dinner']) {
            const rankings = mealRankings[mealType];
            if (rankings) {
                rankings.forEach(mealId => {
                    initialMealServings[mealId] = optimizeServingsForMeal(mealId, 3);
                });
            }
        }
        setMealServings(initialMealServings);
    };

    const handleFileChange = (event) => {
        setXlsxFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!xlsxFile) {
            alert('Please select an XLSX file.');
            return;
        }

        setLoading(true);
        try {
            const jsonData = await parseXlsx(xlsxFile);
            const transformedHomes = transformXlsxData(jsonData);
            setHomes(transformedHomes);
            const mealsData = {
                breakfast: meals.filter(meal => meal.type === 'breakfast'),
                lunch: meals.filter(meal => meal.type === 'lunch'),
                dinner: meals.filter(meal => meal.type === 'dinner'),
            };
            compileMealPopularity(transformedHomes, mealsData);
        } catch (error) {
            console.error('Error parsing XLSX file:', error);
            alert('Error parsing XLSX file. Check file format and headers.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const onDragEnd = (result, mealType) => {
        if (!result.destination) return;

        const { source, destination } = result;
        if (source.droppableId !== destination.droppableId) {
            console.warn('Drag and drop between different droppables is not allowed. The code must be altered to do that');
            return;
        }

        const items = Array.from(homePreferences[currentHomeId][mealType]);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        setHomePreferences((prevPreferences) => ({
            ...prevPreferences,
            [currentHomeId]: {
                ...prevPreferences[currentHomeId],
                [mealType]: items,
            },
        }));
    };

    const handleServingChange = (mealId, value) => {
        setMealServings((prev) => ({ ...prev, [mealId]: parseInt(value) }));
    };

    const optimizeServingsForMeal = () => {
        return 1; // Default serving size
    };

    const getMealRanking = (mealId, mealType) => {
        const mealRankingArray = mealRankings[mealType];
        if (!mealRankingArray) {
            return 'N/A';
        }

        // Find the index of the meal in the ranked array
        const index = mealRankingArray.findIndex(id => id === mealId);
        if (index === -1) return 'N/A';

        // Get all meals with their counts for determining rank
        const mealPreferences = Object.values(homes).flatMap(home => home[`${mealType}_preferences`]);
        const mealCounts = {};
        mealPreferences.forEach(meal => {
            mealCounts[meal] = (mealCounts[meal] || 0) + 1;
        });

        // Get the count for the current meal
        const currentCount = mealCounts[mealId] || 0;
        let rank = 1;

        // Count how many meals have higher counts
        for (let i = 0; i < index; i++) {
            const otherMealId = mealRankingArray[i];
            if (mealCounts[otherMealId] > currentCount) {
                rank++;
            }
        }

        return rank.toString();
    };

    // Add new state for separate menus
  const [generatedMenus, setGeneratedMenus] = useState({
    breakfast: null,
    lunch: null,
    dinner: null
  });

  // New function to generate all menus at once
  const handleGenerateAllMenus = () => {
    const newMenus = {};
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const preferences = homePreferences[currentHomeId]?.[mealType] || [];
      newMenus[mealType] = generateMenu(preferences, mealServings, residents, meals);
    });
    setGeneratedMenus(prevMenus => ({
      ...prevMenus,
      [currentHomeId]: newMenus
    }));
  };

  const reorganizeToAvoidDuplicates = (menuArray) => {
    if (!menuArray || menuArray.length <= 1) return menuArray;
    
    const result = [...menuArray];
    
    for (let i = 1; i < result.length; i++) {
      if (result[i].mealName === result[i-1].mealName) {
        let swapIndex = -1;
        for (let j = i + 1; j < result.length; j++) {
          if (result[j].mealName !== result[i-1].mealName && 
              (j === result.length - 1 || result[j].mealName !== result[j+1].mealName) &&
              (i === result.length - 1 || result[j].mealName !== result[i+1].mealName)) {
            swapIndex = j;
            break;
          }
        }
        
        if (swapIndex !== -1) {
          [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
        }
      }
    }
    
    result.forEach((item, index) => {
      item.day = index + 1;
    });
    
    return result;
  };

  const renderMealTypeMenu = (mealType) => {
    const homeMenus = generatedMenus[currentHomeId];
    if (!homeMenus) return null;
    
    const menu = homeMenus[mealType];
    if (!menu) return null;

    const handleReorganizeMealType = () => {
        const reorganizedMenu = reorganizeToAvoidDuplicates(menu);
        setGeneratedMenus(prev => ({
          ...prev,
          [currentHomeId]: {
            ...prev[currentHomeId],
            [mealType]: reorganizedMenu
          }
        }));
      };

    // Split the menu into weeks (7 days each)
    const weeks = Array.from({ length: 4 }, (_, weekIndex) => 
      menu.slice(weekIndex * 7, (weekIndex + 1) * 7)
    );

    const onDragEndMenu = (result) => {
        if (!result.destination) return;
    
        const { source, destination } = result;
        const sourceWeek = parseInt(source.droppableId);
        const destWeek = parseInt(destination.droppableId);
        
        const newGeneratedMenus = { ...generatedMenus };
        const updatedMenu = [...menu];
        
        const sourceIndex = sourceWeek * 7 + source.index;
        const destIndex = destWeek * 7 + destination.index;
        
        const [movedItem] = updatedMenu.splice(sourceIndex, 1);
        updatedMenu.splice(destIndex, 0, movedItem);
        
        updatedMenu.forEach((item, index) => {
          item.day = index + 1;
        });
        
        newGeneratedMenus[currentHomeId] = {
          ...newGeneratedMenus[currentHomeId],
          [mealType]: updatedMenu
        };
        setGeneratedMenus(newGeneratedMenus);
      };

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold capitalize">{mealType} Menu</h3>
          <button
            onClick={handleReorganizeMealType}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Reorganize to Avoid Duplicates
          </button>
        </div>
        <DragDropContext onDragEnd={onDragEndMenu}>
          <div className="grid grid-cols-4 gap-4">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="bg-white rounded shadow">
                <div className="bg-gray-100 px-2 py-1 text-sm font-medium border-b">
                  Week {weekIndex + 1}
                </div>
                <Droppable droppableId={weekIndex.toString()}>
                  {(provided) => (
                    <ul 
                      className="text-sm min-h-[200px]"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {week.map((item, itemIndex) => (
                        <Draggable
                          key={`${item.day}-${item.mealType}`}
                          draggableId={`${item.day}-${item.mealType}`}
                          index={itemIndex}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="px-2 py-1 border-b last:border-b-0 hover:bg-gray-50 cursor-move"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Day {item.day}</span>
                                <span className="text-xs text-gray-500">
                                  {item.servings}/{item.leftoverServings}
                                </span>
                              </div>
                              <div className="truncate">
                                {item.mealName === "Use Leftovers" ? (
                                  <span className="text-blue-600">Use Leftovers</span>
                                ) : (
                                  <span>{item.mealName}</span>
                                )}
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    );
    }

  // Modified renderTabContent
  const renderTabContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (totalHomes === 0) {
      return <p className="text-center text-gray-500">No homes available.</p>;
    }

    switch (activeTab) {
      case 'mealRanking':
        return (
            <div className="p-2">
            {/* Header info */}
            <div className="mb-2 bg-white rounded shadow p-2">
              <div className="grid grid-cols-3 gap-2 items-center text-sm">
                <div>Home: <span className="font-semibold">{currentHomeId}</span></div>
                <div>Residents: <span className="font-semibold">{residents}</span></div>
                <div>
                  Restrictions: <span className="font-semibold">
                    {homes[currentHomeId].dietary_restrictions?.length ? 
                      homes[currentHomeId].dietary_restrictions.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>
                
            {/* Meal rankings grid */}
            <div className="grid grid-cols-3 gap-4">
      {['breakfast', 'lunch', 'dinner'].map((mealType) => (
        <div key={mealType} className="bg-white rounded shadow">
          <h4 className="text-base font-semibold capitalize bg-gray-100 p-2">{mealType} Rankings</h4>
          <div className="p-2">
            <DragDropContext onDragEnd={(result) => onDragEnd(result, mealType)}>
              <Droppable droppableId={currentHomeId.toString()}>
                {(provided) => (
                  <ul className="list-none p-0 space-y-1 text-base"
                    {...provided.droppableProps}
                    ref={provided.innerRef}>
                    {homePreferences[currentHomeId]?.[mealType]?.map((mealId, index) => {
                      const ranking = getMealRanking(mealId, mealType);
                      const meal = meals.find((m) => m.id === mealId);
                      const servingsOptions = meal?.servings || [];

                      return (
                        <Draggable
                          key={mealId.toString()}
                          draggableId={mealId.toString()}
                          index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded px-2 py-1 bg-gray-50 cursor-move text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-green-500 font-medium">#{ranking}</span>
                                <span className="truncate mx-2 flex-grow">{mealId}</span>
                                {servingsOptions.length > 1 ? (
                                  <select
                                    value={mealServings[mealId] || 1}
                                    onChange={(e) => handleServingChange(mealId, e.target.value)}
                                    className="border rounded text-sm p-0">
                                    {servingsOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span>{servingsOptions[0] || 1}</span>
                                )}
                              </div>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      ))}
              
              <button
                onClick={handleGenerateAllMenus}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out">
                Generate All Menus
              </button>
            </div>

            {/* Render each meal type menu separately */}
            <div className="mt-8">
              {renderMealTypeMenu('breakfast')}
              {renderMealTypeMenu('lunch')}
              {renderMealTypeMenu('dinner')}
            </div>
          </div>
        );
      default:
        return null;
    }
  };


    return (
        <div className="container mx-auto px-4 py-8">
            {loading ? (
                <div className="text-center">
                    <p>Loading...</p>
                </div>
            ) : (
                <div>
                    <div className="mb-4">
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            className="mr-2"
                        />
                        <button
                            onClick={handleUpload}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Upload XLSX
                        </button>
                    </div>

                    {totalHomes > 0 && (
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={handlePrevHome}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                ← Previous Home
                            </button>
                            <div className="text-center">
                                <span className="font-medium">
                                    Home {currentHomeIndex + 1} of {totalHomes}
                                </span>
                            </div>
                            <button
                                onClick={handleNextHome}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Next Home →
                            </button>
                        </div>
                    )}

                    <div className="mb-4">
                        <button
                            className={`mr-4 px-4 py-2 ${activeTab === 'mealRanking' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => handleTabClick('mealRanking')}
                        >
                            Meal Rankings
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'homePreferences' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => handleTabClick('homePreferences')}
                        >
                            Home Preferences
                        </button>
                    </div>

                    {renderTabContent()}
                </div>
            )}
        </div>
    );
};

export default MealPlanner;