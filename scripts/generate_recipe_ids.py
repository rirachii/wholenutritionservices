import pandas as pd
import os

def generate_id(name):
    """Generate a kebab-case ID from a recipe name."""
    # Convert to lowercase and remove special characters
    clean_name = ''.join(c.lower() for c in name if c.isalnum() or c.isspace())
    # Replace spaces with hyphens and remove multiple hyphens
    return '-'.join(filter(None, clean_name.split()))

def process_excel(input_file, output_file):
    """Process the Excel file and add recipe IDs."""
    # Read the Excel file
    print(f"Reading Excel file: {input_file}")
    
    # Dictionary to store all recipe IDs to ensure consistency
    recipe_ids = {}
    
    # Create a new Excel writer object
    writer = pd.ExcelWriter(output_file, engine='openpyxl')
    
    # Process each sheet
    sheets_to_process = ['Prep', 'Breakfast', 'Lunch', 'Dinner']
    
    for sheet_name in sheets_to_process:
        try:
            df = pd.read_excel(input_file, sheet_name=sheet_name)
            if 'Recipe Prep' not in df.columns:
                print(f"Skipping {sheet_name} sheet - no Recipe Prep column found")
                continue
                
            # Generate IDs for recipes
            new_ids = []
            for recipe_name in df['Recipe Prep']:
                if pd.isna(recipe_name):
                    new_ids.append('')
                    continue
                    
                recipe_name = str(recipe_name).strip()
                if recipe_name in recipe_ids:
                    # Use existing ID for consistency
                    new_ids.append(recipe_ids[recipe_name])
                else:
                    # Generate new ID
                    if recipe_name.endswith('GF'):
                        # Handle GF variants
                        base_recipe = recipe_name[:-3].strip()
                        if base_recipe in recipe_ids:
                            new_id = recipe_ids[base_recipe] + '-gf'
                        else:
                            new_id = generate_id(recipe_name)
                    else:
                        new_id = generate_id(recipe_name)
                    recipe_ids[recipe_name] = new_id
                    new_ids.append(new_id)
            
            # Insert new Recipe ID column
            df.insert(0, 'Recipe ID', new_ids)
            
            # Save to the new file
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"Processed {sheet_name} sheet - {len(new_ids)} recipes")
            
        except Exception as e:
            print(f"Error processing {sheet_name} sheet: {str(e)}")
    
    # Save the file
    writer.close()
    print(f"\nUpdated Excel file saved as: {output_file}")
    
    # Print some sample mappings
    print("\nSample of Recipe ID mappings:")
    sample_items = list(recipe_ids.items())[:10]
    for recipe_name, recipe_id in sample_items:
        print(f"{recipe_name} -> {recipe_id}")

def main():
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct paths
    input_file = os.path.join(current_dir, '..', 'Recipe Index.xlsx')
    output_file = os.path.join(current_dir, '..', 'Recipe Index with IDs.xlsx')
    
    # Process the file
    process_excel(input_file, output_file)

if __name__ == "__main__":
    main()