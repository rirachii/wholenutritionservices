import mealsData from './meals.json';
// API endpoint configuration
export const API_URL = 'https://lively-crostata-509cae.netlify.app/get-meals';

// Fetch meals from the API with fallback to local data
export const fetchMeals = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch meals');
    
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
    console.error('Error fetching meals from API, using local data:', error);
    return mealsData; // Fallback to local data
  }
};