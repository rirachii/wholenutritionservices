import React from 'react';
import { Modal } from './ui/modal';

export function MealDetails({ meal, isOpen, onClose }) {
  if (!meal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex">
          <div className="w-1/3">
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="w-2/3 pl-6">
            <h2 className="text-2xl font-bold mb-2">{meal.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600">Preparation Time:</span>
                <p className="font-medium">{meal.prepTime}</p>
              </div>
              <div>
                <span className="text-gray-600">Servings:</span>
                <p className="font-medium">{meal.servings}</p>
              </div>
              <div>
                <span className="text-gray-600">Calories:</span>
                <p className="font-medium">{meal.calories} cal</p>
              </div>
              <div>
                <span className="text-gray-600">Season:</span>
                <p className="font-medium">{meal.season}</p>
              </div>
              {meal.sodium && (
                <div>
                  <span className="text-gray-600">Sodium:</span>
                  <p className="font-medium">{meal.sodium} mg</p>
                </div>
              )}
              {meal.carbs && (
                <div>
                  <span className="text-gray-600">Carbs:</span>
                  <p className="font-medium">{meal.carbs} g</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Dietary Information</h3>
          <div className="flex flex-wrap gap-2">
            {meal.dietaryTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tag.includes('free') || tag === 'vegetarian' || tag === 'vegan'
                    ? 'bg-green-100 text-green-800'
                    : tag.includes('contains')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              // Add to order logic here
              onClose();
            }}
            className="w-full bg-blue-600 text-white rounded-md py-3 hover:bg-blue-700 transition-colors"
          >
            Add to Order
          </button>
        </div>
      </div>
    </Modal>
  );
}