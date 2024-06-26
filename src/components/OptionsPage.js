import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserCircleIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/solid';

function OptionsPage() {
  const { personalId } = useParams();
  const [surveyId, setSurveyId] = useState('');
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef(null);

  const generateSurveyLink = () => {
    const newSurveyId = Array(10).fill(0).map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    setSurveyId(newSurveyId);
    
    // Store the association between personalId and surveyId
    const surveys = JSON.parse(localStorage.getItem('surveys') || '{}');
    if (!surveys[personalId]) {
      surveys[personalId] = [];
    }
    surveys[personalId].push(newSurveyId);
    localStorage.setItem('surveys', JSON.stringify(surveys));
  };

  const copyToClipboard = () => {
    linkInputRef.current.select();
    document.execCommand('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p className="text-sm text-gray-400">You are logged in as:</p>
          <div className="flex items-center justify-center mt-1">
            <UserCircleIcon className="h-6 w-6 text-blue-400 mr-2" />
            <p className="text-lg font-semibold text-blue-400">{personalId}</p>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <button 
            onClick={generateSurveyLink}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center transition duration-150 ease-in-out"
          >
            Generate Survey Link
          </button>
          {surveyId && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Survey Link:</p>
              <div className="flex items-center">
                <input
                  ref={linkInputRef}
                  type="text"
                  value={`${window.location.origin}/survey/${surveyId}`}
                  readOnly
                  className="flex-grow bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r focus:outline-none transition duration-150 ease-in-out"
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-green-500 mt-2">Copied to clipboard!</p>
              )}
            </div>
          )}
          <Link 
            to={`/${personalId}/view-results`}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center transition duration-150 ease-in-out"
          >
            View Survey Results
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;