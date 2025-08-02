import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function TrainingRequestForm() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    generalSkills: '',
    toolsTraining: '',
    softSkills: '',
    confidenceLevel: '',
    technicalSkills: '',
    dataTraining: '',
    roleChallenges: '',
    efficiencyTraining: '',
    certifications: '',
    careerGoals: '',
    careerTraining: '',
    trainingFormat: '',
    trainingDuration: '',
    learningPreference: '',
    pastTraining: '',
    pastTrainingFeedback: '',
    trainingImprovement: '',
    areaNeed: '',
    trainingFrequency: '',
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/training-request/submit', formData);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = '✅ Training request submitted successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
        if (role === 'manager') navigate('/manager');
        else navigate('/dashboard');
      }, 2000);
    } catch (err) {
      alert('❌ Error submitting training request.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (role === 'manager') navigate('/manager');
    else navigate('/dashboard');
  };

  const nextStep = () => {
    if (currentStep < fieldGroups.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const fieldGroups = [
    {
      title: "Skills & Training Needs",
      icon: "🎯",
      fields: [
        { label: 'What skills do you feel you need to improve?', name: 'generalSkills', type: 'textarea' },
        { label: "Tools or software you'd like to get trained on?", name: 'toolsTraining' },
        { label: 'Need training in communication, leadership, or soft skills?', name: 'softSkills' },
        { label: 'Confidence level with tools (Excel, SAP, etc.)?', name: 'confidenceLevel', type: 'select', options: ['', 'Low', 'Medium', 'High'] },
        { label: "Technical skills you'd like to learn?", name: 'technicalSkills' },
      ]
    },
    {
      title: "Role & Performance",
      icon: "💼",
      fields: [
        { label: 'Need training in data analysis or reporting?', name: 'dataTraining' },
        { label: 'Challenges in your current role?', name: 'roleChallenges', type: 'textarea' },
        { label: 'Training to perform your job better?', name: 'efficiencyTraining' },
        { label: "Certifications you're interested in?", name: 'certifications' },
      ]
    },
    {
      title: "Career Development",
      icon: "🚀",
      fields: [
        { label: 'Where do you see yourself in 2 years?', name: 'careerGoals', type: 'textarea' },
        { label: 'Training needed to reach your goals?', name: 'careerTraining' },
        { label: 'Area you need most training in:', name: 'areaNeed', type: 'select', options: ['', 'Technical Skills', 'Communication', 'Leadership', 'Time Management', 'Other'] },
      ]
    },
    {
      title: "Training Preferences & History",
      icon: "📚",
      fields: [
        { label: 'Preferred training format?', name: 'trainingFormat', type: 'select', options: ['', 'In-person', 'Online Live', 'Self-paced'] },
        { label: 'Preferred duration?', name: 'trainingDuration', type: 'select', options: ['', '1 Day', '1 Week', 'Short Sessions'] },
        { label: 'Learning preference?', name: 'learningPreference', type: 'select', options: ['', 'Individual', 'Team-based'] },
        { label: 'Attended any training in the last 6 months?', name: 'pastTraining' },
        { label: 'Was it relevant and helpful?', name: 'pastTrainingFeedback' },
        { label: 'Suggestions for improvement?', name: 'trainingImprovement', type: 'textarea' },
        { label: 'Training frequency preferred:', name: 'trainingFrequency', type: 'select', options: ['', 'Monthly', 'Quarterly', 'Bi-annually', 'Annually'] },
      ]
    }
  ];

  const currentGroup = fieldGroups[currentStep - 1];
  const progress = (currentStep / fieldGroups.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-6">
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
                  Training Request Form
                </h1>
                <p className="text-blue-200 text-sm">Professional Development Application</p>
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

      <div className="max-w-5xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Step {currentStep} of {fieldGroups.length}: {currentGroup.title}
            </h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {fieldGroups.map((group, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  index + 1 <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1 < currentStep ? '✓' : group.icon}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {group.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
              <span className="text-3xl">{currentGroup.icon}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{currentGroup.title}</h3>
              <p className="text-gray-600">Please provide detailed information for better training recommendations</p>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentGroup.fields.map((field, index) => (
                <div key={index} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white hover:border-blue-300 resize-none"
                      rows="4"
                      placeholder={`Please describe ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white hover:border-blue-300"
                    >
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt || 'Select an option'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white hover:border-blue-300"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
              >
                <span className="flex items-center gap-2">
                  <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                  Previous
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
              </button>

              {currentStep < fieldGroups.length ? (
                <button
                  type="button"
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🚀 Submit Training Request
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-blue-800 mb-2">Need Help?</h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Be as specific as possible in your responses. This information helps us recommend the most suitable training programs for your professional development. 
                You can always edit your request after submission if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}