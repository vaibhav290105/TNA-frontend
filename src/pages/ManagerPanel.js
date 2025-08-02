import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useLocation } from 'react-router-dom';

export default function ManagerPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.defaultTab || 'review');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [mappedEmployees, setMappedEmployees] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
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
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const endpoint = tab === 'review'
          ? '/training-request/manager-review'
          : '/training-request/my-requests';
        const res = await API.get(endpoint);
        setRequests(res.data);
      } catch {
        alert('Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [tab]);

  useEffect(() => {
    const fetchManagerInfo = async () => {
      try {
        const res = await API.get('/auth/me');
        setCurrentUser(res.data);
        setMappedEmployees(res.data.mappedEmployees || []);
      } catch {
        alert('Failed to load manager info');
      }
    };
    fetchManagerInfo();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await API.patch(`/training-request/manager-review/${id}`, { decision });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setSelectedRequest(null);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `✅ Request ${decision === 'approve' ? 'approved' : 'rejected'} successfully!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch {
      alert('Failed to update request');
    }
  };

  const detailLabels = {
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

  const statusBadge = (status) => {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border';

    switch (status) {
      case 'Pending_Manager':
        return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
      case 'Approved_By_Manager':
        return `${base} bg-blue-100 text-blue-700 border-blue-200`;
      case 'Rejected_By_Manager':
        return `${base} bg-red-100 text-red-700 border-red-200`;
      case 'Pending_HOD':
        return `${base} bg-yellow-200 text-yellow-800 border-yellow-300`;
      case 'Approved_By_HOD':
        return `${base} bg-blue-200 text-blue-800 border-blue-300`;
      case 'Rejected_By_HOD':
        return `${base} bg-red-200 text-red-800 border-red-300`;
      case 'Pending_HR':
        return `${base} bg-yellow-300 text-yellow-900 border-yellow-400`;
      case 'Approved_By_HR':
        return `${base} bg-blue-300 text-blue-900 border-blue-400`;
      case 'Rejected_By_HR':
        return `${base} bg-red-300 text-red-900 border-red-400`;
      case 'Pending_Admin':
        return `${base} bg-yellow-400 text-yellow-900 border-yellow-500`;
      case 'Approved_By_Admin':
        return `${base} bg-green-100 text-green-700 border-green-200`;
      case 'Rejected_By_Admin':
        return `${base} bg-red-100 text-red-700 border-red-200`;
      case 'Cancelled':
        return `${base} bg-gray-300 text-gray-700 border-gray-400`;
      default:
        return `${base} bg-gray-100 text-gray-700 border-gray-200`;
    }
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Manager Dashboard
                </h1>
                {currentUser && (
                  <p className="text-blue-200 text-sm">Welcome, {currentUser.name}</p>
                )}
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
                onClick={() => navigate('/profile')}
                className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  👤 <span className="hidden sm:inline">Profile</span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
              </button>

              <button
                onClick={handleLogout}
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Modern Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
            <div className="flex space-x-2">
              {[
                { id: 'review', label: 'Review Requests', icon: '📝' },
                { id: 'submitted', label: 'My Requests', icon: '📤' }
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    tab === tabItem.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-lg">{tabItem.icon}</span>
                  <span className="hidden sm:inline">{tabItem.label}</span>
                </button>
              ))}
              
              <button
                onClick={() => navigate('/training-request')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-lg">➕</span>
                <span className="hidden sm:inline">New Request</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mapped Employees Section */}
        <div className="mb-10 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Employees Assigned to You</h2>
          </div>
          
          {mappedEmployees.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl text-gray-500 mb-2">No employees assigned yet</p>
              <p className="text-gray-400">Assigned employees will appear here</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mappedEmployees.map((emp) => (
                <div
                  key={emp._id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{emp.name}</h3>
                      <p className="text-xs text-gray-600">{emp.department}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <span>📧</span> {emp.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">{tab === 'review' ? '📝' : '📤'}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {tab === 'review' ? 'Pending Requests for Review' : 'My Submitted Requests'}
              </h2>
            </div>
            
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              
              {tab === 'submitted' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">All Status</option>
                  <option value="Pending_Manager">Pending Manager</option>
                  <option value="Approved_By_Manager">Approved by Manager</option>
                  <option value="Rejected_By_Manager">Rejected by Manager</option>
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-blue-600 font-medium">Loading requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-gray-500 mb-2">No training requests found</p>
              <p className="text-gray-400">
                {tab === 'review' ? 'All caught up! Check back later.' : 'Your submitted requests will appear here'}
              </p>
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
                        <span className={statusBadge(req.status)}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {req.requestNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            👁️
                          </button>
                          
                          {tab === 'review' ? (
                            <>
                              <button
                                onClick={() => handleDecision(req._id, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Approve"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => handleDecision(req._id, 'reject')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Reject"
                              >
                                ❌
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/training-form/${req._id}`)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this request?')) {
                                    await API.delete(`/training-request/${req._id}`);
                                    setRequests(requests.filter((r) => r._id !== req._id));
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </>
                          )}
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

      {/* Enhanced Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-xl">🗂️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Training Request Details</h3>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
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
                    <span className="text-sm font-semibold text-gray-600">Employee:</span>
                    <span className="font-bold text-gray-800">{selectedRequest.user?.name || 'You'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Department:</span>
                    <span className="text-gray-800">{selectedRequest.user?.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Location:</span>
                    <span className="text-gray-800">{selectedRequest.user?.location}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Request ID:</span>
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {selectedRequest.requestNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <span className={statusBadge(selectedRequest.status)}>
                      {selectedRequest.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Date Submitted:</span>
                    <span className="text-gray-800">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(detailLabels).map(([key, label]) => (
                  <div key={key} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-800">
                        {selectedRequest[key] || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    ✖ Close
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}