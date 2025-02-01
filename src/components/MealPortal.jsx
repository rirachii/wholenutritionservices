import React, { useState, useEffect } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Checkbox, Label } from '../components/ui/checkbox';
import { MEAL_DATA } from '../data/meals';
import mealData from '../data/meals.json';

const DIETARY_OPTIONS = [
  { id: 'Gluten', label: 'Gluten Free' },
  { id: 'Dairy', label: 'Dairy Free' },
  { id: 'Tree Nuts', label: 'Tree Nut Free' },
  { id: 'Peanuts', label: 'Peanut Free' },
  { id: 'Soy', label: 'Soy Free' },
  { id: 'Shellfish', label: 'Shellfish Free' },
  { id: 'Eggs', label: 'Egg Free' },
  { id: 'Sesame', label: 'Sesame Free' },
  { id: 'Pork', label: 'Pork Free' }
];

const PROTEIN_OPTIONS = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'beef', label: 'Beef' },
  { id: 'turkey', label: 'Turkey' },
  { id: 'shrimp', label: 'Shrimp' },
  { id: 'white_fish', label: 'White Fish' },
  { id: 'meatless', label: 'Meatless' },
  { id: 'salmon', label: 'Salmon' },
  { id: 'tuna', label: 'Tuna' }
];

const DUMMY_USER = {
  email: 'home1@example.com',
  password: 'password123',
  dietaryRestrictions: ['gluten-free']
};

function MealPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [expandedSections, setExpandedSections] = useState(['breakfast', 'lunch', 'dinner']);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const [proteinFilters, setProteinFilters] = useState([]);
  const [likedMeals, setLikedMeals] = useState([]);

  const handleFilterChange = (filterId) => {
    setDietaryFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      }
      return [...prev, filterId];
    });
  };

  const handleProteinFilterChange = (proteinId) => {
    setProteinFilters((prev) => {
      if (prev.includes(proteinId)) {
        return prev.filter((id) => id !== proteinId);
      }
      return [...prev, proteinId];
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const filterMeals = (meals) => {
    return meals.filter(meal => {
      // Filter by dietary restrictions
      if (dietaryFilters.length > 0) {
        return dietaryFilters.every(filter => {
          if (filter === 'Gluten') return meal.Gluten === 'no';
          if (filter === 'Dairy') return meal.Dairy === 'no' || meal.Dairy === 'optional';
          if (filter === 'Tree Nuts') return meal['Tree Nuts'] === 'no';
          if (filter === 'Peanuts') return meal.Peanuts === 'no';
          if (filter === 'Soy') return meal.Soy === 'no' || meal.Soy === 'optional';
          if (filter === 'Shellfish') return meal.Shellfish === 'no';
          if (filter === 'Eggs') return meal.Eggs === 'no';
          if (filter === 'Sesame') return meal.Sesame === 'no';
          if (filter === 'Pork') return meal.Pork === 'no';
          return true;
        });
      }

      // Filter by protein type
      if (proteinFilters.length > 0) {
        return proteinFilters.some(protein => meal.Protein === protein);
      }

      return true;
    });
  };

  const handleViewDetails = (meal) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };

  const toggleSection = (type) => {
    setExpandedSections(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const scrollToMeal = (mealId) => {
    const mealElement = document.getElementById(mealId);
    if (mealElement) {
      mealElement.scrollIntoView({ behavior: 'smooth' });
      mealElement.classList.add('highlight-meal');
      setTimeout(() => {
        mealElement.classList.remove('highlight-meal');
      }, 2000);
    }
  };

  const renderMealSection = (type) => {
    let mealsToShow = mealData[type] || [];
    mealsToShow = filterMeals(mealsToShow);

    if (mealsToShow.length === 0) return null;

    const isExpanded = expandedSections.includes(type);

    return (
      <div key={type} className="mb-12">
        <button 
          onClick={() => toggleSection(type)}
          className="w-full text-left text-2xl font-bold mb-2 capitalize flex items-center justify-between hover:text-blue-600 transition-colors bg-white p-4 rounded-lg shadow-sm"
        >
          <div>
            {type}
            <span className="text-gray-500 text-sm ml-2">({mealsToShow.length} items)</span>
          </div>
          <svg
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mealsToShow.map((meal) => (
                <div 
                  key={meal.id} 
                  id={meal.id}
                  className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow p-4 flex flex-col h-full"
                >
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium flex-1">{meal.name}</h3>
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm ml-2">
                  {meal.calories} cal
                </span>
              </div>
              <div className="mb-2 text-sm text-gray-600">
                <div className="flex items-center mb-1">
                  <span className="mr-3">{meal.prepTime}</span>
                  <span>{meal.servings}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-700">Sodium: {meal.sodium}mg</span>
                  <span className="text-gray-700">Carbs: {meal.carbs}g</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(meal)
                  .filter(([key, value]) => [
                    'Gluten', 'Dairy', 'Tree Nuts', 'Peanuts', 'Soy',
                    'Shellfish', 'Eggs', 'Sesame', 'Pork'
                  ].includes(key))
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        value === 'no'
                          ? 'bg-green-100 text-green-800'
                          : value === 'optional'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {value === 'no' ? `${key} Free` : 
                       value === 'optional' ? `${key} Optional` : 
                       `Contains ${key}`}
                    </span>
                  ))}
              </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleLikeMeal(meal)}
                  className={`w-full ${likedMeals.some(m => m.id === meal.id) ? 'bg-pink-200 text-pink-800' : 'bg-pink-600 text-white'} rounded-md py-2 hover:bg-pink-700 hover:text-white transition-colors`}
                >
                  {likedMeals.some(m => m.id === meal.id) ? 'Remove from Liked' : 'I would like this'}
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
        )}
      </div>
    );
  };

  const handleLikeMeal = (meal) => {
    setLikedMeals(prev => {
      if (prev.some(m => m.id === meal.id)) {
        return prev.filter(m => m.id !== meal.id);
      }
      return [...prev, meal];
    });
  };

  const renderLikedMealSection = (type) => {
    const mealsToShow = likedMeals.filter(meal => meal.type === type);
    if (mealsToShow.length === 0) return null;

    const isExpanded = expandedSections.includes(`liked-${type}`);

    return (
      <div key={type} className="mb-6">
        <button 
          onClick={() => toggleSection(`liked-${type}`)}
          className="w-full text-left text-xl font-bold mb-2 capitalize flex items-center justify-between hover:text-blue-600 transition-colors bg-white p-3 rounded-lg shadow-sm"
        >
          <div>
            {type}
            <span className="text-gray-500 text-sm ml-2">({mealsToShow.length})</span>
          </div>
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="space-y-2">
            {mealsToShow.map((meal) => (
              <div key={meal.id} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => scrollToMeal(meal.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium">{meal.name}</h4>
                  <button
                    onClick={() => handleLikeMeal(meal)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {meal.calories} cal · {meal.servings}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-8">Whole Nutrition Services</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  placeholder="home1@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700"
              >
                Log In
              </button>
            </form>
          </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Whole Nutrition Services</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('meals')}
                  className={`inline-flex items-center px-1 pt-1 ${
                    activeTab === 'meals' ? 'border-b-2 border-blue-500' : ''
                  }`}
                >
                  Meals
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`inline-flex items-center px-1 pt-1 ${
                    activeTab === 'settings' ? 'border-b-2 border-blue-500' : ''
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {DUMMY_USER.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'meals' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Select Meals You Would Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3">Dietary Restrictions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {DIETARY_OPTIONS.map(({ id, label }) => (
                        <div key={id} className="flex items-center space-x-2 p-2 rounded-md transition-colors border border-gray-100 hover:border-blue-200 hover:bg-blue-50">
                          <Checkbox
                            id={id}
                            checked={dietaryFilters.includes(id)}
                            onCheckedChange={() => handleFilterChange(id)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={id} className="text-sm cursor-pointer select-none">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {dietaryFilters.length > 0 && (
                      <button
                        onClick={() => setDietaryFilters([])}
                        className="mt-4 w-full py-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors border border-red-200 rounded-md hover:bg-red-50"
                      >
                        Clear Dietary Filters
                      </button>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3">Protein Options</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {PROTEIN_OPTIONS.map(({ id, label }) => (
                        <div key={id} className="flex items-center space-x-2 p-2 rounded-md transition-colors border border-gray-100 hover:border-blue-200 hover:bg-blue-50">
                          <Checkbox
                            id={`protein-${id}`}
                            checked={proteinFilters.includes(id)}
                            onCheckedChange={() => handleProteinFilterChange(id)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`protein-${id}`} className="text-sm cursor-pointer select-none">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {proteinFilters.length > 0 && (
                      <button
                        onClick={() => setProteinFilters([])}
                        className="mt-4 w-full py-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors border border-red-200 rounded-md hover:bg-red-50"
                      >
                        Clear Protein Filters
                      </button>
                    )}
                  </div>
                </div>
                {(dietaryFilters.length > 0 || proteinFilters.length > 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800">
                      {dietaryFilters.length > 0 && (
                        <span>
                          Dietary Filters: {dietaryFilters.map(filter => 
                            DIETARY_OPTIONS.find(opt => opt.id === filter)?.label
                          ).join(', ')}
                        </span>
                      )}
                      {dietaryFilters.length > 0 && proteinFilters.length > 0 && <span className="mx-2">|</span>}
                      {proteinFilters.length > 0 && (
                        <span>
                          Protein Filters: {proteinFilters.map(filter => 
                            PROTEIN_OPTIONS.find(opt => opt.id === filter)?.label
                          ).join(', ')}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              {['breakfast', 'lunch', 'dinner'].map(type => renderMealSection(type))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Liked Meals</h2>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {likedMeals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No meals liked yet. Click "I would like this" on any meal to add it here.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {['breakfast', 'lunch', 'dinner'].map(type => renderLikedMealSection(type))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email</h3>
                  <p className="text-gray-600">{DUMMY_USER.email}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Dietary Restrictions</h3>
                  <div className="flex flex-wrap gap-2">
                    {DUMMY_USER.dietaryRestrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="w-full bg-red-600 text-white rounded-md py-2 px-4 hover:bg-red-700 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MealPortal;