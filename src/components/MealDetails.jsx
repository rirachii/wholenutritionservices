// import React from 'react';
// import { Modal } from './ui/modal';

// export function MealDetails({ meal, isOpen, onClose }) {
//   if (!meal) return null;

//   // List of dietary restrictions to check
//   const dietaryRestrictions = [
//     'Gluten',
//     'Dairy',
//     'Tree Nuts',
//     'Eggs',
//     'Peanuts',
//     'Soy',
//     'Shellfish',
//     'Almonds',
//     'Coconut',
//     'Cashews',
//     'Sesame',
//     'Pork'
//   ];

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <div className="p-6">
//         <div>
//           <h2 className="text-2xl font-bold mb-4">{meal.name}</h2>
//           <div className="grid grid-cols-2 gap-4 text-sm mb-4">
//             <div>
//               <span className="text-gray-600">Preparation Time:</span>
//               <p className="font-medium">{meal.prepTime}</p>
//             </div>
//             <div>
//               <span className="text-gray-600">Servings:</span>
//               <p className="font-medium">{meal.servings}</p>
//             </div>
//             <div>
//               <span className="text-gray-600">Calories:</span>
//               <p className="font-medium">{meal.calories} cal</p>
//             </div>
//             {meal.sodium && (
//               <div>
//                 <span className="text-gray-600">Sodium:</span>
//                 <p className="font-medium">{meal.sodium} mg</p>
//               </div>
//             )}
//             {meal.carbs && (
//               <div>
//                 <span className="text-gray-600">Carbs:</span>
//                 <p className="font-medium">{meal.carbs} g</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="mt-6">
//           <h3 className="text-lg font-semibold mb-2">Dietary Restrictions</h3>
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="grid grid-cols-2 gap-2">
//               {dietaryRestrictions.map((restriction) => (
//                 <div key={restriction} className="flex items-center">
//                   <span className="text-sm">{restriction}:</span>
//                   <span className={`ml-2 text-sm font-medium ${meal[restriction] === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
//                     {meal[restriction] === 'yes' ? 'Contains' : meal[restriction] === 'no' ? 'Free' : 'Optional'}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="mt-6">
//           <button
//             onClick={() => {
//               // Add to order logic here
//               onClose();
//             }}
//             className="w-full bg-blue-600 text-white rounded-md py-3 hover:bg-blue-700 transition-colors"
//           >
//             Add to Order
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }