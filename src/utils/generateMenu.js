export const generateMenu = (preferences, servingSizes, residents, meals) => {
    const menu = [];
    const totalDays = 28;
    let leftoverServings = 0;
    let totalLeftover = 0; // New variable to track total leftovers
    let nextMealToAllocate = null;
    let savedServings = 0;


    for (let day = 1; day <= totalDays; day++) {
        let mealId;
        let meal;
        let servingsToCook = 0;
        let isNewMeal = false;
        let newmealName = "";
        let LeftOverBeforeCook = leftoverServings;

        if (leftoverServings >= residents) {
            // Use leftovers if sufficient
            newmealName = "Use Leftovers";
            mealId = nextMealToAllocate;
            meal = meals.find(m => m.id === mealId);
            if (meal) {
                servingsToCook = savedServings;
            }
            isNewMeal = false;

        } else {
            // Cook new meal if leftovers are insufficient
            const mealIndex = (day - 1) % preferences.length;
            mealId = preferences[mealIndex];
            meal = meals.find(m => m.id === mealId);

            if (meal && meal.id) {
                newmealName = meal.name;
                servingsToCook = servingSizes[mealId] || parseInt(meal.servings, 10) || 4; // Use parseInt for servings
                isNewMeal = true;

                // Save the next meal and its servings in case we use leftovers next day
                let nextMealIndex = day % preferences.length;
                nextMealToAllocate = preferences[nextMealIndex];
                const nextMeal = meals.find(m => m.id === nextMealToAllocate);
                savedServings = nextMeal ? (servingSizes[nextMealToAllocate] || parseInt(nextMeal.servings, 10) || 4) : 0;

            }
        }

        const servingSize = servingSizes[mealId]
        const remainingServings = Math.max(0, servingsToCook + leftoverServings - residents);
        const cookedNew = isNewMeal;

        menu.push({
            day,
            mealType: meal?.type || "unknown meal", // Fixed typo here
            mealId: mealId ?? "no-meal",
            mealName: newmealName,
            servings: cookedNew ? servingSize : savedServings, // Use savedServings for leftover scenarios
            cookedNew: cookedNew,
            leftoverServings: LeftOverBeforeCook,
            totalLeftover: totalLeftover + (cookedNew ? remainingServings : 0), // Accumulate total leftovers
        });

        leftoverServings = remainingServings;
        if(isNewMeal) {
            totalLeftover += leftoverServings; // Update total leftovers
        } else {
            totalLeftover = Math.max(0, totalLeftover - residents); // Decrease total leftovers if using them
        }

    }

    return menu;
};