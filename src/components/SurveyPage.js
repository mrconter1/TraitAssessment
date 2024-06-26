import React from 'react';
import { useParams } from 'react-router-dom';
import questionsData from '../questions.json';

function SurveyPage() {
  const { surveyId } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Survey</h1>
        <p className="text-center mb-8">Survey ID: {surveyId}</p>
        <div className="space-y-8">
          {questionsData.questions.map((category, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-md">
              <h2 className="text-2xl font-bold mb-4 text-center">{category.category}</h2>
              <div className="space-y-6">
                {category.traits.map((trait, traitIndex) => (
                  <div key={traitIndex} className="bg-gray-700 p-4 rounded-md">
                    <h3 className="text-xl font-semibold mb-2 text-center">{trait.trait}</h3>
                    <p className="text-gray-300 text-center mb-4">{trait.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {questionsData.standardized_alternatives.map((alternative, altIndex) => (
                        <label key={altIndex} className="flex items-center space-x-2 bg-gray-600 p-2 rounded">
                          <input type="radio" name={`trait-${traitIndex}`} value={altIndex + 1} className="form-radio" />
                          <span>{alternative}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SurveyPage;