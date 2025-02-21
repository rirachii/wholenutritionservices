import { generateMenu } from './generateMenu';

describe('generateMenu Function (Pure Logic)', () => {
  const defaultMeals = [
    { id: 'almond-rice-pudding', type: 'breakfast', name: 'Almond Rice Pudding', servings: [4] },
    { id: 'apple-spice-oatmeal', type: 'breakfast', name: 'Apple Spice Oatmeal', servings: [4] },
    { id: 'banana-nut-oatmeal', type: 'breakfast', name: 'Banana Nut Oatmeal', servings: [4] },
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
        expect(menu[1].mealName).toBe('Almond Rice Pudding'); 
        expect(menu[2].mealName).toBe('Apple Spice Oatmeal'); 
        expect(menu[3].mealName).toBe('GF Lemon Blueberry Scones'); 
        expect(menu[4].mealName).toBe('Chia Pudding'); 
        expect(menu[5].mealName).toBe('Chia Pudding'); 
        expect(menu[6].mealName).toBe('Avocado Toast GF');
        expect(menu[7].mealName).toBe('Strawberry Shortcake');
        expect(menu[8].mealName).toBe('Strawberry Shortcake');
        expect(menu[9].mealName).toBe('Strawberry Shortcake');
        expect(menu[10].mealName).toBe('Strawberry Shortcake');
        expect(menu[11].mealName).toBe('Banana Nut Oatmeal'); // Day 12 Restart
    });

    it('Check if the total leftovers is correctly generated', () => {
      const preferences = ['chia-pudding','banana-nut-oatmeal', 'almond-rice-pudding', 'apple-spice-oatmeal', 'gf-lemon-blueberry-scones','avocado-toast-gf', 'strawberry-shortcake'];
      const servingSizes = { 'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4, 'apple-spice-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'chia-pudding': 8, 'avocado-toast-gf': 4, "strawberry-shortcake": 12 };
      const residents = 4;
      const meals = defaultMeals;
      const menu = generateMenu(preferences, servingSizes, residents, meals);
      expect(menu[0].mealName).toBe('Chia Pudding'); 
      expect(menu[1].mealName).toBe('Chia Pudding'); 
      expect(menu[2].mealName).toBe('Banana Nut Oatmeal'); // Day 1 Cook New
      expect(menu[3].mealName).toBe('Almond Rice Pudding'); 
      expect(menu[4].mealName).toBe('Apple Spice Oatmeal'); 
      expect(menu[5].mealName).toBe('GF Lemon Blueberry Scones'); 
  
      expect(menu[6].mealName).toBe('Avocado Toast GF');
      expect(menu[7].mealName).toBe('Strawberry Shortcake');
      expect(menu[8].mealName).toBe('Strawberry Shortcake');
      expect(menu[9].mealName).toBe('Strawberry Shortcake');
      expect(menu[10].mealName).toBe('Strawberry Shortcake');
      expect(menu[11].mealName).toBe('Chia Pudding'); // Day 12 Restart
      expect(menu[12].mealName).toBe('Chia Pudding'); 
      expect(menu[13].mealName).toBe('Banana Nut Oatmeal'); // Day 1 Cook New
  });


  it('Resident = 3. Ensure it correctly cycles between the menu to allocate', () => {
    const preferences = ['banana-nut-oatmeal', 'almond-rice-pudding', 'apple-spice-oatmeal', 'gf-lemon-blueberry-scones','avocado-toast-gf','peanut-butter-chia-toast', 'chia-pudding', 'strawberry-shortcake'];
    const servingSizes = { 'banana-nut-oatmeal': 4, 'almond-rice-pudding': 4, 'apple-spice-oatmeal': 4, 'gf-lemon-blueberry-scones': 6, 'avocado-toast-gf': 4, 'peanut-butter-chia-toast': 4, 'chia-pudding': 8, 'strawberry-shortcake': 12 };
    const residents = 3;
    const meals = defaultMeals;
    const menu = generateMenu(preferences, servingSizes, residents, meals);
    expect(menu[0].mealId).toBe('banana-nut-oatmeal');
    expect(menu[1].mealId).toBe('almond-rice-pudding');
    expect(menu[2].mealId).toBe('apple-spice-oatmeal');
    expect(menu[4].mealId).toBe('gf-lemon-blueberry-scones');
    expect(menu[5].mealId).toBe('gf-lemon-blueberry-scones');
    expect(menu[6].mealId).toBe('avocado-toast-gf');
    expect(menu[7].mealId).toBe('peanut-butter-chia-toast');
    expect(menu[8].mealId).toBe('chia-pudding');
    expect(menu[9].mealId).toBe('chia-pudding');
    expect(menu[10].mealId).toBe('strawberry-shortcake');
    expect(menu[11].mealId).toBe('strawberry-shortcake');
    expect(menu[12].mealId).toBe('strawberry-shortcake');
    expect(menu[13].mealId).toBe('strawberry-shortcake');
    expect(menu[14].mealId).toBe('banana-nut-oatmeal');
    expect(menu[15].mealId).toBe('almond-rice-pudding');
  });

});