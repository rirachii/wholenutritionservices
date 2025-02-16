import * as XLSX from 'xlsx';
import _ from 'lodash';

// Column mappings for different serving sizes
const COLUMN_MAPPINGS = {
    4: {
        shoppingList: 'B',
        prep: 'C',
        baggingChecklist: 'D'
    },
    6: {
        shoppingList: 'E',
        prep: 'F',
        baggingChecklist: 'G'
    },
    8: {
        shoppingList: 'H',
        prep: 'I',
        baggingChecklist: 'J'
    },
    12: {
        shoppingList: 'K',
        prep: 'L',
        baggingChecklist: 'M'
    }
};

// Helper function to get cell value and clean it
function getCellValue(sheet, column, row) {
    if (!sheet || !column || row === undefined) {
        console.warn(`Invalid parameters passed to getCellValue: sheet=${!!sheet}, column=${column}, row=${row}`);
        return '';
    }
    const cellAddress = `${column}${row}`;
    const cell = sheet[cellAddress];
    if (!cell) {
        // console.debug(`No cell found at ${cellAddress}`);
        return '';
    }
    if (cell.v === undefined || cell.v === null) {
        // console.debug(`at ${cellAddress} has no value`);
        return '';
    }
    const value = cell.v;
    if (typeof value === 'string') {
        return value.trim().replace(/\r\n|\r|\n/g, '\n');
    }
    return String(value);
}

// Function to check if a serving size has valid data
function hasValidData(servingData, fields) {
    return fields.some(field => 
        Array.isArray(servingData[field]) && servingData[field].length > 0
    );
}

// Function to process recipe details for different serving sizes
function processRecipeDetails(sheet, rowNumber) {
    // Skip the header row if it contains "servings"
    if (getCellValue(sheet, 'B', rowNumber).toLowerCase().includes('servings')) {
        return { instructions: {}, baggingChecklists: {} };
    }

    const instructions = {};
    const baggingChecklists = {};
    
    // Process each serving size
    Object.entries(COLUMN_MAPPINGS).forEach(([servingSize, columns]) => {
        const instructionData = {
            shoppingList: getCellValue(sheet, columns.shoppingList, rowNumber).split('\n').filter(item => item.trim().length > 0),
            prep: getCellValue(sheet, columns.prep, rowNumber).split('\n').filter(item => item.trim().length > 0)
        };

        const baggingData = {
            baggingChecklist: getCellValue(sheet, columns.baggingChecklist, rowNumber).split('\n').filter(item => item.trim().length > 0)
        };

        // Only include serving size if it has valid data
        if (hasValidData(instructionData, ['shoppingList', 'prep'])) {
            instructions[servingSize] = instructionData;
        }

        if (hasValidData(baggingData, ['baggingChecklist'])) {
            baggingChecklists[servingSize] = baggingData.baggingChecklist;
        }
    });

    return { instructions, baggingChecklists };
}

// Main function to process the Excel file
export async function processRecipeData(file) {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, {
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true,
            sheetStubs: true
        });

        const prepSheet = workbook.Sheets['Prep'];
        if (!prepSheet) {
            throw new Error('Prep sheet not found in Excel file');
        }

        if (!prepSheet['!ref']) {
            throw new Error('Invalid sheet format: missing reference range');
        }

        const range = XLSX.utils.decode_range(prepSheet['!ref']);
        const instructionsMap = {};
        const baggingChecklistsMap = {};

        // Iterate through each row
        for (let row = 2; row <= range.e.r; row++) {
            try {
                const recipeName = getCellValue(prepSheet, 'A', row);
                if (recipeName && typeof recipeName === 'string' && recipeName.trim().length > 0) {
                    const { instructions, baggingChecklists } = processRecipeDetails(prepSheet, row);
                    
                    if (Object.keys(instructions).length > 0) {
                        instructionsMap[recipeName.trim()] = instructions;
                    }
                    
                    if (Object.keys(baggingChecklists).length > 0) {
                        baggingChecklistsMap[recipeName.trim()] = baggingChecklists;
                    }
                }
            } catch (rowError) {
                console.warn(`Error processing row ${row}:`, rowError);
                continue;
            }
        }
        console.log(instructionsMap);
        console.log(baggingChecklistsMap);

        return {
            instructions: instructionsMap,
            baggingChecklists: baggingChecklistsMap
        };
    } catch (error) {
        console.error('Error processing recipe data:', error);
        throw error;
    }
}