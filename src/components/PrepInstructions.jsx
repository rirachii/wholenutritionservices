import React, { useState, useEffect } from 'react';
import { fetchInstructions } from '../data/api';

const PrepInstructions = () => {
  const [selectedServingSize, setSelectedServingSize] = useState('4');
  const [instructions, setInstructions] = useState({});
  const [shoppingList, setShoppingList] = useState({});
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInstructions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInstructions();
        if (data) {
          processInstructions(data);
        }
      } catch (err) {
        setError('Failed to load instructions');
        console.error('Error loading instructions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstructions();
  }, []);

  const processInstructions = (data) => {
    if (!data) return;

    const aggregatedInstructions = {};
    const aggregatedShoppingList = {};

    // Process each meal's instructions
    Object.entries(data).forEach(([recipeName, recipeInstructions]) => {
      if (recipeInstructions[selectedServingSize]) {
        // Aggregate prep instructions
        recipeInstructions[selectedServingSize].prep.forEach(instruction => {
          if (!aggregatedInstructions[recipeName]) {
            aggregatedInstructions[recipeName] = [];
          }
          aggregatedInstructions[recipeName].push(instruction);
        });

        // Aggregate shopping list
        recipeInstructions[selectedServingSize].shoppingList.forEach(item => {
          const category = categorizeItem(item);
          if (!aggregatedShoppingList[category]) {
            aggregatedShoppingList[category] = new Set();
          }
          aggregatedShoppingList[category].add(item);
        });
      }
    });

    // Convert Set to Array for shopping list
    const finalShoppingList = {};
    Object.entries(aggregatedShoppingList).forEach(([category, items]) => {
      finalShoppingList[category] = Array.from(items);
    });

    setInstructions(aggregatedInstructions);
    setShoppingList(finalShoppingList);
  };

  useEffect(() => {
    const data = instructions;
    if (Object.keys(data).length > 0) {
      processInstructions(data);
    }
  }, [selectedServingSize]);

  // Helper function to categorize shopping list items
  const categorizeItem = (item) => {
    const categories = {
      Produce: ['vegetable', 'fruit', 'herbs', 'fresh'],
      Protein: ['chicken', 'beef', 'fish', 'tofu', 'meat', 'protein'],
      Dairy: ['milk', 'cheese', 'yogurt', 'cream', 'butter'],
      Pantry: ['sauce', 'oil', 'spice', 'seasoning', 'dry', 'canned'],
      Other: []
    };

    const itemLower = item.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => itemLower.includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  };

  const handleCheckItem = (item) => {
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(item)) {
        newChecked.delete(item);
      } else {
        newChecked.add(item);
      }
      return newChecked;
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Prep Instructions & Shopping Lists</h2>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Select Serving Size
            </label>
            <select
              value={selectedServingSize}
              onChange={(e) => setSelectedServingSize(e.target.value)}
              className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="4">4 Servings</option>
              <option value="6">6 Servings</option>
              <option value="8">8 Servings</option>
              <option value="12">12 Servings</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <h3 className="text-xl font-semibold text-green-800">Shopping List</h3>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {Object.entries(shoppingList).map(([category, items], index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="text-lg font-medium text-green-700 mb-3 flex items-center">
                    <span className="mr-2">{category}</span>
                    <span className="text-sm text-green-600">({items.length} items)</span>
                  </h4>
                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center hover:bg-green-50 p-2 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          checked={checkedItems.has(item)}
                          onChange={() => handleCheckItem(item)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className={`ml-3 ${checkedItems.has(item) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h3 className="text-xl font-semibold text-blue-800">Prep Instructions</h3>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {Object.entries(instructions).map(([recipeName, recipeInstructions], index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="text-lg font-medium text-blue-700 mb-3">{recipeName}</h4>
                  <ol className="list-decimal list-inside space-y-3">
                    {recipeInstructions.map((instruction, idx) => (
                      <li key={idx} className="text-gray-700 pl-2 leading-relaxed hover:bg-blue-50 p-2 rounded-md transition-colors">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrepInstructions;