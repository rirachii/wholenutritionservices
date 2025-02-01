import React, { useState, useEffect } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Checkbox, Label } from '../components/ui/checkbox';
import { MEAL_DATA } from '../data/meals';

const DIETARY_OPTIONS = [
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'nut-free', label: 'Nut Free' },
  { id: 'low-carb', label: 'Low Carb' }
];

const DUMMY_USER = {
  email: 'home1@example.com',
  password: 'password123',
  dietaryRestrictions: ['gluten-free']
};

const SEASONS = ['Classic', 'Essential', 'Fall/Winter', 'Spring/Summer'];

function MealPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [expandedSections, setExpandedSections] = useState(['breakfast', 'lunch', 'dinner']);
  const [selectedSeasons, setSelectedSeasons] = useState(SEASONS);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState([]);

  const handleFilterChange = (filterId) => {
    setDietaryFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      }
      return [...prev, filterId];
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
      // Filter by season
      if (selectedSeasons.length > 0 && !selectedSeasons.includes(meal.season)) {
        return false;
      }

      // Filter by dietary restrictions
      if (dietaryFilters.length > 0 && !dietaryFilters.some(filter => meal.dietaryTags.includes(filter))) {
        return false;
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

  const renderMealSection = (type) => {
    let mealsToShow = MEAL_DATA[type] || [];
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
            <div key={meal.id} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow p-4">
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
                <div className="text-sm text-blue-600">{meal.season}</div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-700">Sodium: {meal.sodium}mg</span>
                  <span className="text-gray-700">Carbs: {meal.carbs}g</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {meal.dietaryTags.map((tag) => (
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
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="w-full bg-pink-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors">
                  I would like this
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
              <button
                onClick={() => setIsLoggedIn(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'meals' ? (
          <div>
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
                  <h3 className="text-base font-semibold mb-3">Seasons</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SEASONS.map((season) => (
                      <div key={season} className="flex items-center space-x-2 p-2 rounded-md transition-colors border border-gray-100 hover:border-blue-200 hover:bg-blue-50">
                        <Checkbox
                          id={`season-${season}`}
                          checked={selectedSeasons.includes(season)}
                          onCheckedChange={() => {
                            setSelectedSeasons(prev => {
                              if (prev.includes(season)) {
                                return prev.filter(s => s !== season);
                              }
                              return [...prev, season];
                            });
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`season-${season}`} className="text-sm cursor-pointer">
                          {season}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedSeasons.length > 0 && (
                    <button
                      onClick={() => setSelectedSeasons([])}
                      className="mt-4 w-full py-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors border border-red-200 rounded-md hover:bg-red-50"
                    >
                      Clear Seasons
                    </button>
                  )}
                </div>
              </div>
              {dietaryFilters.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">
                    Filtering by: {dietaryFilters.map(filter => 
                      DIETARY_OPTIONS.find(opt => opt.id === filter)?.label
                    ).join(', ')}
                  </p>
                </div>
              )}
            </div>
              {['breakfast', 'lunch', 'dinner'].map(type => renderMealSection(type))}
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MealPortal;