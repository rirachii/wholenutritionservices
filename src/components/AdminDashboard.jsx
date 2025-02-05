import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuGenerator from './MenuGenerator';

export default function AdminDashboard({ onLogin }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <h2 className="text-xl font-semibold">Menu Generator</h2>
            <button
              onClick={() => {
                onLogin(false);
                navigate('/admin');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <MenuGenerator />
      </main>
    </div>
  );
}