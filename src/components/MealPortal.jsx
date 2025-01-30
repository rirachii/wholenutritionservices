import React, { useState } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MEAL_DATA } from '../data/meals';
import { MealDetails } from './MealDetails';

// ... (keep other constants)

function MealPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetails, setShowMealDetails] = useState(false);

  // ... (keep existing functions)

  const handleViewDetails = (meal) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };

  const renderMealSection = (type) => {
    let mealsToShow = MEAL_DATA[type] || [];
    mealsToShow = filterMeals(mealsToShow);

    if (mealsToShow.length === 0) return null;

    return (
      <div key={type} className="mb-12">
        <h2 className="text-2xl font-bold mb-6 capitalize border-b pb-2">
          {type}
          <span className="text-gray-500 text-sm ml-2">({mealsToShow.length} items)</span>
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mealsToShow.map((meal) => (
            <div key={meal.id} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={meal.image} 
                  alt={meal.name}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  {meal.calories} cal
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium flex-1">{meal.name}</h3>
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <span className="mr-3">{meal.prepTime}</span>
                    <span>{meal.servings}</span>
                  </div>
                  <div className="text-sm text-blue-600">{meal.season}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {meal.dietaryTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tag.includes('free') || tag === 'vegetarian' || tag === 'vegan'
                          ? 'bg-green-100 text-green-800'
                          : tag.includes('contains')
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {meal.dietaryTags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{meal.dietaryTags.length - 3} more
                    </span>
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors">
                    Add to Order
                  </button>
                  <button 
                    onClick={() => handleViewDetails(meal)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ... (keep login and other UI code)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... (keep existing JSX) */}
      <MealDetails
        meal={selectedMeal}
        isOpen={showMealDetails}
        onClose={() => setShowMealDetails(false)}
      />
    </div>
  );
}

export default MealPortal;