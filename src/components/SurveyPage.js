// SurveyPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SurveyPage() {
  const { surveyId } = useParams();
  const [questionsData, setQuestionsData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAndFetchSurvey = async () => {
      try {
        // First, validate the survey
        const validateResponse = await fetch('/.netlify/functions/validate-survey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ surveyId }),
        });

        if (!validateResponse.ok) {
          const errorData = await validateResponse.json();
          throw new Error(errorData.error || 'Failed to validate survey');
        }

        // If validation succeeds, fetch the questions
        const questionsResponse = await fetch('/.netlify/functions/get-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ survey_id: surveyId }),
        });

        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await questionsResponse.json();
        setQuestionsData(data);

        // Initialize answers state
        const initialAnswers = {};
        data.questions.forEach((question) => {
          const existingResponse = data.responses.find((res) => res.question_id === question.id);
          initialAnswers[question.id] = existingResponse ? existingResponse.selection : 'prefer_not_to_answer';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchSurvey();
  }, [surveyId]);

  const handleAnswer = async (traitId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [traitId]: value,
    }));

    try {
      await fetch('/.netlify/functions/save-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          survey_id: surveyId,
          question_id: traitId,
          selection: value,
        }),
      });
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Survey Error</h1>
            <p className="text-red-500 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Reverse the order of alternatives
  const reversedAlternatives = [...questionsData.standardizedAlternatives].reverse();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Survey</h1>
        <p className="text-center mb-8 text-gray-400">Survey ID: {surveyId}</p>
        <div className="space-y-12">
          {questionsData.categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">{category.name}</h2>
              <div className="space-y-8">
                {questionsData.questions
                  .filter((question) => question.category_ref['@ref'].id === category.id)
                  .map((trait) => (
                    <div key={trait.id} className="bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3">{trait.trait}</h3>
                      <p className="text-gray-300 mb-4">{trait.description}</p>
                      <div className="space-y-2">
                        {reversedAlternatives.map((alternative, altIndex) => (
                          <React.Fragment key={altIndex}>
                            <label
                              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`trait-${trait.id}`}
                                value={alternative.value}
                                checked={answers[trait.id] === alternative.value}
                                onChange={() => handleAnswer(trait.id, alternative.value)}
                                className="form-radio h-5 w-5 text-blue-600 cursor-pointer"
                              />
                              <span className="text-sm sm:text-base flex-grow">{alternative.description}</span>
                            </label>
                            {altIndex === reversedAlternatives.length - 2 && (
                              <hr className="my-2 border-gray-500" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
            Submit Survey
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurveyPage;