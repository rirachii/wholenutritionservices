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
              {/* Meal card content remains the same */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        {/* Login form remains the same */}
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
                {/* Navigation tabs remain the same */}
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