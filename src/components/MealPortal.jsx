import React, { useState, useEffect } from 'react';
import { Checkbox, Label } from '../components/ui/checkbox';
import Papa from 'papaparse';
import mealData from '../data/meals.json';
import { SettingsModal } from './SettingsModal';
import { LoginPage } from './LoginPage';


const PROTEIN_OPTIONS = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'beef', label: 'Beef' },
  { id: 'pork', label: 'Pork' },
  { id: 'turkey', label: 'Turkey' },
  { id: 'shrimp', label: 'Shrimp' },
  { id: 'white fish', label: 'White Fish' },
  { id: 'meatless', label: 'Meatless' },
  { id: 'salmon', label: 'Salmon' },
  { id: 'tuna', label: 'Tuna' },
];

const SEASONS = ['spring/summer', 'fall/winter', 'classic', 'essential'];

const DUMMY_USER = {
  email: 'home1@example.com',
  password: 'password123',
};

const MealPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['breakfast', 'lunch', 'dinner']);
  const [proteinFilters, setProteinFilters] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [likedMeals, setLikedMeals] = useState([]);
  const [userInfo, setUserInfo] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    return {
      email: DUMMY_USER.email,
      phoneNumber: savedData.phoneNumber || '',
      householdSize: savedData.householdSize || 1,
      dietaryRestrictions: savedData.dietaryRestrictions || {}
    };
  });

  const filterMeals = (meals) => {
    return meals.filter(meal => {
      // Get dietary restrictions from userInfo
      const restrictions = userInfo.dietaryRestrictions || {};
      
      // Check dietary restrictions
      if (restrictions.gluten && meal.Gluten === 'yes') return false;
      if (restrictions.dairy && meal.Dairy === 'yes') return false;
      if (restrictions.treeNuts && meal['Tree Nuts'] === 'yes') return false;
      if (restrictions.peanuts && meal.Peanuts === 'yes') return false;
      if (restrictions.soy && meal.Soy === 'yes') return false;
      if (restrictions.shellfish && meal.Shellfish === 'yes') return false;
      if (restrictions.eggs && meal.Eggs === 'yes') return false;
      if (restrictions.sesame && meal.Sesame === 'yes') return false;
      if (restrictions.vegetarian && !['meatless', 'vegan', 'vegan optional'].includes(meal.Protein.toLowerCase())) return false;
      if (restrictions.vegan && !['vegan', 'vegan optional'].includes(meal.Protein.toLowerCase())) return false;

      // Filter by protein type if selected
      if (proteinFilters.length > 0) {
        const mealProtein = meal.Protein.toLowerCase();
        if (!proteinFilters.some(protein => mealProtein.includes(protein))) return false;
      }

      // Filter by season if selected
      if (selectedSeasons.length > 0 && !selectedSeasons.includes(meal.season)) return false;

      return true;
    });
  };

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
      setShowSettingsModal(true);
    } else {
      setError('Invalid credentials');
    }
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {mealsToShow.map((meal) => (
                <div 
                  key={meal.id} 
                  id={meal.id}
                  className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow p-4 flex flex-col h-full"
                >
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium flex-1">{meal.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
                <div className="flex flex-col items-end gap-1">
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  {meal.calories} cal
                </span>
                <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                  {meal.Protein.toLowerCase() === 'vegetarian' ?
                    (meal.Eggs === 'no' && meal.Dairy === 'no' ? 'Vegan' :
                     (meal.Eggs === 'optional' || meal.Dairy === 'optional') ? 'Vegan Optional' :
                     'Vegetarian')
                    : meal.Protein.charAt(0).toUpperCase() + meal.Protein.slice(1)}
                </span>
                </div>
                </div>
              <div className="mb-2 text-sm text-gray-600">
              <span className="text-blue-700 capitalize">{meal.season}</span>

                <div className="flex items-center mb-1">
                  <span className="mr-3">{meal.prepTime}</span>
                  <span>{meal.servings}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-700">Sodium: {meal.sodium}mg</span>
                <span className="text-gray-700">Carbs: {meal.carbs}g</span>
                </div>
                <div className="mt-1">
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

  const handleExportCSV = () => {
    if (likedMeals.length === 0) {
      setError('No liked meals to export');
      return;
    }

    // Group meals by type
    const mealsByType = likedMeals.reduce((acc, meal) => {
      if (!acc[meal.type]) acc[meal.type] = [];
      acc[meal.type].push(meal.id);
      return acc;
    }, { breakfast: [], lunch: [], dinner: [] });

    // Create CSV data
    const csvData = [{
      home_id: userInfo.email.split('@')[0],
      phone: userInfo.phoneNumber || '',
      email: userInfo.email || '',
      residents: userInfo.householdSize || '',
      dietary_restrictions: Object.entries(userInfo.dietaryRestrictions || {})
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(','),
      breakfast_preferences: mealsByType.breakfast.join(','),
      lunch_preferences: mealsByType.lunch.join(','),
      dinner_preferences: mealsByType.dinner.join(',')
    }];

    // Convert to CSV using PapaParse
    const csvContent = Papa.unparse(csvData);

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'liked_meals.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess('Liked meals exported successfully');
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          if (!results.data || !results.data.length) {
            setError('Invalid file format');
            return;
          }

          const importedMeals = results.data
            .filter(row => row.ID)
            .map(row => {
              return Object.values(mealData)
                .flat()
                .find(meal => meal.id === row.ID);
            })
            .filter(meal => meal); // Remove any undefined meals
  
        setLikedMeals(prev => {
          const newMeals = [...prev];
          importedMeals.forEach(meal => {
            if (!newMeals.some(m => m.id === meal.id)) {
              newMeals.push(meal);
            }
          });
          return newMeals;
        });
        setSuccess('Meals imported successfully');
      } catch (error) {
        setError('Error importing meals');
      }
    }});

  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  const handleSettingsUpdate = (data) => {
    setUserInfo(prev => ({
      ...prev,
      phoneNumber: data.phoneNumber,
      householdSize: data.householdSize,
      dietaryRestrictions: data.dietaryRestrictions
    }));

    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(data));
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      setShowSettingsModal(true);
      setActiveTab('meals');
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <LoginPage onLogin={() => {
          setIsLoggedIn(true);
          setShowSettingsModal(true);
        }} />
      ) : (
        <>
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            userInfo={userInfo}
            onUpdate={handleSettingsUpdate}
            onSignOut={handleSignOut}
          />
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between py-4 sm:h-16">
                <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
                  <div className="flex-shrink-0 flex items-center mb-4 sm:mb-0">
                    <h1 className="text-lg sm:text-xl font-bold">Whole Nutrition Services</h1>
                  </div>
                  <div className="flex space-x-4 sm:ml-6 sm:space-x-8">
                    <button className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm sm:text-base">
                      Meals
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="inline-flex items-center px-1 pt-1 hover:border-b-2 hover:border-blue-500 transition-colors text-sm sm:text-base"
                    >
                      Update Info
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleExportCSV}
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Export Summary
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Sign Out
                  </button>
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
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-medium mb-4">Protein Type</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {PROTEIN_OPTIONS.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option.id}
                                  checked={proteinFilters.includes(option.id)}
                                  onCheckedChange={() => handleProteinFilterChange(option.id)}
                                />
                                <Label htmlFor={option.id}>{option.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-4">Season</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {SEASONS.map((season) => (
                              <div key={season} className="flex items-center space-x-2">
                                <Checkbox
                                  id={season}
                                  checked={selectedSeasons.includes(season)}
                                  onCheckedChange={() => {
                                    setSelectedSeasons((prev) =>
                                      prev.includes(season)
                                        ? prev.filter((s) => s !== season)
                                        : [...prev, season]
                                    );
                                  }}
                                />
                                <Label htmlFor={season} className="capitalize">{season}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {Object.entries(userInfo.dietaryRestrictions).filter(([_, value]) => value).length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800">
                          <span>
                            Active Dietary Restrictions: {Object.entries(userInfo.dietaryRestrictions)
                              .filter(([_, value]) => value)
                              .map(([key]) => {
                                const label = key === 'treeNuts' ? 'Tree Nuts' :
                                            key === 'gluten' ? 'Gluten' :
                                            key === 'dairy' ? 'Dairy' :
                                            key === 'peanuts' ? 'Peanuts' :
                                            key === 'soy' ? 'Soy' :
                                            key === 'shellfish' ? 'Shellfish' :
                                            key === 'eggs' ? 'Eggs' :
                                            key === 'sesame' ? 'Sesame' :
                                            key === 'vegetarian' ? 'Vegetarian' :
                                            key === 'vegan' ? 'Vegan' : key;
                                return label;
                              }).join(', ')}
                          </span>
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
                        <button
                          className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors mt-4"
                          onClick={async () => {
                            if (!process.env.REACT_APP_MAILJET_API_KEY || !process.env.REACT_APP_MAILJET_SECRET_KEY) {
                              alert('Email service is not configured. Please contact support.');
                              return;
                            }
                            setError('');
                            setSuccess('');
                            try {
                              const response = await fetch('https://api.mailjet.com/v3.1/send', {
                                method: 'POST',
                                mode: 'cors',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Basic ${btoa(process.env.REACT_APP_MAILJET_API_KEY + ':' + process.env.REACT_APP_MAILJET_SECRET_KEY)}`
                                },
                                body: JSON.stringify({
                                  Messages: [{
                                    From: {
                                      Email: "webportal@wholenutritionservices.com",
                                      Name: "Whole Nutrition Services Web Portal"
                                    },
                                    To: [
                                      {
                                        Email: "dopehods@gmail.com",
                                        Name: "Sarah"
                                      },
                                      {
                                        Email: userInfo.email,
                                        Name: userInfo.email.split('@')[0] || "Client"
                                      }
                                    ],
                                    Subject: "New Meal Selections",
                                    TextPart: `New meal selections from ${userInfo.email.split('@')[0] || 'Client'}:\n\n${likedMeals.map(meal => 
                                      `${meal.name}\n- Calories: ${meal.calories}\n- Prep Time: ${meal.prepTime}\n- Servings: ${meal.servings}\n\n`
                                    ).join('')}`,
                                    HTMLPart: `<h3>New meal selections from ${userInfo.email.split('@')[0] || 'Client'}</h3>
                                    <ul>${likedMeals.map(meal => 
                                      `<li>
                                        <strong>${meal.name}</strong><br>
                                        Calories: ${meal.calories}<br>
                                        Prep Time: ${meal.prepTime}<br>
                                        Servings: ${meal.servings}
                                      </li>`
                                    ).join('')}</ul>`
                                  }]
                                })
                              });

                              if (!response.ok) {
                                throw new Error('Failed to send email');
                              }

                              alert('Meals sent successfully to Sarah!');
                            } catch (error) {
                              console.error('Error sending email:', error);
                              alert('Failed to send meals. Please try again later.');
                            }
                          }}
                        >
                          Send to Sarah!
                        </button>
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
        </>
      )}
    </div>
  );
}

export default MealPortal;