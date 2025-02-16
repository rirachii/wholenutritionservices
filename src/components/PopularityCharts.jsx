import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PopularityCharts = ({ homes, mealData }) => {
  const calculateMealPopularity = (homes, mealType) => {
    const mealCounts = {};
    const mealHomes = {};
    
    homes.forEach(home => {
      const preferences = home[`${mealType}_preferences`]?.split(',') || [];
      preferences.forEach(mealId => {
        if (mealId) {
          const meal = mealData[mealType].find(m => m.id === mealId);
          if (meal) {
            mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1;
            if (!mealHomes[meal.name]) mealHomes[meal.name] = [];
            mealHomes[meal.name].push(home.phone);
          }
        }
      });
    });
  
    return Object.entries(mealCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        homes: mealHomes[name]
      }))
      .sort((a, b) => b.count - a.count);
  };

  if (homes.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Meal Popularity</h2>
      <div className="space-y-6">
        {['breakfast', 'lunch', 'dinner'].map(mealType => (
          <div key={mealType} className="bg-white p-4 pb-2 rounded-lg shadow-sm w-full">
            <h3 className="text-base font-medium mb-3 capitalize">{mealType} Popularity</h3>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              <BarChart width={600} height={Math.max(300, calculateMealPopularity(homes, mealType).length * 25)} data={calculateMealPopularity(homes, mealType)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax']} tickCount={5} allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'count') {
                      return [
                        `${Math.round(value)}`,
                        'Count'
                      ];
                    }
                    return [value, name];
                  }}
                  contentStyle={{ fontSize: '12px' }}
                  wrapperStyle={{ whiteSpace: 'pre-line' }}
                />
                <Bar dataKey="count" fill="#8884d8" barSize={18} />
              </BarChart>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HomePopularityCharts = ({ homeId, homes, mealData }) => {
  const calculateHomeSpecificPopularity = (homeId, homes, mealType) => {
    const currentHome = homes.find(h => h.home_id === homeId);
    if (!currentHome) return [];

    const homeMealIds = currentHome[`${mealType}_preferences`]?.split(',') || [];
    const mealCounts = {};
    const mealHomes = {};
    
    homes.forEach(home => {
      const preferences = home[`${mealType}_preferences`]?.split(',') || [];
      preferences.forEach(mealId => {
        if (mealId && homeMealIds.includes(mealId)) {
          const meal = mealData[mealType].find(m => m.id === mealId);
          if (meal) {
            mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1;
            if (!mealHomes[meal.name]) mealHomes[meal.name] = [];
            mealHomes[meal.name].push(home.phone);
          }
        }
      });
    });
  
    return Object.entries(mealCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        homes: mealHomes[name]
      }))
      .sort((a, b) => b.count - a.count);
  };

  if (homes.length === 0) return null;

  return (
    <div className="mb-2">
      <p className="text-lg font-semibold mb-4">Home: {homeId} Meal Rankings</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['breakfast', 'lunch', 'dinner'].map(mealType => {
          const popularityData = calculateHomeSpecificPopularity(homeId, homes, mealType);
          if (popularityData.length === 0) return null;

          return (
            <div key={mealType} className="bg-white p-4 rounded-lg shadow-sm w-full overflow-y-auto" style={{ maxHeight: '400px' }}>
              <h4 className="text-sm font-medium mb-4 capitalize">{mealType} Popularity</h4>
              <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                <BarChart width={280} height={Math.max(150, popularityData.length * 25)} data={popularityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} tickCount={5} allowDecimals={false} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'count') {
                        return [
                          `${Math.round(value)}`,
                          'Count'
                        ];
                      }
                      return [value, name];
                    }}
                    contentStyle={{ fontSize: '11px' }}
                    wrapperStyle={{ whiteSpace: 'pre-line' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" barSize={15} />
                </BarChart>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};