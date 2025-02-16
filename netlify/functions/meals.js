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
    const dataPath = path.join(__dirname, 'data', 'meals.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const meals = JSON.parse(data);

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