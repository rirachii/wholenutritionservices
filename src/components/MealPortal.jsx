import React, { useState, useEffect } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { MEAL_DATA } from '../data/meals';
import { MealDetails } from './MealDetails';

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

const SEASONS = ['Classic', 'Essential', 'Fall/Winter', 'Spring/Summer'];

function MealPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState(() => {
    const saved = localStorage.getItem('dietaryFilters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dietaryFilters', JSON.stringify(dietaryFilters));
  }, [dietaryFilters]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'home1@example.com' && password === 'password123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleFilterChange = (filterId) => {
    setDietaryFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      }
      return [...prev, filterId];
    });
  };

  const filterMeals = (meals) => {
    return meals.filter(meal => {
      // Filter by season
      if (selectedSeason !== 'all' && meal.season !== selectedSeason) {
        return false;
      }

      // Filter by dietary restrictions
      if (dietaryFilters.length > 0) {
        return dietaryFilters.some(filter => 
          meal.dietaryTags.includes(filter)
        );
      }

      return true;
    });
  };

  const handleViewDetails = (meal) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };