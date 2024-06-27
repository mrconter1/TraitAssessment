import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import OptionsPage from './components/OptionsPage';
import SurveyPage from './components/SurveyPage';
import InvitePage from './components/InvitePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:personalId" element={<OptionsPage />} />
        <Route path="/survey/:surveyId" element={<SurveyPage />} />
        <Route path="/:personalId/view-results" element={<div>View Results Page (To be implemented)</div>} />
        <Route path="/invite/:inviteId" element={<InvitePage />} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;