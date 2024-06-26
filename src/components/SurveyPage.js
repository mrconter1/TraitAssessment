import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import questionsData from '../questions.json';

function SurveyPage() {
  const { surveyId } = useParams();
  const [answers, setAnswers] = useState({});

  const handleAnswer = (categoryIndex, traitIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [categoryIndex]: {
        ...prev[categoryIndex],
        [traitIndex]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Survey</h1>
        <p className="text-center mb-8 text-gray-400">Survey ID: {surveyId}</p>
        <div className="space-y-12">
          {questionsData.questions.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">{category.category}</h2>
              <div className="space-y-8">
                {category.traits.map((trait, traitIndex) => (
                  <div key={traitIndex} className="bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">{trait.trait}</h3>
                    <p className="text-gray-300 mb-4">{trait.description}</p>
                    <div className="space-y-2">
                      {questionsData.standardized_alternatives.map((alternative, altIndex) => (
                        <label 
                          key={altIndex} 
                          className="flex items-center space-x-3 p-2 rounded hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`category-${categoryIndex}-trait-${traitIndex}`}
                            value={altIndex + 1}
                            checked={answers[categoryIndex]?.[traitIndex] === altIndex + 1}
                            onChange={() => handleAnswer(categoryIndex, traitIndex, altIndex + 1)}
                            className="form-radio h-5 w-5 text-blue-600 cursor-pointer"
                          />
                          <span className="text-sm sm:text-base flex-grow">{alternative}</span>
                        </label>
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