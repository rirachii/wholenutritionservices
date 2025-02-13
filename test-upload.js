const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create test data
const testData = [
  {
    Name: 'Test Breakfast',
    Calories: 300,
    PrepTime: '15 min',
    Servings: '2 servings',
    Season: 'classic',
    Sodium: 500,
    Carbs: 40,
    Gluten: 'no',
    Dairy: 'yes',
    'Tree Nuts': 'no',
    Protein: 'Meatless'
  },
  {
    Name: 'Test Lunch',
    Calories: 400,
    PrepTime: '20 min',
    Servings: '2 servings',
    Season: 'classic',
    Sodium: 600,
    Carbs: 45,
    Gluten: 'no',
    Dairy: 'no',
    'Tree Nuts': 'no',
    Protein: 'chicken'
  },
  {
    Name: 'Test Dinner',
    Calories: 500,
    PrepTime: '30 min',
    Servings: '2 servings',
    Season: 'classic',
    Sodium: 700,
    Carbs: 50,
    Gluten: 'yes',
    Dairy: 'yes',
    'Tree Nuts': 'no',
    Protein: 'beef'
  }
];

// Create workbook and add sheets
const workbook = XLSX.utils.book_new();
const sheets = ['Breakfast', 'Lunch', 'Dinner'];

sheets.forEach((sheet, index) => {
  const ws = XLSX.utils.json_to_sheet([testData[index]]);
  XLSX.utils.book_append_sheet(workbook, ws, sheet);
});

// Write Excel file
XLSX.writeFile(workbook, 'test-menu.xlsx');

// Read the file and convert to base64
const excelBuffer = fs.readFileSync('test-menu.xlsx');
const base64Content = excelBuffer.toString('base64');

// Test the upload endpoint
import('node-fetch').then(({ default: fetch }) => {
  async function testUpload() {
    try {
      const response = await fetch('http://localhost:9999/.netlify/functions/upload-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileContent: base64Content
        })
      });

      const result = await response.json();
      console.log('Upload response:', result);

      // Check if files were created
      const dataPath = path.join(__dirname, 'netlify/functions/data');
      const files = fs.readdirSync(dataPath);
      console.log('\nCreated files in data directory:', files);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  testUpload();
});