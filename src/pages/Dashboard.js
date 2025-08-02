import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import EmployeeNavbar from '../components/EmployeeNavbar';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSurveys, setShowSurveys] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const department = localStorage.getItem('department');

  // Fetch user details including assigned manager
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('Failed to load user profile');
    }
  }, []);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/survey/assigned-with-status');
      setSurveys(res.data);
      setShowSurveys(true);
    } catch (err) {
      console.error('Failed to fetch surveys:', err);
      setError('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchSurveys();
  }, [fetchUserProfile, fetchSurveys]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/');
  }, [navigate]);

  const handleSurveyClick = useCallback((surveyId) => {
    navigate(`/survey/${surveyId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EmployeeNavbar fetchSurveys={fetchSurveys} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <span className="text-2xl text-white">👋</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome, {name || 'Employee'}!
              </h2>
              <p className="text-gray-600 text-lg">Ready to make a difference today</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">📂</span>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold text-gray-800">{department}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">🧑‍💻</span>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-800">{role}</p>
                </div>
              </div>
            </div>

            <div>
              {user?.manager ? (
                <div className="p-4 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">👨‍💼</span>
                    <h3 className="font-semibold text-lg text-gray-800">Assigned Manager</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{user.manager.name}</p>
                    <p className="text-gray-600 text-sm">{user.manager.email}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👨‍💼</span>
                    <p className="text-gray-500 italic">No manager assigned yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Survey Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📑</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Assigned Feedback Forms</h3>
            </div>
            <button
              onClick={fetchSurveys}
              className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="group-hover:rotate-180 transition-transform duration-300">🔄</span>
              Refresh
            </button>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-blue-600 font-medium">Loading feedback forms...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
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
          )}

          {/* Survey List */}
          {!loading && !error && showSurveys && (
            <>
              {surveys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl text-gray-500 mb-2">No feedback forms assigned</p>
                  <p className="text-gray-400">Check back later for new assignments</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {surveys.map((survey) => (
                    <div
                      key={survey._id}
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                      onClick={() => handleSurveyClick(survey._id)}
                    >
                      <div className="mb-4">
                        <h4 className="text-lg font-bold text-blue-600 group-hover:text-blue-700 transition-colors mb-2">
                          {survey.title}
                        </h4>
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

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Click to {survey.status === 'Completed' ? 'view' : 'fill'}</span>
                        <span className="text-blue-500 group-hover:translate-x-1 transition-transform duration-300">
                          →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;