import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DUMMY_MEALS = [
  { id: 1, name: 'Gluten-Free Pancakes', type: 'breakfast', calories: 450, dietaryTags: ['gluten-free', 'vegetarian'] },
  { id: 2, name: 'Nut-Free Chicken Salad', type: 'lunch', calories: 350, dietaryTags: ['nut-free', 'high-protein'] },
  { id: 3, name: 'Vegan Buddha Bowl', type: 'dinner', calories: 500, dietaryTags: ['vegan', 'gluten-free'] },
];

const DUMMY_USER = {
  email: 'home1@example.com',
  password: 'password123',
  dietaryRestrictions: ['gluten-free']
};

// Component code here (same as above)