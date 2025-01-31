import React, { useState, useEffect } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { MEAL_DATA } from '../data/meals';
import { MealDetails } from './MealDetails';

const DIETARY_OPTIONS = [
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
  { id: 'dairy-optional', label: 'Dairy Optional' },
  { id: 'contains-tree-nuts', label: 'Contains Tree Nuts' },
  { id: 'contains-eggs', label: 'Contains Eggs' },
  { id: 'contains-dairy', label: 'Contains Dairy' },
  { id: 'contains-gluten', label: 'Contains Gluten' },
  { id: 'contains-cashews', label: 'Contains Cashews' },
];

const SEASONS = ['Classic', 'Essential', 'Fall/Winter', 'Spring/Summer'];

function MealPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState(() => {
    const saved = localStorage.getItem('dietaryFilters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dietaryFilters', JSON.stringify(dietaryFilters));
  }, [dietaryFilters]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'home1@example.com' && password === 'password123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleFilterChange = (filterId) => {
    setDietaryFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      }
      return [...prev, filterId];
    });
  };

  const filterMeals = (meals) => {
    return meals.filter(meal => {
      // Filter by season
      if (selectedSeason !== 'all' && meal.season !== selectedSeason) {
        return false;
      }

      // Filter by dietary restrictions
      if (dietaryFilters.length > 0) {
        return dietaryFilters.some(filter => 
          meal.dietaryTags.includes(filter)
        );
      }

      return true;
    });
  };

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
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <Filter className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Dietary Preferences</h3>
                    <div className="space-y-4">
                      {DIETARY_OPTIONS.map(({ id, label }) => (
                        <div key={id} className="flex items-center space-x-2">
                          <Checkbox
                            id={id}
                            checked={dietaryFilters.includes(id)}
                            onCheckedChange={() => handleFilterChange(id)}
                          />
                          <Label htmlFor={id} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <span className="text-gray-700">
                Welcome, {email}
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Weekly Menu</h2>
                <div className="flex space-x-4">
                  <select 
                    className="border rounded-md px-3 py-2"
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                  >
                    <option value="all">All Meals</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                  <select
                    className="border rounded-md px-3 py-2"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                  >
                    <option value="all">All Seasons</option>
                    {SEASONS.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
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
            {selectedMealType === 'all' ? (
              <>
                {renderMealSection('breakfast')}
                {renderMealSection('lunch')}
                {renderMealSection('dinner')}
              </>
            ) : (
              renderMealSection(selectedMealType)
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email</h3>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <MealDetails
        meal={selectedMeal}
        isOpen={showMealDetails}
        onClose={() => setShowMealDetails(false)}
      />
    </div>
  );
}

export default MealPortal;