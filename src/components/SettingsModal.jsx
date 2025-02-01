import React, { useState } from 'react';
import { Modal } from './ui/modal';

export function SettingsModal({ isOpen, onClose, userInfo, onUpdate, onSignOut }) {
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    return savedData.phoneNumber || userInfo?.phoneNumber || '';
  });
  const [householdSize, setHouseholdSize] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    return savedData.householdSize || userInfo?.householdSize || 1;
  });
  const [dietaryRestrictions, setDietaryRestrictions] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    return savedData.dietaryRestrictions || userInfo?.dietaryRestrictions || {
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
  });
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!validatePhoneNumber(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    const userData = {
      phoneNumber: cleanPhone,
      householdSize,
      dietaryRestrictions
    };

    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    onUpdate(userData);
    onClose();
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (phoneError) setPhoneError('');

    // Update localStorage immediately
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    localStorage.setItem('userData', JSON.stringify({
      ...savedData,
      phoneNumber: value
    }));
  };

  const handleDietaryChange = (restriction) => {
    const newRestrictions = {
      ...dietaryRestrictions,
      [restriction]: !dietaryRestrictions[restriction]
    };
    setDietaryRestrictions(newRestrictions);
    
    // Update localStorage immediately
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    localStorage.setItem('userData', JSON.stringify({
      ...savedData,
      dietaryRestrictions: newRestrictions
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(123) 456-7890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
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
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={userInfo?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                gluten: 'Gluten Free',
                dairy: 'Dairy Free',
                treeNuts: 'Tree Nuts Free',
                peanuts: 'Peanuts Free',
                soy: 'Soy Free',
                shellfish: 'Shellfish Free',
                eggs: 'Eggs Free',
                sesame: 'Sesame Free',
                vegetarian: 'Vegetarian',
                vegan: 'Vegan'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={dietaryRestrictions[key]}
                    onChange={() => handleDietaryChange(key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-md py-3 hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}