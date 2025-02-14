const API_URL = process.env.REACT_APP_API_URL || 'https://lively-crostata-509cae.netlify.app/.netlify/functions/meals';

const fetchMeals = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch meals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { breakfast: [], lunch: [], dinner: [] };
  }
};

export const MEAL_DATA = await fetchMeals();