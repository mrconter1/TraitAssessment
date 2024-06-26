import React, { useState, useEffect } from 'react';
import questionsData from './questions.json';

function App() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(questionsData.questions);
  }, []);

  return (
    <div className="App">
      <h1>Trait Assessment</h1>
      {questions.map((category, index) => (
        <div key={index}>
          <h2>{category.category}</h2>
          {category.traits.map((trait, traitIndex) => (
            <div key={traitIndex}>
              <h3>{trait.trait}</h3>
              <p>{trait.description}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;