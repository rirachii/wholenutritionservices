import React from 'react';

export const ServingSizeSelector = ({ homeId, mealType, preferences, mealData, servingSizes, onServingSizeChange }) => {
  if (!preferences || preferences.length === 0) return null;

  // Convert preferences string to array and count meal frequencies
  const mealFrequencies = preferences.split(',').reduce((acc, mealId) => {
    acc[mealId] = (acc[mealId] || 0) + 1;
    return acc;
  }, {});

  // Create sorted array of meal IDs based on frequency
  const sortedMealIds = preferences.split(',').sort((a, b) => {
    return mealFrequencies[b] - mealFrequencies[a];
  });

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 capitalize">{mealType} Serving Sizes</h4>
      <div className="space-y-2">
        {sortedMealIds.map(mealId => {
          const meal = mealData[mealType]?.find(m => m.id === mealId);
          if (!meal) return null;

          const servingSize = meal.servings || 4;
          const hasMultipleServings = Array.isArray(servingSize) && servingSize.length > 1;

          return (
            <div key={mealId} className="flex items-center justify-between gap-2">
              <label className="text-sm">{meal.name}</label>
              {hasMultipleServings ? (
                <select
                  className="form-select text-sm border rounded px-2 py-1"
                  value={servingSizes[homeId]?.[mealType]?.[mealId] || servingSize[0]}
                  onChange={(e) => onServingSizeChange(homeId, mealType, mealId, e.target.value)}
                >
                  {servingSize.map(size => (
                    <option key={size} value={size}>{size} servings</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-gray-600">{typeof servingSize === 'number' ? servingSize : servingSize[0]} servings</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ServingSizeManager = ({ homeId, home, mealData, servingSizes, onServingSizeChange, onGenerateSchedule }) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Configure Serving Sizes</h3>
      <ServingSizeSelector
        homeId={homeId}
        mealType="breakfast"
        preferences={home.breakfast_preferences}
        mealData={mealData}
        servingSizes={servingSizes}
        onServingSizeChange={onServingSizeChange}
      />
      <ServingSizeSelector
        homeId={homeId}
        mealType="lunch"
        preferences={home.lunch_preferences}
        mealData={mealData}
        servingSizes={servingSizes}
        onServingSizeChange={onServingSizeChange}
      />
      <ServingSizeSelector
        homeId={homeId}
        mealType="dinner"
        preferences={home.dinner_preferences}
        mealData={mealData}
        servingSizes={servingSizes}
        onServingSizeChange={onServingSizeChange}
      />
      <button
        onClick={() => onGenerateSchedule(home)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Generate Schedule
      </button>
    </div>
  );
};