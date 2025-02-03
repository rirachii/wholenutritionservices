import React, { useState } from 'react';
import { Modal } from './ui/modal';

const DEFAULT_DIETARY_RESTRICTIONS = {
  gluten: false,
  dairy: false,
  treeNuts: false,
  peanuts: false,
  soy: false,
  shellfish: false,
  eggs: false,
  sesame: false,
  vegetarian: false,
  vegan: false
};

export function SettingsModal({ isOpen, onClose, userInfo, onUpdate }) {
  const [formData, setFormData] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    return {
      phoneNumber: savedData.phoneNumber || userInfo?.phoneNumber || '',
      contactEmail: savedData.contactEmail || '',
      householdSize: savedData.householdSize || userInfo?.householdSize || 1,
      homeId: savedData.homeId || userInfo?.homeId || '',
      dietaryRestrictions: savedData.dietaryRestrictions || userInfo?.dietaryRestrictions || {
        ...DEFAULT_DIETARY_RESTRICTIONS
      }
    };
  });

  const [errors, setErrors] = useState({
    phoneNumber: '',
    email: '',
    homeId: ''
  });

  const handleDietaryChange = (restriction) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: {
        ...prev.dietaryRestrictions,
        [restriction]: !prev.dietaryRestrictions[restriction]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!phoneRegex.test(formData.phoneNumber.replace(/[^0-9]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.contactEmail || !emailRegex.test(formData.contactEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.homeId.trim()) {
      newErrors.homeId = 'Home ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = {
      ...formData,
      phoneNumber: formData.phoneNumber.replace(/[^0-9]/g, '')
    };

    localStorage.setItem('userData', JSON.stringify(userData));
    onUpdate(userData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Update Your Info</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dietary Restrictions Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Dietary Restrictions</h3>
            <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(DEFAULT_DIETARY_RESTRICTIONS).map(([restriction, _]) => (
                  <div key={restriction} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <input
                      type="checkbox"
                      id={`restriction-${restriction}`}
                      checked={formData.dietaryRestrictions[restriction]}
                      onChange={() => handleDietaryChange(restriction)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`restriction-${restriction}`} className="text-sm text-gray-900">
                      {restriction.charAt(0).toUpperCase() + restriction.slice(1)} {!['vegetarian', 'vegan'].includes(restriction) ? 'Free' : ''}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Other Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="homeId" className="block text-sm font-medium text-gray-700 mb-1">
                Home ID
              </label>
              <input
                type="text"
                id="homeId"
                value={formData.homeId}
                onChange={(e) => setFormData(prev => ({ ...prev, homeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Home ID"
              />
              {errors.homeId && <p className="text-red-500 text-sm mt-1">{errors.homeId}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(123) 456-7890"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your contact email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="household" className="block text-sm font-medium text-gray-700 mb-1">
                Household Size
              </label>
              <input
                type="number"
                id="household"
                min="1"
                max="20"
                value={formData.householdSize}
                onChange={(e) => setFormData(prev => ({ ...prev, householdSize: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-3 hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </form>
      </div>
    </Modal>
  );
}