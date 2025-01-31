import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const DIETARY_OPTIONS = [
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
  { id: 'dairy-optional', label: 'Dairy Optional' },
  { id: 'contains-tree-nuts', label: 'Contains Tree Nuts' },
  { id: 'contains-eggs', label: 'Contains Eggs' },
  { id: 'contains-dairy', label: 'Contains Dairy' },
  { id: 'contains-gluten', label: 'Contains Gluten' },
  { id: 'contains-cashews', label: 'Contains Cashews' },
];

const MenuFilter = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState(() => {
    // Load saved filters from localStorage
    const savedFilters = localStorage.getItem('dietaryFilters');
    return savedFilters ? JSON.parse(savedFilters) : [];
  });

  useEffect(() => {
    // Save filters to localStorage whenever they change
    localStorage.setItem('dietaryFilters', JSON.stringify(selectedFilters));
    // Notify parent component of filter changes
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const handleFilterChange = (filterId) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      }
      return [...prev, filterId];
    });
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Dietary Preferences</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DIETARY_OPTIONS.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={selectedFilters.includes(id)}
              onCheckedChange={() => handleFilterChange(id)}
            />
            <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MenuFilter;