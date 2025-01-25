import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const DUMMY_MEALS = [
  { 
    id: 1, 
    name: 'Gluten-Free Pancakes', 
    type: 'breakfast', 
    calories: 450, 
    dietaryTags: ['gluten-free', 'vegetarian'],
    image: '/api/placeholder/200/200'
  },
  { 
    id: 2, 
    name: 'Nut-Free Chicken Salad', 
    type: 'lunch', 
    calories: 350, 
    dietaryTags: ['nut-free', 'high-protein'],
    image: '/api/placeholder/200/200'
  },
  { 
    id: 3, 
    name: 'Vegan Buddha Bowl', 
    type: 'dinner', 
    calories: 500, 
    dietaryTags: ['vegan', 'gluten-free'],
    image: '/api/placeholder/200/200'
  },
  { 
    id: 4, 
    name: 'Fruit Parfait', 
    type: 'breakfast', 
    calories: 300, 
    dietaryTags: ['vegetarian', 'gluten-free'],
    image: '/api/placeholder/200/200'
  },
  { 
    id: 5, 
    name: 'Mediterranean Wrap', 
    type: 'lunch', 
    calories: 450, 
    dietaryTags: ['vegetarian'],
    image: '/api/placeholder/200/200'
  },
  { 
    id: 6, 
    name: 'Chocolate Mousse', 
    type: 'dessert', 
    calories: 250, 
    dietaryTags: ['gluten-free'],
    image: '/api/placeholder/200/200'
  }
];

const DUMMY_USER = {
  email: 'home1@example.com',
  password: 'password123',
  dietaryRestrictions: ['gluten-free']
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'dessert'];

function MealPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [meals, setMeals] = useState(DUMMY_MEALS);
  const [activeTab, setActiveTab] = useState('meals');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      setIsLoggedIn(true);
      setError('');
      setMeals(DUMMY_MEALS.filter(meal => 
        meal.dietaryTags.some(tag => DUMMY_USER.dietaryRestrictions.includes(tag))
      ));
    } else {
      setError('Invalid credentials');
    }
  };

  const renderMealSection = (type) => {
    const filteredMeals = meals.filter(meal => meal.type === type);
    if (filteredMeals.length === 0) return null;

    return (
      <div key={type} className="mb-8">
        <h2 className="text-2xl font-bold mb-4 capitalize">{type}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeals.map((meal) => (
            <div key={meal.id} className="bg-white overflow-hidden shadow rounded-lg flex">
              <div className="w-1/3">
                <img 
                  src={meal.image} 
                  alt={meal.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 w-2/3">
                <h3 className="text-lg font-medium">{meal.name}</h3>
                <p className="mt-1 text-gray-500">{meal.calories} calories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {meal.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
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
            <div className="flex items-center">
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
            {MEAL_TYPES.map(type => renderMealSection(type))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="p-4">
              <h2 className="text-lg font-medium">Account Settings</h2>
              <div className="mt-4">
                <p>Email: {DUMMY_USER.email}</p>
                <p className="mt-2">Dietary Restrictions:</p>
                <ul className="mt-1 list-disc list-inside">
                  {DUMMY_USER.dietaryRestrictions.map((restriction) => (
                    <li key={restriction}>{restriction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MealPortal;