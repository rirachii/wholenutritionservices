import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MealPortal from './components/MealPortal';
import AdminDashboard from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MealPortal />} />
        <Route
          path="/admin"
          element={
            isAdminAuthenticated ? (
              <AdminDashboard onLogin={setIsAdminAuthenticated} />
            ) : (
              <AdminLoginPage onLogin={handleAdminLogin} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;