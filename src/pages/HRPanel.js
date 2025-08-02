import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function HRPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.defaultTab || 'review');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
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
    trainingFrequency: ''
  });

  const navigate = useNavigate();
  
  const fieldLabels = {
    generalSkills: "Skills to Improve",
    toolsTraining: "Tools for Training",
    softSkills: "Soft Skills Training",
    confidenceLevel: "Tool Confidence Level",
    technicalSkills: "Technical Skills to Learn",
    dataTraining: "Data/Reporting Training",
    roleChallenges: "Current Role Challenges",
    efficiencyTraining: "Job Efficiency Training",
    certifications: "Interested Certifications",
    careerGoals: "2-Year Career Goal",
    careerTraining: "Training for Career Goal",
    trainingFormat: "Preferred Format",
    trainingDuration: "Preferred Duration",
    learningPreference: "Learning Style",
    pastTraining: "Past Trainings",
    pastTrainingFeedback: "Feedback on Past Trainings",
    trainingImprovement: "Suggested Improvements",
    areaNeed: "Urgent Training Areas",
    trainingFrequency: "Training Frequency"
  };

  const dropdownOptions = {
    confidenceLevel: ['Low', 'Medium', 'High'],
    trainingFormat: ['Online', 'In-person', 'Blended'],
    trainingDuration: ['1 week', '2 weeks', '1 month', '3 months'],
    learningPreference: ['Self-paced', 'Instructor-led', 'Peer learning'],
    trainingFrequency: ['Monthly', 'Quarterly', 'Yearly'],
  };

  useEffect(() => {
    fetchAssignedFeedbacks();
  }, []);

  const fetchAssignedFeedbacks = async () => {
    try {
      const res = await API.get('/survey/assigned-with-status');
      setFeedbacks(res.data);
      const pending = res.data.filter(s => s.status === 'Pending');
      setPendingCount(pending.length);
    } catch (err) {
      console.error('Failed to fetch assigned feedback forms');
    }
  };

  useEffect(() => {
    if (tab === 'review') fetchPendingHRRequests();
    if (tab === 'my') fetchMyRequests();
  }, [tab]);

  const fetchPendingHRRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/training-request/hr-review');
      setRequests(res.data);
    } catch (err) {
      alert('Failed to load HR review requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/training-request/my-requests');
      setRequests(res.data);
    } catch (err) {
      alert('Failed to fetch your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleHRDecision = async (id, decision) => {
    try {
      await API.patch(`/training-request/hr-review/${id}`, { decision });
      fetchPendingHRRequests();
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `✅ Request ${decision === 'approve' ? 'approved' : 'rejected'} successfully!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/training-request/submit', formData);
      alert('✅ Training request submitted by HR');
      setFormData({
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
        trainingFrequency: ''
      });
      setTab('my');
    } catch {
      alert('❌ Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await API.delete(`/training-request/${id}`);
      alert('Request deleted successfully');
      fetchMyRequests(); 
    } catch {
      alert('Failed to delete request');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status.includes('Rejected')) return 'bg-red-100 text-red-600 border-red-200';
    if (status.includes('Approved')) return 'bg-green-100 text-green-600 border-green-200';
    return 'bg-blue-100 text-blue-600 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" 
                  alt="IGL Logo" 
                  className="h-12 w-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
                  HR Dashboard
                </h1>
                <p className="text-indigo-200 text-sm">Human Resources Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Feedback Form Button with Badge */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (feedbacks.length === 0) {
                      alert('No feedback forms assigned.');
                      return;
                    }
                    navigate('/feedback');
                  }}
                  className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    📝 <span className="hidden sm:inline">Feedback Form</span>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </button>
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </div>

              <button
                onClick={() => navigate('/my-feedback-responses')}
                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  📄 <span className="hidden sm:inline">My Responses</span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
              </button>

              <button
                onClick={logout}
                className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  🚪 <span className="hidden sm:inline">Logout</span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Modern Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
            <div className="flex space-x-2">
              {[
                { id: 'review', label: 'Review Requests', icon: '📋' },
                { id: 'submit', label: 'Submit Request', icon: '➕' },
                { id: 'my', label: 'My Requests', icon: '📤' }
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    tab === tabItem.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <span className="text-lg">{tabItem.icon}</span>
                  <span className="hidden sm:inline">{tabItem.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review Tab */}
        {tab === 'review' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Pending HR Review</h2>
                </div>
                
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Status</option>
                    <option value="Pending_HR">Pending HR</option>
                    <option value="Approved_By_HOD">Approved by HOD</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-indigo-600 font-medium">Loading requests...</span>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl text-gray-500 mb-2">No pending requests</p>
                  <p className="text-gray-400">All caught up! Check back later.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request ID</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRequests.map((req, index) => (
                        <tr key={req._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                              {req.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              {req.requestNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => handleHRDecision(req._id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Approve"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => handleHRDecision(req._id, 'reject')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Reject"
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Tab */}
        {tab === 'submit' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <span className="text-2xl">➕</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Submit Training Request</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(formData).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {fieldLabels[key] || key}
                  </label>
                  {dropdownOptions[key] ? (
                    <select
                      name={key}
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white hover:border-indigo-300"
                    >
                      <option value="">Select an option</option>
                      {dropdownOptions[key].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={key}
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white hover:border-indigo-300"
                      placeholder={`Enter ${fieldLabels[key]?.toLowerCase() || key}`}
                    />
                  )}
                </div>
              ))}

              <div className="md:col-span-2 flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🚀 Submit Request
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Requests Tab */}
        {tab === 'my' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-2xl">📤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">My Submitted Requests</h2>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search my requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-indigo-600 font-medium">Loading your requests...</span>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl text-gray-500 mb-2">No requests submitted yet</p>
                  <p className="text-gray-400">Your submitted requests will appear here</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request ID</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRequests.map((req) => (
                        <tr key={req._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                              {req.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              {req.requestNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => navigate(`/training-form/${req._id}`)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(req._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-xl">📑</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Training Request Details</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <span className="text-gray-500 hover:text-gray-800 text-xl">✖</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Date Submitted:</span>
                    <span className="text-sm text-gray-800">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Request ID:</span>
                    <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {selectedRequest.requestNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(fieldLabels).map(([key, label]) => (
                  <div key={key} className="border-l-4 border-indigo-500 pl-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-800">
                        {selectedRequest[key] || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {tab === 'review' && (
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleHRDecision(selectedRequest._id, 'approve');
                      setShowModal(false);
                    }}
                    className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      ✅ Approve Request
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => {
                      handleHRDecision(selectedRequest._id, 'reject');
                      setShowModal(false);
                    }}
                    className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      ❌ Reject Request
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}