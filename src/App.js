import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SurveyForm from './pages/SurveyForm';
import AdminPanel from './pages/AdminPanel';
import AdminResponses from './pages/AdminResponses';
import TrainingForm from './pages/TrainingForm';
import MyTrainingRequests from './pages/MyTrainingRequests';
import ManagerPanel from './pages/ManagerPanel';
import Profile from './pages/Profile';
import HODPanel from './pages/HODPanel';
import HRPanel from './pages/HRPanel';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Trainingformupdate from './pages/Trainingformupdate';
import FeedbackList from './components/FeedbackList';
import MyFeedbackResponses from './components/MyFeedbackResponses';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/survey/:id" element={<SurveyForm />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/survey/:id/responses" element={<AdminResponses />} />
          <Route path="/training-request" element={<TrainingForm />} />
          <Route path="/my-training-requests" element={<MyTrainingRequests />} />
          <Route path="/manager" element={<ManagerPanel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hod" element={<HODPanel />} />
          <Route path="/hr" element={<HRPanel />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/training-form/:id" element={<Trainingformupdate />} />
          <Route path="/feedback" element={<FeedbackList />} />
          <Route path="/my-feedback-responses" element={<MyFeedbackResponses />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;