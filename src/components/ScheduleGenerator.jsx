import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { fetchMeals } from '../data/api';
import { PopularityCharts, HomePopularityCharts } from './PopularityCharts';
import { ServingSizeManager } from './ServingSizeManager';
import MenuGenerator from '../utils/MenuGenerator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function ScheduleGenerator() {
  const [homes, setHomes] = useState([]);
  const [menus, setMenus] = useState({});
  const [mealData, setMealData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [servingSizes, setServingSizes] = useState({});
  const [menuGenerator, setMenuGenerator] = useState(null);
  const [generatedHomes, setGeneratedHomes] = useState(new Set());
  const [showMealCards, setShowMealCards] = useState({});
  const [currentHomeIndex, setCurrentHomeIndex] = useState(0);
  const [orderedPreferences, setOrderedPreferences] = useState({});

  useEffect(() => {
    const loadMealData = async () => {
      try {
        const data = await fetchMeals();
        setMealData(data);
        initializeServingSizes(data);
        setMenuGenerator(new MenuGenerator(data));
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
        const newOrder = { ...orderedPreferences };
        transformedData.forEach(home => {
          newOrder[home.home_id] = {};
          ['breakfast', 'lunch', 'dinner'].forEach(type => {
            if (mealData[type]) {
              newOrder[home.home_id][type] = mealData[type]
                .slice() // clone
                .sort((a,b) => b.popularity - a.popularity)
                .map(meal => meal.id);
            } else {
              newOrder[home.home_id][type] = [];
            }
          });
        });
        setOrderedPreferences(newOrder);
        generateMenus(transformedData);
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
      }
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const [homeId, mealType] = result.source.droppableId.split('-');
    const newOrderedPreferences = { ...orderedPreferences };
    const list = Array.from(newOrderedPreferences[homeId][mealType]);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);
    newOrderedPreferences[homeId][mealType] = list;
    setOrderedPreferences(newOrderedPreferences);
  };

  const generateMenus = (homesData) => {
    if (!menuGenerator) return;
    const generatedMenus = {};
    const newGeneratedHomes = new Set(generatedHomes);
    const newShowMealCards = { ...showMealCards };

    homesData.forEach(home => {
      const homeServingSizes = servingSizes[home.home_id] || {};
      const residents = parseInt(home.residents) || 1;
      generatedMenus[home.home_id] = { breakfast: [], lunch: [], dinner: [] };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const preferences = orderedPreferences[home.home_id]?.[mealType] ||
          home[`${mealType}_preferences`].split(',');
        
        if (residents === 3) {
          generatedMenus[home.home_id][mealType] = menuGenerator.generateMenuFor3Residents(preferences, mealType, homesData);
        } else {
          generatedMenus[home.home_id][mealType] = menuGenerator.generateRegularMenu(
            preferences,
            mealType,
            residents,
            homeServingSizes[mealType] || {}
          );
        }
      });
      newGeneratedHomes.add(home.home_id);
      newShowMealCards[home.home_id] = true;
    });

    setMenus(generatedMenus);
    setGeneratedHomes(newGeneratedHomes);
    setShowMealCards(newShowMealCards);
  };

  const nextHome = () => {
    setCurrentHomeIndex((prevIndex) => (prevIndex + 1) % homes.length);
  };

  const prevHome = () => {
    setCurrentHomeIndex((prevIndex) => (prevIndex - 1 + homes.length) % homes.length);
  };

  const MealCard = ({ day, meals }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-2">Day {day}</h3>
      {Object.entries(meals).map(([type, mealList]) => (
        <div key={type} className="mb-2">
          <h4 className="text-sm font-medium capitalize">{type}</h4>
          {mealList.map((meal, index) => (
            <div key={index} className="text-sm">
              <p className={meal.isNewMeal ? 'text-green-600' : 'text-red-600'}>{meal.dish}</p>
              {meal.isNewMeal ? (
                <p className="text-xs text-gray-500">
                  New meal - {meal.totalServings} servings
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Leftover from Day {meal.fromDay}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const currentHome = homes[currentHomeIndex];
  const currentHomeMenu = menus[currentHome?.home_id];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meal Plan Generator</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-6 block"
      />

      <PopularityCharts homes={homes} mealData={mealData} />

      <div className="flex justify-between mt-4">
        <button onClick={prevHome} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Previous Home
        </button>
        <button onClick={nextHome} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Next Home
        </button>
      </div>

      {currentHome && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Home {currentHome.home_id}</h2>
          <div className="text-sm text-gray-600 mb-4">
            <p>Residents: {currentHome.residents || 'N/A'}</p>
            <p>Dietary Restrictions: {currentHome.dietary_restrictions || 'None'}</p>
          </div>

          <ServingSizeManager
            homeId={currentHome.home_id}
            home={currentHome}
            mealData={mealData}
            servingSizes={servingSizes}
            onServingSizeChange={handleServingSizeChange}
            onGenerateSchedule={(home) => generateMenus([home])}
          />

          <div className="mt-4">
            <h3 className="mb-2 text-lg font-medium">Reorder Meals by Popularity</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              {['breakfast', 'lunch', 'dinner'].map(mealType => (
                <div key={mealType} className="mb-4">
                  <h4 className="capitalize font-semibold">{mealType}</h4>
                  <Droppable droppableId={`${currentHome.home_id}-${mealType}`}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="p-2 bg-white rounded shadow">
                        {orderedPreferences[currentHome.home_id]?.[mealType]?.map((mealId, index) => {
                          const meal = mealData[mealType]?.find(m => m.id === mealId);
                          return (
                            <Draggable key={mealId} draggableId={mealId} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-2 border-b last:border-0">
                                  {meal ? meal.name : mealId}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </div>

          <div className="sticky top-4 z-10 bg-gray-50 py-4">
            <HomePopularityCharts homeId={currentHome.home_id} homes={homes} mealData={mealData} />
          </div>

          {showMealCards[currentHome.home_id] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 28 }, (_, i) => {
                const day = i + 1;
                const meals = {
                  breakfast: currentHomeMenu.breakfast.filter(meal => meal.day === day),
                  lunch: currentHomeMenu.lunch.filter(meal => meal.day === day),
                  dinner: currentHomeMenu.dinner.filter(meal => meal.day === day)
                };
                return <MealCard key={day} day={day} meals={meals} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}