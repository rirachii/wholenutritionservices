class MenuGenerator {
  constructor(mealData) {
    this.mealData = mealData;
  }

  calculateMealPopularityForHome(preferences, mealType, homesData) {
    if (!Array.isArray(homesData)) {
      return [...preferences];
    }

    const mealCounts = {};
    
    homesData.forEach(home => {
      const homePreferences = home[`${mealType}_preferences`]?.split(',') || [];
      homePreferences.forEach(mealId => {
        if (mealId) {
          mealCounts[mealId] = (mealCounts[mealId] || 0) + 1;
        }
      });
    });
  
    return preferences
      .sort((a, b) => (mealCounts[b] || 0) - (mealCounts[a] || 0));
  }

  generateMenuFor3Residents(preferences, mealType, homesData) {
    const sortedPreferences = this.calculateMealPopularityForHome(preferences, mealType, homesData);
    const menuForType = [];
    let currentPreferenceIndex = 0;
    let day = 1;
    
    while (day <= 28) {
      const cycleDay = (day - 1) % 4;
      const dishId = sortedPreferences[currentPreferenceIndex];
      const dish = this.mealData[mealType].find(d => d.id === dishId);
      
      if (!dish) {
        day++;
        continue;
      }
  
      switch (cycleDay) {
        case 0: // Day 1 of cycle
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            totalServings: 4,
            useTodayServings: 3,
            leftoverServings: 1
          });
          currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
          break;

        case 1: // Day 2 of cycle
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            totalServings: 4,
            useTodayServings: 2,
            leftoverServings: 2,
            useLeftoverServings: 1,
            fromDay: day - 1
          });
          currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
          break;

        case 2: // Day 3 of cycle
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            totalServings: 4,
            useTodayServings: 1,
            leftoverServings: 3,
            useLeftoverServings: 2,
            fromDay: day - 1
          });
          currentPreferenceIndex = (currentPreferenceIndex + 1) % preferences.length;
          break;

        case 3: // Day 4 of cycle
          menuForType.push({
            day,
            dish: menuForType[day - 2].dish, // Use dish from Day 3
            isNewMeal: false,
            useLeftoverServings: 3,
            fromDay: day - 1
          });
          break;

        default:
          console.warn(`Unexpected cycle day: ${cycleDay}`);
          break;
      }
      
      day++;
    }
    return menuForType;
  }

  generateRegularMenu(preferences, mealType, residents, homesData, servingSizes = {}) {
    const menuForType = [];
    // Sort preferences by popularity and create a ranking map
    const sortedPreferences = Array.isArray(homesData) ? 
      this.calculateMealPopularityForHome(preferences, mealType, homesData) : 
      [...preferences];
    
    // Create a map of meal rankings based on popularity
    const mealRankings = {};
    sortedPreferences.forEach((mealId, index) => {
      mealRankings[mealId] = index + 1;
    });
    
    let currentPreferenceIndex = 0;
    let day = 1;
    let leftoverServings = 0;
    let currentDish = null;
    let currentDishFromDay = null;

    while (day <= 28) {
      if (leftoverServings >= residents) {
        // Use leftovers
        menuForType.push({
          day,
          dish: currentDish.name,
          isNewMeal: false,
          servingsUsed: residents,
          fromDay: currentDishFromDay,
          leftoverServings: leftoverServings - residents,
          totalServings: currentDish.servings
        });
        leftoverServings -= residents;
      } else {
        // Make new meal
        const dishId = sortedPreferences[currentPreferenceIndex];
        const dish = this.mealData[mealType].find(d => d.id === dishId);
        currentPreferenceIndex = (currentPreferenceIndex + 1) % sortedPreferences.length;

        if (dish) {
          const servingsPerMeal = servingSizes[dish.id] || parseInt(dish.servings) || 4;
          const useTodayServings = residents;
          
          menuForType.push({
            day,
            dish: dish.name,
            isNewMeal: true,
            servingsNeeded: residents,
            totalServings: servingsPerMeal,
            useTodayServings,
            leftoverServings: servingsPerMeal - useTodayServings
          });

          currentDish = dish;
          currentDishFromDay = day;
          leftoverServings = servingsPerMeal - useTodayServings;
        }
      }
      day++;
    }
    return menuForType;
  }

  generateMenus(homesData, servingSizes = {}) {
    if (!Array.isArray(homesData)) {
      console.warn('Invalid homesData: expected an array');
      return {};
    }

    const generatedMenus = {};
    
    homesData.forEach(home => {
      const residents = parseInt(home.residents) || 1;
      generatedMenus[home.home_id] = { breakfast: [], lunch: [], dinner: [] };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const preferences = home[`${mealType}_preferences`]?.split(',') || [];
        
        if (residents === 3) {
          generatedMenus[home.home_id][mealType] = this.generateMenuFor3Residents(preferences, mealType, homesData);
        } else {
          generatedMenus[home.home_id][mealType] = this.generateRegularMenu(
            preferences,
            mealType,
            residents,
            homesData,
            servingSizes[home.home_id]?.[mealType] || {}
          );
        }
      });
    });

    return generatedMenus;
  }

  calculateMealPopularity(homes, mealType) {
    const mealCounts = {};
    const mealHomes = {};
    
    homes.forEach(home => {
      const preferences = home[`${mealType}_preferences`]?.split(',') || [];
      preferences.forEach(mealId => {
        if (mealId) {
          const meal = this.mealData[mealType].find(m => m.id === mealId);
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
  }

  calculateHomeSpecificPopularity(homeId, homes, mealType) {
    const currentHome = homes.find(h => h.home_id === homeId);
    if (!currentHome) return [];

    const homeMealIds = currentHome[`${mealType}_preferences`]?.split(',') || [];
    const mealCounts = {};
    const mealHomes = {};
    
    homes.forEach(home => {
      const preferences = home[`${mealType}_preferences`]?.split(',') || [];
      preferences.forEach(mealId => {
        if (mealId && homeMealIds.includes(mealId)) {
          const meal = this.mealData[mealType].find(m => m.id === mealId);
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
  }
}

export default MenuGenerator;