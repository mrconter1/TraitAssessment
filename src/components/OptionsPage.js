import React from 'react';
import { useParams, Link } from 'react-router-dom';

function OptionsPage() {
  const { personalId } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center">Welcome, {personalId}</h1>
        <div className="mt-8 space-y-6">
          <Link 
            to={`/${personalId}/create-survey`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center"
          >
            Create Survey Link
          </Link>
          <Link 
            to={`/${personalId}/view-results`}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center"
          >
            View Survey Results
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;