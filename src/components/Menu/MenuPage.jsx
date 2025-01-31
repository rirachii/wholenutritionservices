import React, { useState } from 'react';
import { MEAL_DATA } from '../../data/mealData';
import MenuFilter from './MenuFilter';
import MealCard from './MealCard';

const MenuPage = () => {
  const [dietaryFilters, setDietaryFilters] = useState([]);

  const filterMeals = (meals, filters) => {
    if (filters.length === 0) return meals;

    return meals.filter(meal => {
      // If any of the selected filters are in the meal's dietary tags, show the meal
      return filters.some(filter => meal.dietaryTags.includes(filter));
    });
  };

  const renderMealSection = (title, meals) => {
    const filteredMeals = filterMeals(meals, dietaryFilters);

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
      
      <MenuFilter onFilterChange={setDietaryFilters} />

      {renderMealSection('Breakfast', MEAL_DATA.breakfast)}
      {renderMealSection('Lunch', MEAL_DATA.lunch)}
      {renderMealSection('Dinner', MEAL_DATA.dinner)}
    </div>
  );
};

export default MenuPage;