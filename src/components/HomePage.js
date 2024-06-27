import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import Cookies from 'js-cookie';

function HomePage() {
  const [personalId, setPersonalId] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedId = Cookies.get('personalId');
    if (savedId) {
      navigate(`/${savedId}`);
    }
  }, [navigate]);

  const generatePersonalId = () => {
    const customConfig = {
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      length: 3,
    };
    const id = uniqueNamesGenerator(customConfig);
    setPersonalId(id);
  };

  const createUser = async (personalId) => {
    try {
      const response = await fetch('/.netlify/functions/create-user', {
        method: 'POST',
        body: JSON.stringify({ personalId }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('User created:', data);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleContinue = () => {
    if (personalId) {
      createUser(personalId);
      if (rememberMe) {
        Cookies.set('personalId', personalId, { expires: 30 });
      }
      navigate(`/${personalId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Trait Assessment</h1>
          <p className="text-gray-400">Enter your personal ID or generate a new one</p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="personalId" className="sr-only">Personal ID</label>
            <input
              id="personalId"
              type="text"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              placeholder="Enter your personal ID"
              className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={generatePersonalId}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Generate ID
            </button>
            <button
              onClick={handleContinue}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Continue
            </button>
          </div>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;