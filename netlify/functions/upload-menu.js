// netlify/functions/upload-menu.js
const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const { getStore } = require('@netlify/blobs');

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request body' })
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { fileContent } = parsedBody;
    
    if (!fileContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing fileContent in request body' })
      };
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(fileContent, 'base64');
    
    // Read Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Process each meal type sheet
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const results = {};
    const store = getStore();

    for (const mealType of mealTypes) {
      const sheetName = mealType.charAt(0).toUpperCase() + mealType.slice(1);
      
      if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Transform data to match the expected format
        const transformedData = data.map(item => ({
          name: item.Name || '',
          id: (item.Name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          calories: parseInt(item.Calories) || 0,
          prepTime: item.PrepTime || '',
          servings: item.Servings || '',
          season: (item.Season || '').toLowerCase(),
          sodium: parseInt(item.Sodium) || 0,
          carbs: parseInt(item.Carbs) || 0,
          Gluten: item.Gluten || 'no',
          Dairy: item.Dairy || 'no',
          'Tree Nuts': item['Tree Nuts'] || 'no',
          Protein: item.Protein || 'Meatless',
          Eggs: item.Eggs || 'no',
          Peanuts: item.Peanuts || 'no',
          Soy: item.Soy || 'no',
          Shellfish: item.Shellfish || 'no',
          Almonds: item.Almonds || 'no',
          Coconut: item.Coconut || 'no',
          Cashews: item.Cashews || 'no',
          Sesame: item.Sesame || 'no',
          Pork: item.Pork || 'no',
          type: mealType
        }));

        // Save to blob storage
        await store.set(`meals/${mealType}`, JSON.stringify(transformedData));
        results[mealType] = transformedData.length;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Menu data updated successfully',
        counts: results
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error processing upload',
        details: error.message
      })
    };
  }
}