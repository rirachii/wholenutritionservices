import MEAL_DATA from './meals.json';

// API endpoint configuration
const BASE_URL = 'https://lively-crostata-509cae.netlify.app';
export const API_ENDPOINTS = {
  meals: `${BASE_URL}/get-json?key=meals.json`,
  bagging: `${BASE_URL}/get-json?key=bagging.json`,
  instructions: `${BASE_URL}/get-json?key=instructions.json`
};

// Generic fetch function with error handling
const fetchData = async (url, fallbackData = null) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format. Expected JSON');
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Invalid JSON response:', text);
      throw new Error('Invalid JSON response');
    }
  } catch (error) {
    console.error(`Error fetching data, using fallback data:`, error);
    return fallbackData;
  }
};

// Fetch meals from the API with fallback to local data
export const fetchMeals = async () => {
  return fetchData(API_ENDPOINTS.meals, MEAL_DATA);
};

// Fetch bagging data from the API
export const fetchBagging = async () => {
  return fetchData(API_ENDPOINTS.bagging, null);
};

// Fetch instructions data from the API
export const fetchInstructions = async () => {
  return fetchData(API_ENDPOINTS.instructions, null);
};