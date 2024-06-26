import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import OptionsPage from './components/OptionsPage';
import SurveyPage from './components/SurveyPage';

function HomePage() {
  const [personalId, setPersonalId] = useState('');

  const generatePersonalId = () => {
    const customConfig: Config = {
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      length: 3,
    };
    const id = uniqueNamesGenerator(customConfig);
    setPersonalId(id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center">Trait Assessment</h1>
        <div className="mt-8 space-y-6">
          <input
            type="text"
            value={personalId}
            onChange={(e) => setPersonalId(e.target.value)}
            placeholder="Enter your personal ID"
            className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={generatePersonalId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Generate ID
            </button>
            <button
              onClick={() => personalId && (window.location.href = `/${personalId}`)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:personalId" element={<OptionsPage />} />
        <Route path="/survey/:surveyId" element={<SurveyPage />} />
        <Route path="/:personalId/view-results" element={<div>View Results Page (To be implemented)</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;