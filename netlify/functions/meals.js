// netlify/functions/meals.js
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const dataPath = path.join(__dirname, 'data');
    const meals = {
      breakfast: [],
      lunch: [],
      dinner: []
    };
    
    // Read each meal type file
    for (const type of Object.keys(meals)) {
      try {
        const filePath = path.join(dataPath, `${type}.json`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const parsedContent = JSON.parse(fileContent);
        
        // Validate each meal object has required fields
        meals[type] = parsedContent.map(meal => ({
          name: meal.name || '',
          id: meal.id || '',
          calories: meal.calories || 0,
          prepTime: meal.prepTime || '',
          servings: meal.servings || '',
          season: meal.season || '',
          sodium: meal.sodium || 0,
          carbs: meal.carbs || 0,
          Gluten: meal.Gluten || 'no',
          Dairy: meal.Dairy || 'no',
          'Tree Nuts': meal['Tree Nuts'] || 'no',
          Protein: meal.Protein || 'Meatless',
          Eggs: meal.Eggs || 'no',
          Peanuts: meal.Peanuts || 'no',
          Soy: meal.Soy || 'no',
          Shellfish: meal.Shellfish || 'no',
          Almonds: meal.Almonds || 'no',
          Coconut: meal.Coconut || 'no',
          Cashews: meal.Cashews || 'no',
          Sesame: meal.Sesame || 'no',
          Pork: meal.Pork || 'no',
          type: meal.type || type
        }));
      } catch (error) {
        console.warn(`Warning: Could not read ${type}.json:`, error.message);
        meals[type] = [];
      }
    }

    // Check if we have any meal data
    const hasMeals = Object.values(meals).some(mealArray => mealArray.length > 0);
    if (!hasMeals) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'No meal data available',
          message: 'Please upload meal data through the admin interface'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(meals)
    };

  } catch (error) {
    console.error('Error serving meals:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Error retrieving meal data'
      })
    };
  }
};