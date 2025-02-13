import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuGenerator from './MenuGenerator';

export default function AdminDashboard({ onLogin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    console.log('File selected:', event.target.files[0]?.name);
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
  };

  const handleUpdateMenu = async () => {
    if (!selectedFile) {
      console.log('No file selected');
      setUploadStatus('Please select an Excel file first');
      return;
    }

    console.log('Starting menu update process...');
    console.log('File details:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`
    });

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      console.log('Reading file:', selectedFile.name);
      const reader = new FileReader();

      reader.onload = () => {
        console.log('File read successfully');
        console.log('File content type:', typeof reader.result);
        console.log('File content length:', reader.result.length);
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setUploadStatus(`Error reading file: ${error.message}`);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error during file upload:', error);
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      console.log('Menu update process completed');
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
          <MenuGenerator />
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
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {uploadStatus && (
                    <p className={`mt-2 ${uploadStatus.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                      {uploadStatus}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleUpdateMenu}
                  disabled={isUploading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {isUploading ? 'Uploading...' : 'Update Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}