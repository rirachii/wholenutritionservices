import { processRecipeData, generateId, processRecipeDetails } from './recipeProcessor';
import * as XLSX from 'xlsx';

describe('Recipe Processor', () => {
  // Test generateId function
  describe('generateId', () => {
    const testCases = [
      ['5-Spice Tofu Stir-Fry', '5-spice-tofu-stir-fry'],
      ['Chicken & Waffles', 'chicken-waffles'],
      ['Mac & Cheese (Classic)', 'mac-cheese-classic'],
      ['100% Whole Wheat Bread', '100-whole-wheat-bread'],
      ['', ''],
      ['   Spaced   Name   ', 'spaced-name'],
    ];

    test.each(testCases)('converts "%s" to "%s"', (input, expected) => {
      const result = generateId(input);
      expect(result).toBe(expected);
    });
  });

  // Test processRecipeDetails function
  describe('processRecipeDetails', () => {
    const mockSheet = {
      'A2': { v: 'Test Recipe' },
      'B2': { v: '1 cup flour\n2 eggs' },
      'C2': { v: 'Mix ingredients\nBake' },
      'D2': { v: 'Package in container' },
    };

    test('processes recipe details correctly', () => {
      const result = processRecipeDetails(mockSheet, 2);
      
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('baggingChecklists');
      expect(result.instructions[4]).toEqual({
        shoppingList: ['1 cup flour', '2 eggs'],
        prep: ['Mix ingredients', 'Bake']
      });
      expect(result.baggingChecklists[4]).toEqual(['Package in container']);
    });
  });

  // Test full file processing
  describe('processRecipeData', () => {
    test('processes Excel file correctly', async () => {
      // Create a mock Excel file
      const wb = XLSX.utils.book_new();
      const wsData = [
        ['Recipe Prep', '4 Servings', '', ''],
        ['Test Recipe', '1 cup flour', 'Mix well', 'Package it'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Prep');
      
      // Convert workbook to buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      // Create a mock File object
      const mockFile = new File([buffer], 'RecipeIndexFinal.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const result = await processRecipeData(mockFile);
      
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('baggingChecklists');
      expect(Object.keys(result.instructions)).toContain('test-recipe');
    });

    test('handles missing Prep sheet', async () => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([['Wrong Sheet']]);
      XLSX.utils.book_append_sheet(wb, ws, 'WrongSheet');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const mockFile = new File([buffer], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      await expect(processRecipeData(mockFile)).rejects.toThrow('Prep sheet not found');
    });
  });
});