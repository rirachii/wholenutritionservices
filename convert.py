import pandas as pd
import json
import re
import numpy as np

def clean_string(s):
    """Convert string to snake case for IDs"""
    if not isinstance(s, str):
        return ""
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    return s

def safe_get_numeric(value, default=0):
    """Safely convert a value to integer, handling various invalid cases"""
    if pd.isna(value):
        return default
    try:
        # Try to convert to float first, then to int
        cleaned_value = str(value).strip().replace('X', '0')
        return int(float(cleaned_value))
    except (ValueError, TypeError):
        return default

def safe_get(row, key, default=''):
    """Safely get a value from the row, handling NaN values"""
    value = row.get(key)
    if pd.isna(value):
        return default
    return value

def format_recipe(row):
    """Format a single recipe row into the desired structure"""
    # Base recipe information
    recipe = {
        "id": clean_string(safe_get(row, 'Recipe Prep')),
        "name": safe_get(row, 'Recipe Prep'),
        "calories": safe_get_numeric(safe_get(row, 'Calories')),
        "prepTime": safe_get(row, 'Prep Time'),
        "servings": safe_get(row, 'Servings'),
        "season": safe_get(row, 'Season'),
        "sodium": safe_get_numeric(safe_get(row, 'Sodium')),
        "carbs": safe_get_numeric(safe_get(row, 'Carbs')),
        # Dietary fields
        "Gluten": safe_get(row, 'Gluten', 'no'),
        "Dairy": safe_get(row, 'Dairy', 'no'),
        "Tree Nuts": safe_get(row, 'Tree Nuts', 'no'),
        "Protein": safe_get(row, 'Protein', 'Chicken'),
        "Eggs": safe_get(row, 'Eggs', 'no'),
        "Peanuts": safe_get(row, 'Peanuts', 'no'),
        "Soy": safe_get(row, 'Soy', 'no'),
        "Shellfish": safe_get(row, 'Shellfish', 'no'),
        "Almonds": safe_get(row, 'Almonds', 'no'),
        "Coconut": safe_get(row, 'Coconut', 'no'),
        "Cashews": safe_get(row, 'Cashews', 'no'),
        "Sesame": safe_get(row, 'Sesame', 'no'),
        "Pork": safe_get(row, 'Pork', 'no')
    }
    
    # Clean up the string values
    for key, value in recipe.items():
        if isinstance(value, str):
            recipe[key] = value.lower().strip()
            if value == '':
                recipe[key] = 'no'
    
    # Update protein categorization for vegetarian/vegan recipes
    if recipe['Protein'].lower() == 'meatless':
        if recipe['Eggs'].lower() == 'no' and recipe['Dairy'].lower() == 'no':
            recipe['Protein'] = 'Vegan'
        elif recipe['Eggs'].lower() == 'optional' and recipe['Dairy'].lower() == 'optional':
            recipe['Protein'] = 'Vegan optional'
        else:
            recipe['Protein'] = 'Meatless'
        
    return recipe

def process_excel_file(file_path):
    """Process Excel file and extract recipes in the desired format"""
    try:
        # Dictionary to store all recipes by type
        recipe_data = {
            "breakfast": [],
            "lunch": [],
            "dinner": []
        }
        
        # Read each sheet
        xls = pd.ExcelFile(file_path)
        
        for meal_type in ['Breakfast', 'Lunch', 'Dinner']:
            if meal_type in xls.sheet_names:
                # Read the sheet
                df = pd.read_excel(xls, sheet_name=meal_type)
                
                # Convert DataFrame to dictionary for easier handling
                records = df.replace({np.nan: None}).to_dict('records')
                
                # Process each recipe in the sheet
                for row in records:
                    if row.get('Recipe Prep'):
                        recipe = format_recipe(row)
                        recipe['type'] = meal_type.lower()
                        recipe_data[meal_type.lower()].append(recipe)
                        
        return recipe_data
    
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        raise  # Re-raise for debugging

def main():
    try:
        # Process the Excel file
        recipe_data = process_excel_file('RecipeIndex.xlsx')
        
        if recipe_data:
            # Save to JSON file
            with open('formatted_recipes.json', 'w', encoding='utf-8') as f:
                json.dump(recipe_data, f, indent=2, ensure_ascii=False)
            
            print("Successfully converted recipes to JSON!")
            
            # Print statistics
            total_recipes = sum(len(recipes) for recipes in recipe_data.values())
            print(f"\nTotal recipes processed: {total_recipes}")
            
                    
    except Exception as e:
        print(f"Error in main: {e}")
        raise  # Re-raise for debugging

if __name__ == "__main__":
    main()