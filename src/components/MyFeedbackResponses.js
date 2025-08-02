import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const MyFeedbackResponses = () => {
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/survey/my-responses');
      setResponses(res.data);
    } catch (err) {
      setError('Failed to load feedback responses');
      console.error('Error fetching responses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const handleDelete = useCallback(async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;
    
    try {
      await API.delete(`/survey/response/${surveyId}`);
      setResponses((prev) => prev.filter((r) => r.surveyId !== surveyId));
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      successDiv.innerHTML = '✅ Response deleted successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.remove();
      }, 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete response');
    }
  }, []);

  const handleEdit = useCallback((surveyId) => {
    navigate(`/survey/${surveyId}?mode=edit`);
  }, [navigate]);

  const handleViewResponse = useCallback((response) => {
    setSelectedResponse(response);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedResponse(null);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your responses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchResponses}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">My Feedback Form Responses</h2>
          </div>
          <button
            onClick={handleNavigateBack}
            className="group flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back
          </button>
        </div>

        {responses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-500 mb-2">No feedback responses submitted yet</p>
            <p className="text-gray-400">Your submitted responses will appear here</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {responses.map((response, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-blue-700 mb-2 group-hover:text-blue-800 transition-colors">
                    {response.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      📅 {new Date(response.submittedAt).toLocaleDateString() || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() => handleViewResponse(response)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    title="View Response"
                  >
                    <span className="flex items-center justify-center gap-1">
                      👁️ View
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleEdit(response.surveyId)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    title="Edit Response"
                  >
                    <span className="flex items-center justify-center gap-1">
                      ✏️ Edit
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(response.surveyId)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    title="Delete Response"
                  >
                    <span className="flex items-center justify-center gap-1">
                      🗑️ Delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing response */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">{selectedResponse.title}</h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <span className="text-gray-500 hover:text-gray-800 text-xl">✖</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                📅 Submitted on: {new Date(selectedResponse.submittedAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedResponse.questions.map((question, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-800 mb-2">{question}</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">
                      {selectedResponse.answers[i] || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFeedbackResponses;