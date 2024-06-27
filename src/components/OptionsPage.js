import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserCircleIcon, ClipboardIcon, CheckIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';

function OptionsPage() {
  const { personalId } = useParams();
  const [inviteLinks, setInviteLinks] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const linkInputRef = useRef(null);

  const generateInviteLink = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await fetch('/.netlify/functions/create-invite', {
        method: 'POST',
        body: JSON.stringify({ personalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invite');
      }

      const data = await response.json();
      setInviteLinks((prev) => [...prev, data.inviteId]);
    } catch (error) {
      console.error('Error generating invite link:', error);
      setError('Failed to generate invite link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 3000);
    });
  };

  const handleLogout = () => {
    Cookies.remove('personalId');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
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
            onClick={generateInviteLink}
            disabled={isGenerating}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center transition duration-150 ease-in-out ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? 'Generating...' : 'Generate Invite Link'}
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {inviteLinks.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Invite Links:</p>
              {inviteLinks.map((inviteId, index) => {
                const inviteLink = `${window.location.origin}/invite/${inviteId}`;
                return (
                  <div key={index} className="mb-4">
                    <div className="flex items-stretch">
                      <input
                        ref={linkInputRef}
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-grow bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(inviteLink)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded-r focus:outline-none transition duration-150 ease-in-out flex items-center justify-center"
                      >
                        {copiedLink === inviteLink ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {copiedLink === inviteLink && (
                      <p className="text-green-500 mt-2">Copied to clipboard!</p>
                    )}
                  </div>
                );
              })}
              <p className="text-sm text-gray-400 mt-2">
                These invite links will create persistent survey links that can be revisited.
              </p>
            </div>
          )}
          <Link 
            to={`/${personalId}/view-results`}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center transition duration-150 ease-in-out"
          >
            View Survey Results
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center transition duration-150 ease-in-out flex items-center justify-center"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;