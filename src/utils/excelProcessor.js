import * as XLSX from 'xlsx';

function formatRecipe(row, mealType) {
  // Parse servings into array of numbers
  let servingsArr = [];
  const servingsValue = row['Servings'];

  if (typeof servingsValue === 'string' && servingsValue.trim()) {
    // Split by comma and handle potential spaces
    servingsArr = servingsValue.split(', ').map(s => {
      const num = parseInt(s.trim());
      return isNaN(num) ? 4 : num;
    });
  } else if (typeof servingsValue === 'number') {
    servingsArr = [servingsValue];
  } else {
    servingsArr = [4]; // Default value
  }

  return {
    name: row['Recipe Prep'] || '',
    id: row['Recipe Prep']?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
    calories: parseInt(row['Calories']) || 0,
    prepTime: row['Prep Time'] || '0 min',
    servings: servingsArr,
    season: row['Season'] || 'classic',
    sodium: parseInt(row['Sodium']) || 0,
    carbs: parseInt(row['Carbs']) || 0,
    Gluten: row['Gluten'] || 'no',
    Dairy: row['Dairy'] || 'no',
    'Tree Nuts': row['Tree Nuts'] || 'no',
    Protein: row['Protein'] || 'Meatless',
    Eggs: row['Eggs'] || 'no',
    Peanuts: row['Peanuts'] || 'no',
    Soy: row['Soy'] || 'no',
    Shellfish: row['Shellfish'] || 'no',
    Almonds: row['Almonds'] || 'no',
    Coconut: row['Coconut'] || 'no',
    Cashews: row['Cashews'] || 'no',
    Sesame: row['Sesame'] || 'no',
    Pork: row['Pork'] || 'no',
    type: mealType.toLowerCase()
  };
}

export async function processExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const mealData = {
          breakfast: [],
          lunch: [],
          dinner: [],
          prep: []
        };

        const sheets = ['Breakfast', 'Lunch', 'Dinner', 'Prep'];
        
        for (const sheet of sheets) {
          if (workbook.SheetNames.includes(sheet)) {
            const worksheet = workbook.Sheets[sheet];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            for (const row of data) {
              if (row && typeof row === 'object' && 'Recipe Prep' in row) {
                const recipe = formatRecipe(row, sheet);
                mealData[sheet.toLowerCase()].push(recipe);
              }
            }
          }
        }

        resolve(mealData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}