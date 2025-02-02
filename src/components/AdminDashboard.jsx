import React, { useState } from 'react';
import { UserManagement } from './UserManagement';
import MenuGenerator from './MenuGenerator';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 h-16 items-center">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'menu' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              Menu Generator
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'menu' ? (
          <MenuGenerator />
        ) : (
          <UserManagement />
        )}
      </main>
    </div>
  );
}