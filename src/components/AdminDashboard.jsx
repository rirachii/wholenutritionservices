import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserManagement } from './UserManagement';

const DUMMY_ORDERS = [
  {
    homeId: "Home A",
    week: "2025-01-20",
    orders: [
      { mealId: 1, quantity: 2 },
      { mealId: 3, quantity: 1 }
    ]
  },
  {
    homeId: "Home B",
    week: "2025-01-20",
    orders: [
      { mealId: 2, quantity: 3 },
      { mealId: 4, quantity: 2 }
    ]
  }
];

const DUMMY_MEALS = {
  1: { name: "Gluten-Free Pancakes", type: "breakfast" },
  2: { name: "Nut-Free Chicken Salad", type: "lunch" },
  3: { name: "Vegan Buddha Bowl", type: "dinner" },
  4: { name: "Fruit Parfait", type: "breakfast" }
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  const popularityData = Object.entries(DUMMY_MEALS).map(([id, meal]) => ({
    name: meal.name,
    orders: DUMMY_ORDERS.reduce((sum, order) => {
      const mealOrder = order.orders.find(o => o.mealId === parseInt(id));
      return sum + (mealOrder?.quantity || 0);
    }, 0)
  })).sort((a, b) => b.orders - a.orders);

  const ordersByType = Object.values(DUMMY_MEALS).reduce((acc, meal) => {
    acc[meal.type] = (acc[meal.type] || 0) + DUMMY_ORDERS.reduce((sum, order) => {
      const mealOrder = order.orders.find(o => o.mealId === parseInt(Object.keys(DUMMY_MEALS).find(key => DUMMY_MEALS[key] === meal)));
      return sum + (mealOrder?.quantity || 0);
    }, 0);
    return acc;
  }, {});

  const typeData = Object.entries(ordersByType).map(([type, count]) => ({
    name: type,
    orders: count
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 h-16 items-center">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'stats' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              User Management
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'users' ? (
          <UserManagement />
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Current Week Orders</h2>
            <div className="bg-white shadow rounded-lg divide-y">
              {DUMMY_ORDERS.map((order, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{order.homeId}</h3>
                    <span className="text-gray-500">Week of {order.week}</span>
                  </div>
                  <div className="space-y-3">
                    {order.orders.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center">
                        <span>{DUMMY_MEALS[item.mealId].name}</span>
                        <span className="font-medium">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Most Popular Items</h2>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#3B82F6" name="Total Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Orders by Meal Type</h2>
              <div className="bg-white p-4 rounded-lg shadow" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10B981" name="Orders by Type" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;