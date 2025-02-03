import React from 'react';
import MenuGenerator from './MenuGenerator';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 h-16 items-center">
            <h2 className="text-xl font-semibold">Menu Generator</h2>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <MenuGenerator />
      </main>
    </div>
  );
}