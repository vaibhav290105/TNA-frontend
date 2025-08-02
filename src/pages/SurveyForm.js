import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

export default function SurveyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [responseId, setResponseId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  // Set edit mode from query param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsEditMode(queryParams.get('mode') === 'edit');
  }, [location.search]);

  // Fetch survey and response data
  useEffect(() => {
    if (isEditMode === null) return;

    const fetchSurvey = async () => {
      try {
        const res = await API.get(`/survey/${id}/my-response`);
        const { title, questions, answers, status, responseId } = res.data;

        setSurvey({ title, questions });
        setAnswers(answers || new Array(questions.length).fill(''));
        setResponseId(responseId);

        if (status === 'Completed' && !isEditMode) {
          setSubmitted(true);
        }
      } catch (err) {
        console.error(err);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = '❌ Failed to load survey';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id, isEditMode, navigate]);

  // Handle input change with validation
  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
    
    // Clear validation error for this field
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  // Validate current step
  const validateStep = (stepIndex) => {
    const errors = {};
    const answer = answers[stepIndex];
    
    if (!answer || answer.trim() === '') {
      errors[stepIndex] = 'This field is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate to next question
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < survey.questions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Navigate to previous question
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit or update response
  const handleSubmit = async () => {
    // Validate all answers
    const errors = {};
    answers.forEach((answer, index) => {
      if (!answer || answer.trim() === '') {
        errors[index] = 'This field is required';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = '❌ Please fill in all required fields';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && responseId) {
        await API.patch(`/survey/update/${responseId}`, { answers });
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = '✅ Response updated successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } else {
        await API.post('/response/submit', { surveyId: id, answers });
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = '✅ Response submitted successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
      
      setSubmitted(true);
    } catch (err) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = err.response?.data?.msg || '❌ Failed to submit/update response';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect after submit
  useEffect(() => {
    if (submitted) {
      const role = localStorage.getItem('role');
      const redirectPath =
        role === 'employee' ? '/dashboard' :
        role === 'manager' ? '/manager' :
        role === 'hod' ? '/hod' :
        role === 'admin' ? '/admin' :
        role === 'hr' ? '/hr' : '/';

      setTimeout(() => navigate(redirectPath), 2000);
    }
  }, [submitted, navigate]);

  const handleBack = () => {
    const role = localStorage.getItem('role');
    const redirectPath =
      role === 'employee' ? '/dashboard' :
      role === 'manager' ? '/manager' :
      role === 'hod' ? '/hod' :
      role === 'admin' ? '/admin' :
      role === 'hr' ? '/hr' : '/';
    navigate(redirectPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Loading survey...</span>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  const progress = ((currentStep + 1) / survey.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" 
                  alt="IGL Logo" 
                  className="h-12 w-auto rounded-lg shadow-md" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {survey.title}
                </h1>
                <p className="text-blue-200 text-sm">
                  {isEditMode ? 'Edit Your Response' : 'Feedback Survey'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleBack}
              className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                Back
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!submitted ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Question {currentStep + 1} of {survey.questions.length}
                </h2>
                <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {/* Question Indicators */}
              <div className="flex justify-between mt-4">
                {survey.questions.map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                    <span className="text-2xl">❓</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {survey.questions[currentStep]}
                    </h3>
                    
                    <div className="space-y-2">
                      <textarea
                        value={answers[currentStep] || ''}
                        onChange={(e) => handleChange(currentStep, e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white hover:border-blue-300 resize-none ${
                          validationErrors[currentStep] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        rows="4"
                        placeholder="Please provide your detailed response here..."
                        disabled={submitted && !isEditMode}
                      />
                      
                      {validationErrors[currentStep] && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <span>❌</span>
                          {validationErrors[currentStep]}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Characters: {(answers[currentStep] || '').length}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>💡</span>
                          Be specific and detailed in your response
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
              >
                <span className="flex items-center gap-2">
                  <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                  Previous
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
              </button>

              {currentStep < survey.questions.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    Next
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isEditMode ? '✏️ Update Response' : '🚀 Submit Response'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </button>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">Tips for Better Responses</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Be specific and provide concrete examples</li>
                    <li>• Share your honest thoughts and experiences</li>
                    <li>• Consider both positive aspects and areas for improvement</li>
                    <li>• Your feedback helps us improve our services</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Success Message */
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                  <span className="text-6xl">✅</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {isEditMode ? 'Response Updated!' : 'Thank You!'}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {isEditMode 
                    ? 'Your response has been successfully updated.' 
                    : 'Your feedback has been submitted successfully.'
                  }
                </p>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className="text-green-700 font-medium flex items-center justify-center gap-2">
                    <span>🔄</span>
                    Redirecting to dashboard in a moment...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}