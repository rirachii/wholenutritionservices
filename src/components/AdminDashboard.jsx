import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleGenerator from './ScheduleGenerator';
import PrepInstructions from './PrepInstructions';
import MealPlanner from './MealPlanner';
import { processExcelFile } from '../utils/excelProcessor';
import { processRecipeData } from '../utils/recipeProcessor';

export default function AdminDashboard({ onLogin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleExcelFileChange = (event) => {
    console.log('Excel file selected:', event.target.files[0]?.name);
    setSelectedExcelFile(event.target.files[0]);
    setUploadStatus('');
  };



  const handleUpdateMenu = async () => {
    if (!selectedExcelFile) {
      console.log('No file selected');
      setUploadStatus('Please select an Excel file first');
      return;
    }

    console.log('Starting menu update process...');
    setIsUploading(true);
    setUploadStatus('Processing Excel file...');

    try {
      // Process Excel file for meals
      const mealData = await processExcelFile(selectedExcelFile);
      console.log('Meal data processed successfully');

      // Process Excel file for recipe instructions and bagging checklists
      const recipeData = await processRecipeData(selectedExcelFile);
      console.log('Recipe instructions and bagging checklists processed successfully');

      setUploadStatus('Data processed, uploading to server...');

      // Upload meal data
      await fetch('https://lively-crostata-509cae.netlify.app/upload-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(mealData)
      });

      // Upload instructions data
      await fetch('https://lively-crostata-509cae.netlify.app/upload-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(recipeData.instructions)
      });

      // Upload bagging checklist data
      await fetch('https://lively-crostata-509cae.netlify.app/upload-bagging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(recipeData.baggingChecklists)
      });

      // Send processed JSON to server
      const response = await fetch('https://lively-crostata-509cae.netlify.app/upload-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(mealData)
      });

      console.log('Server response status:', response.status);
      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      setUploadStatus('Excel file processed and uploaded successfully');
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-3 py-2 text-sm font-medium ${activeTab === 'generator' ? 'text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Generator
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-2 text-sm font-medium ${activeTab === 'menu' ? 'text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveTab('planner')}
                className={`px-3 py-2 text-sm font-medium ${activeTab === 'planner' ? 'text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Meal Planner
              </button>
              <button
                onClick={() => setActiveTab('prep')}
                className={`px-3 py-2 text-sm font-medium ${activeTab === 'prep' ? 'text-gray-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Prep Instructions
              </button>
            </div>
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
        {activeTab === 'generator' ? (
          <ScheduleGenerator />
        ) : activeTab === 'prep' ? (
          <PrepInstructions />
        ) : activeTab === 'planner' ? (
          <MealPlanner />
        ) : (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Management</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Excel File</label>
                    <p className="text-sm text-gray-500 mb-2">Upload an Excel file with Breakfast, Lunch, and Dinner sheets</p>
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleExcelFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <button
                      onClick={handleUpdateMenu}
                      disabled={isUploading}
                      className={`mt-4 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Excel'}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {uploadStatus && (
                    <p className={`mt-2 ${uploadStatus.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                      {uploadStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}