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
            <h3 className="text-xl font-semibold mb-3">Dietary Restrictions</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(dietaryRestrictions).map(([restriction, value]) => (
                <label
                  key={restriction}
                  className="flex items-center space-x-3 text-base cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleDietaryChange(restriction)}
                      className="hidden"
                    />
                    <div className={`w-6 h-6 border-2 rounded-md transition-colors ${value ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-500'}`}>
                      {value && (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="capitalize">
                    {restriction === 'vegetarian' || restriction === 'vegan'
                      ? restriction.replace(/([A-Z])/g, ' $1').toLowerCase()
                      : `${restriction.replace(/([A-Z])/g, ' $1').toLowerCase()} Free`
                    }
                  </span>
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