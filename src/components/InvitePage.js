import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InvitePage() {
  const { inviteId } = useParams();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const response = await fetch('/.netlify/functions/validate-invite', {
          method: 'POST',
          body: JSON.stringify({ inviteId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to validate invite');
        }

        setIsValid(true);
      } catch (error) {
        console.error('Error validating invite:', error);
        setError(error.message);
      }
    };

    validateInvite();
  }, [inviteId]);

  const startSurvey = async () => {
    setIsStarting(true);
    setError('');
    try {
      const response = await fetch('/.netlify/functions/start-survey', {
        method: 'POST',
        body: JSON.stringify({ inviteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start survey');
      }

      const data = await response.json();
      navigate(`/survey/${data.surveyId}`);
    } catch (error) {
      console.error('Error starting survey:', error);
      setError(error.message);
    } finally {
      setIsStarting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Invite</h1>
            <p className="text-red-500 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Invite</h1>
          {isValid ? (
            <>
              <p className="text-sm text-gray-400">
                You have been invited to participate in a survey. Click the button below to start. The generated survey link will be persistent, allowing you to revisit the survey at any time.
              </p>
              <div className="mt-8 space-y-6">
                <button 
                  onClick={startSurvey}
                  disabled={isStarting}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline block text-center transition duration-150 ease-in-out ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isStarting ? 'Starting...' : 'Start Survey'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Validating invite link...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvitePage;