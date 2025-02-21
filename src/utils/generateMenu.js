export const generateMenu = (preferences, servingSizes, residents, meals) => {
  const menu = [];
  const totalDays = 28;
  let currentDay = 1;
  let prefIndex = 0;

  while (currentDay <= totalDays) {
    // Get current meal preference
    const mealId = preferences[prefIndex];
    const meal = meals.find(m => m.id === mealId);

    if (!meal || !meal.id) {
      prefIndex = (prefIndex + 1) % preferences.length;
      continue;
    }

    // Get serving size for this meal
    const servingSize = servingSizes[mealId] || 
      (Array.isArray(meal.servings) ? meal.servings[0] : meal.servings) || 
      4;

    // Calculate how many full portions we can make from this serving size
    const portions = Math.floor(servingSize / residents);

    // Add entries for each portion of this meal
    for (let i = 0; i < portions && currentDay <= totalDays; i++) {
      menu.push({
        day: currentDay,
        mealType: meal.type || "unknown meal",
        mealId: mealId,
        mealName: meal.name,
        servings: residents,
        cookedNew: true,
        leftoverServings: servingSize - residents
      });
      currentDay++;
    }

    // Move to next meal preference
    prefIndex = (prefIndex + 1) % preferences.length;
  }

  return menu;
};