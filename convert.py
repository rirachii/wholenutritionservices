import pandas as pd
import json

def convert_dietary_tags(row):
    """Convert dietary restrictions from columns to tags list"""
    tags = []
    
    # Handle gluten
    if str(row.get('Gluten', '')).lower() == 'yes':
        tags.append('contains-gluten')
    elif str(row.get('Gluten', '')).lower() == 'no':
        tags.append('gluten-free')
        
    # Handle dairy
    if str(row.get('Dairy', '')).lower() == 'yes':
        tags.append('contains-dairy')
    elif str(row.get('Dairy', '')).lower() == 'no':
        tags.append('dairy-free')
    elif str(row.get('Dairy', '')).lower() == 'optional':
        tags.append('dairy-optional')
        
    # Handle protein types
    protein = str(row.get('Protein', '')).lower()
    if protein == 'chicken':
        tags.append('chicken')
        
    # Handle nuts
    for nut in ['Tree Nuts', 'Cashews', 'Almonds']:
        if str(row.get(nut, '')).lower() == 'yes':
            tags.append(f'contains-{nut.lower().replace(" ", "-")}')
    
    # Handle eggs
    if str(row.get('Eggs', '')).lower() == 'yes':
        tags.append('contains-eggs')
        
    return tags

def safe_int_conversion(value):
    """Safely convert a value to integer, returning None if not possible"""
    if pd.isna(value) or value == '' or value == 'X' or value == 'undefined':
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None

def excel_to_meal_json(excel_file):
    # Initialize the meal data structure
    meal_data = {
        "breakfast": [],
        "lunch": [],
        "dinner": []
    }
    
    # Read each sheet
    for meal_type in ['Breakfast', 'Lunch', 'Dinner']:
        df = pd.read_excel(excel_file, sheet_name=meal_type)
        
        for _, row in df.iterrows():
            # Skip any non-meal rows (like headers or empty rows)
            if pd.isna(row.get('Recipe Prep')) or not isinstance(row.get('Recipe Prep'), str):
                continue
                
            calories = safe_int_conversion(row.get('Calories'))
            if calories is None:
                continue  # Skip meals without valid calorie information
                
            meal = {
                "id": str(row['Recipe Prep']).lower().strip().replace(' ', '-'),
                "name": row['Recipe Prep'].strip(),
                "type": meal_type.lower(),
                "calories": calories,
                "prepTime": str(row.get('Prep Time', '')).strip() if not pd.isna(row.get('Prep Time')) else "",
                "servings": str(row.get('Servings', '')).strip() if not pd.isna(row.get('Servings')) else "",
                "season": str(row.get('Season', '')).strip() if not pd.isna(row.get('Season')) else "Classic",
                "dietaryTags": convert_dietary_tags(row),
                "image": "/api/placeholder/200/200"
            }
            
            # Add optional fields if they exist and are valid numbers
            sodium = safe_int_conversion(row.get('Sodium'))
            if sodium is not None:
                meal['sodium'] = sodium
                
            carbs = safe_int_conversion(row.get('Carbs'))
            if carbs is not None:
                meal['carbs'] = carbs
                
            # Add to appropriate category
            meal_data[meal_type.lower()].append(meal)
    
    return {"MEAL_DATA": meal_data}

def main():
    try:
        excel_file = "RecipeIndex.xlsx"
        json_data = excel_to_meal_json(excel_file)
        
        # Write to JSON file
        with open('meal_data.json', 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2)
            
        print("Successfully converted Excel to JSON!")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()