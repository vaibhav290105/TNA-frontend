import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const FeedbackList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/survey/assigned-with-status');
      setSurveys(res.data);
    } catch (err) {
      setError('Failed to load feedback forms');
      console.error('Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleFillSurvey = useCallback((surveyId) => {
    navigate(`/survey/${surveyId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading feedback forms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchSurveys}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Assigned Feedback Forms</h2>
          </div>
          <button
            onClick={handleNavigateBack}
            className="group flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">🔙</span>
            Back
          </button>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-500 mb-2">No feedback forms assigned</p>
            <p className="text-gray-400">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <div
                key={survey._id}
                className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {survey.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          survey.status === 'Completed'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}
                      >
                        <span className="mr-1">
                          {survey.status === 'Completed' ? '✅' : '⏳'}
                        </span>
                        {survey.status}
                      </span>
                    </div>
                  </div>
                </div>

                {survey.status === 'Pending' && (
                  <button
                    onClick={() => handleFillSurvey(survey._id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      ✏️ Fill Form
                    </span>
                  </button>
                )}

                {survey.status === 'Completed' && (
                  <div className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-center font-medium">
                    <span className="flex items-center justify-center gap-2">
                      ✅ Completed
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;