import React from 'react';
import MealPortal from './components/MealPortal';
import AdminDashboard from './components/AdminDashboard';

function App() {
  // Simplified admin check - in production, use proper auth
  const isAdmin = window.location.pathname === '/admin';

  return (
    <div>
      {isAdmin ? <AdminDashboard /> : <MealPortal />}
    </div>
  );
}

export default App;