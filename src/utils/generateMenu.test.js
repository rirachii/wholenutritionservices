import { generateMenu } from './generateMenu';

describe('generateMenu Function (Pure Logic)', () => {
  const defaultMeals = [
    { id: 'banana-nut-oatmeal', type: 'breakfast', name: 'Banana Nut Oatmeal', servings: [4] },
    { id: 'almond-rice-pudding', type: 'breakfast', name: 'Almond Rice Pudding', servings: [4] },
    { id: 'apple-spice-oatmeal', type: 'breakfast', name: 'Apple Spice Oatmeal', servings: [4] },
    { id: 'gf-lemon-blueberry-scones', type: 'breakfast', name: 'GF Lemon Blueberry Scones', servings: [6] },
    { id: 'avocado-toast-gf', type: 'breakfast', name: 'Avocado Toast GF', servings: [4] },
    { id: 'peanut-butter-chia-toast', type: 'breakfast', name: 'Peanut Butter Chia Toast', servings: [4] },
    { id: 'chia-pudding', type: 'breakfast', name: 'Chia Pudding', servings: [4, 8, 12] },
    { id: 'strawberry-shortcake', type: 'breakfast', name: 'Strawberry Shortcake', servings: [12] },
    { id: 'veggie-skillet-eggs', type: 'breakfast', name: 'Veggie Skillet Eggs', servings: [4, 8, 12] },
  ];

    it('should return a menu', () => {
        const preferences = ['banana-nut-oatmeal', 'almond-rice-pudding'];
        const servingSizes = { 'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4 };
        const residents = 2;
        const meals = defaultMeals;

        const menu = generateMenu(preferences, servingSizes, residents, meals);
        expect(Array.isArray(menu)).toBe(true);
    });

    it('should allocate meals based on serving sizes and resident count, using leftovers when available', () => {
      const preferences = ['banana-nut-oatmeal', 'almond-rice-pudding','apple-spice-oatmeal', 'gf-lemon-blueberry-scones'];
      const servingSizes = {'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4,'apple-spice-oatmeal': 4, 'gf-lemon-blueberry-scones': 6 };
      const residents = 4;
        const meals = defaultMeals;
      const menu = generateMenu(preferences, servingSizes, residents, meals);

      expect(menu[0].mealId).toBe('banana-nut-oatmeal');
      expect(menu[1].mealId).toBe('almond-rice-pudding');
      expect(menu[2].mealId).toBe('apple-spice-oatmeal');
      expect(menu[3].mealId).toBe('gf-lemon-blueberry-scones');
      expect(menu[4].mealId).toBe('banana-nut-oatmeal');
    });

   it('Check if the total leftovers is correctly generated', () => {
        const preferences = ['banana-nut-oatmeal', 'almond-rice-pudding', 'apple-spice-oatmeal', 'gf-lemon-blueberry-scones','chia-pudding','avocado-toast-gf', 'strawberry-shortcake'];
        const servingSizes = { 'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4, 'apple-spice-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'chia-pudding': 8, 'avocado-toast-gf': 4, "strawberry-shortcake": 12 };
        const residents = 4;
        const meals = defaultMeals;
        const menu = generateMenu(preferences, servingSizes, residents, meals);
        
        expect(menu[0].mealName).toBe('Banana Nut Oatmeal'); // Day 1 Cook New
        expect(menu[0].leftoverServings).toBe(0)
        expect(menu[1].mealName).toBe('Almond Rice Pudding'); 
        expect(menu[2].mealName).toBe('Apple Spice Oatmeal'); 
        expect(menu[3].mealName).toBe('GF Lemon Blueberry Scones'); 
        expect(menu[3].totalLeftover).toBe(2);
        expect(menu[4].mealName).toBe('Chia Pudding'); 
        expect(menu[5].mealName).toBe('Use Leftovers');
        expect(menu[6].mealName).toBe('Avocado Toast GF');
        expect(menu[7].mealName).toBe('Use Leftovers');
    });

    it('Complex leftover and total left overs', () => {
         const preferences = ['banana-nut-oatmeal', 'almond-rice-pudding', 'apple-spice-oatmeal', 'gf-lemon-blueberry-scones','avocado-toast-gf','peanut-butter-chia-toast'];
        const servingSizes = { 'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4, 'apple-spice-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'avocado-toast-gf': 4, 'peanut-butter-chia-toast': 4 };
        const residents = 4;
        const meals = defaultMeals;

        const menu = generateMenu(preferences, servingSizes, residents, meals);
        expect(menu[3].mealName).toBe("GF Lemon Blueberry Scones")
        expect(menu[3].leftoverServings).toBe(2)
        expect(menu[3].totalLeftover).toBe(2)
        expect(menu[4].mealName).toBe("Avocado Toast GF")
        expect(menu[4].leftoverServings).toBe(0)
        expect(menu[4].totalLeftover).toBe(2)
        expect(menu[5].mealName).toBe("Peanut Butter Chia Toast")
        expect(menu[5].leftoverServings).toBe(0)
        expect(menu[5].totalLeftover).toBe(2)
      });

    it('correctly handles leftovers and meal selection for all 28 days with 1 resident', () => {
      const preferences = ['banana-nut-oatmeal', 'gf-lemon-blueberry-scones', 'avocado-toast-gf'];
      const servingSizes = {'banana-nut-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'avocado-toast-gf': 4 };
      const residents = 1;
      const meals = defaultMeals;
      const menu = generateMenu(preferences, servingSizes, residents, meals);
  
      expect(menu.length).toBe(28);
  
      // Verify the first few days as a sample, then spot-check later days
      expect(menu[0].mealName).toBe('Banana Nut Oatmeal'); // Day 1
      expect(menu[1].mealName).toBe('Use Leftovers');     // Day 2 (use leftovers)
      expect(menu[2].mealName).toBe('Use Leftovers');    
      expect(menu[3].mealName).toBe('Use Leftovers');   
  
      // Day 4 now needs to generate a new value since it ran out 
      expect(menu[4].mealName).toBe('GF Lemon Blueberry Scones');
      expect(menu[9].mealName).toBe('Use Leftovers');
      expect(menu[10].mealName).toBe('Avocado Toast GF');
  
    
      // Spot check later days, make some of your own that I did not produce, make sure you get the key concept of this
      expect(menu[14].mealName).toBe('Banana Nut Oatmeal');
      expect(menu[20].mealName).toBe('GF Lemon Blueberry Scones');
      expect(menu[26].mealName).toBe('Use Leftovers');
      expect(menu[27].mealName).toBe('Banana Nut Oatmeal'); // Last day, will have 3 serving left over
  });

  it('correctly handles leftovers with 2 resident alternating', () => {
    const preferences = ['banana-nut-oatmeal', 'gf-lemon-blueberry-scones', 'avocado-toast-gf'];
    const servingSizes = {'banana-nut-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'avocado-toast-gf': 4 };
    const residents = 2;
    const meals = defaultMeals;

    const menu = generateMenu(preferences, servingSizes, residents, meals);
    // Test checks the number of servings and what happens
    expect(menu[0].mealName).toBe('Banana Nut Oatmeal');  //Day 1 with 2 serving left over
    expect(menu[0].leftoverServings).toBe(2) 
    expect(menu[0].totalLeftover).toBe(2) 

    expect(menu[1].mealName).toBe('Use Leftovers'); // day 2 it uses previous serving
    expect(menu[1].cookedNew).toBe(false)
    expect(menu[1].leftoverServings).toBe(0) 
    expect(menu[1].totalLeftover).toBe(0) 

    expect(menu[2].mealName).toBe('GF Lemon Blueberry Scones'); //After not using leftovers, it goes with preferences
    expect(menu[2].leftoverServings).toBe(4) 
    expect(menu[2].totalLeftover).toBe(4) 

    expect(menu[3].mealName).toBe('Use Leftovers');  // there are left overs
    expect(menu[3].leftoverServings).toBe(0) 
    expect(menu[3].totalLeftover).toBe(2) 
    expect(menu[3].cookedNew).toBe(false)

    expect(menu[4].mealName).toBe('Use Leftovers');  //Use Leftovers since there are no leftovers and it goes to avocado
    expect(menu[4].cookedNew).toBe(false)
    expect(menu[4].leftoverServings).toBe(0) //check and confirm that there is a leftover
    expect(menu[4].totalLeftover).toBe(0) 

    expect(menu[5].mealName).toBe('Avocado Toast GF'); //Use Leftovers for Avocado
    expect(menu[5].cookedNew).toBe(true)
    expect(menu[5].leftoverServings).toBe(2) //check and confirm that there is a leftover
    expect(menu[5].totalLeftover).toBe(2) //check and confirm that there is a leftover
    
    expect(menu[6].mealName).toBe('Use Leftovers'); // day 2 it uses previous serving
    expect(menu[6].cookedNew).toBe(false)
    expect(menu[6].leftoverServings).toBe(0)
    expect(menu[6].totalLeftover).toBe(0)

    expect(menu[7].mealName).toBe('Banana Nut Oatmeal');  //Day 1 with 2 serving left over
    expect(menu[7].leftoverServings).toBe(2) //check and confirm that there is a leftover
    expect(menu[7].totalLeftover).toBe(2)

    expect(menu[8].mealName).toBe('Use Leftovers'); // day 2 it uses previous serving
    expect(menu[8].cookedNew).toBe(false)
    expect(menu[8].leftoverServings).toBe(0) //check and confirm that there is a leftover
    expect(menu[8].totalLeftover).toBe(0)
});

  it('Resident = 3. Ensure it correctly cycles between the menu to allocate', () => {
    const preferences = ['banana-nut-oatmeal', 'almond-rice-pudding', 'apple-spice-oatmeal', 'gf-lemon-blueberry-scones','avocado-toast-gf','peanut-butter-chia-toast'];
    const servingSizes = { 'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4, 'apple-spice-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'avocado-toast-gf': 4, 'peanut-butter-chia-toast': 4 };
    const residents = 3;
    const meals = defaultMeals;
    const menu = generateMenu(preferences, servingSizes, residents, meals);
    expect(menu[0].mealId).toBe('banana-nut-oatmeal');
    expect(menu[1].mealId).toBe('almond-rice-pudding');
    expect(menu[2].mealId).toBe('apple-spice-oatmeal');
    expect(menu[3].mealId).toBe('use-leftovers');
    expect(menu[4].mealId).toBe('gf-lemon-blueberry-scones');
    expect(menu[5].mealId).toBe('use-leftovers');
    expect(menu[6].mealId).toBe('avocado-toast-gf');
    expect(menu[7].mealId).toBe('peanut-butter-chia-toast');
    expect(menu[8].mealId).toBe('banana-nut-oatmeal');
    expect(menu[9].mealId).toBe('use-leftovers');
    expect(menu[10].mealId).toBe('almond-rice-pudding');
  });

  it('Resident = 3. Check the number of leftovers and make sure all are correct', () => {
    const preferences = ['banana-nut-oatmeal', 'gf-lemon-blueberry-scones','apple-spice-oatmeal'];
    const servingSizes = {'gf-lemon-blueberry-scones': 6,'banana-nut-oatmeal': 4,'apple-spice-oatmeal': 4};
    const residents = 3;
    const meals = defaultMeals;

    const menu = generateMenu(preferences, servingSizes, residents, meals);
      expect(menu[0].mealName).toBe("Banana Nut Oatmeal");
      expect(menu[1].mealName).toBe("GF Lemon Blueberry Scones");
      expect(menu[2].mealName).toBe("Use Leftover");
      expect(menu[3].mealName).toBe("Apple Spice Oatmeal");
      expect(menu[4].mealName).toBe('Banana Nut Oatmeal');
      // expect(menu[0].leftoverServings).toBe(1)
      // expect(menu[1].leftoverServings).toBe(0)
      // expect(menu[2].leftoverServings).toBe(1);
      // expect(menu[3].leftoverServings).toBe(0);
    });

    it('Resident = 3. Should show use leftovers when appropriate', () => {
      const preferences = ['banana-nut-oatmeal', 'gf-lemon-blueberry-scones','avocado-toast-gf'];
      const servingSizes = {'banana-nut-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'avocado-toast-gf': 4 };
      const residents = 3;
      const meals = defaultMeals;
      const menu = generateMenu(preferences, servingSizes, residents, meals);

      expect(menu[1].mealName).toBe('GF Lemon Blueberry Scones'); // Day 2, has 3 left
      expect(menu[2].mealName).toBe('Use Leftovers'); // Day 3 use the 3
      expect(menu[3].mealName).toBe('Avocado Toast GF'); //Day 4 will generate again
      expect(menu[5].mealName).toBe('GF Lemon Blueberry Scones');  //Day 6 after the first loop
    });


});