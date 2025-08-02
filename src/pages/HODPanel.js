import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useLocation } from 'react-router-dom';

export default function HODPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.defaultTab || 'review');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [mappedEmployees, setMappedEmployees] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerMapDept, setManagerMapDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [formData, setFormData] = useState({
    generalSkills: '', toolsTraining: '', softSkills: '', confidenceLevel: '',
    technicalSkills: '', dataTraining: '', roleChallenges: '', efficiencyTraining: '',
    certifications: '', careerGoals: '', careerTraining: '', trainingFormat: '',
    trainingDuration: '', learningPreference: '', pastTraining: '', pastTrainingFeedback: '',
    trainingImprovement: '', areaNeed: '', trainingFrequency: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (tab === 'review') fetchHODRequests();
    if (tab === 'my') fetchMyRequests();
    if (tab === 'map') fetchUsersForMapping();
  }, [tab]);

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

  const fetchHODRequests = () => {
    setLoading(true);
    API.get('/training-request/hod-review')
      .then(res => setRequests(res.data))
      .catch(() => alert('Failed to load HOD review requests'))
      .finally(() => setLoading(false));
  };

  const fetchMyRequests = () => {
    setLoading(true);
    API.get('/training-request/my-requests')
      .then(res => setRequests(res.data))
      .catch(() => alert('Failed to load your training requests'))
      .finally(() => setLoading(false));
  };

  const fetchMappedEmployees = async (managerId) => {
    try {
      const res = await API.get(`/auth/users/manager/${managerId}`);
      setMappedEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch mapped employees:', err);
    }
  };

  const fetchUsersForMapping = async () => {
    try {
      const usersRes = await API.get('/auth/users');
      const currentDepartment = localStorage.getItem('department');
      const nonHODs = usersRes.data.filter(u => u.department === currentDepartment);
      setEmployees(nonHODs.filter(u => u.role === 'employee'));
      setManagers(nonHODs.filter(u => u.role === 'manager'));
    } catch (err) {
      alert('Failed to fetch users');
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      await API.patch(`/training-request/hod-review/${id}`, { decision });
      fetchHODRequests();
      
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

  const handleMapping = async (employeeId, managerId) => {
    try {
      const employee = employees.find(emp => emp._id === employeeId);
      
      if (employee.manager) {
        alert(`${employee.name} is already assigned to a manager.`);
        return;
      }

      await API.patch(`/auth/users/${employeeId}/assign-manager`, { managerId });
      alert('Mapping updated');
      fetchUsersForMapping();
      fetchMappedEmployees(managerId);
    } catch {
      alert('Mapping failed');
    }
  };

  const handleUnmapping = async (employeeId) => {
    try {
      await API.patch(`/auth/users/${employeeId}/unassign-manager`, { managerId: selectedManager._id });
      alert('Employee unmapped from manager');

      fetchUsersForMapping(); 
      if (selectedManager?._id) {
        fetchMappedEmployees(selectedManager._id);
      }
    } catch {
      alert('Failed to unmap employee');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/training-request/submit', formData);
      alert('✅ Training request submitted successfully!');
      setFormData({
        generalSkills: '', toolsTraining: '', softSkills: '', confidenceLevel: '',
        technicalSkills: '', dataTraining: '', roleChallenges: '', efficiencyTraining: '',
        certifications: '', careerGoals: '', careerTraining: '', trainingFormat: '',
        trainingDuration: '', learningPreference: '', pastTraining: '', pastTrainingFeedback: '',
        trainingImprovement: '', areaNeed: '', trainingFrequency: '',
      });
      setTab('my');
    } catch {
      alert('❌ Error submitting training request.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const fields = [
    { label: 'What skills do you feel you need to improve?', name: 'generalSkills', type: 'textarea' },
    { label: "Tools or software you'd like to get trained on?", name: 'toolsTraining' },
    { label: 'Need training in communication, leadership, or soft skills?', name: 'softSkills' },
    { label: 'Confidence level with tools (Excel, SAP, etc.)?', name: 'confidenceLevel' },
    { label: "Technical skills you'd like to learn?", name: 'technicalSkills' },
    { label: 'Need training in data analysis or reporting?', name: 'dataTraining' },
    { label: 'Challenges in your current role?', name: 'roleChallenges', type: 'textarea' },
    { label: 'Training to perform your job better?', name: 'efficiencyTraining' },
    { label: "Certifications you're interested in?", name: 'certifications' },
    { label: 'Where do you see yourself in 2 years?', name: 'careerGoals', type: 'textarea' },
    { label: 'Training needed to reach your goals?', name: 'careerTraining' },
    { label: 'Preferred training format?', name: 'trainingFormat', type: 'select', options: ['', 'In-person', 'Online Live', 'Self-paced'] },
    { label: 'Preferred duration?', name: 'trainingDuration', type: 'select', options: ['', '1 Day', '1 Week', 'Short Sessions'] },
    { label: 'Learning preference?', name: 'learningPreference', type: 'select', options: ['', 'Individual', 'Team-based'] },
    { label: 'Attended any training in the last 6 months?', name: 'pastTraining' },
    { label: 'Was it relevant and helpful?', name: 'pastTrainingFeedback' },
    { label: 'Suggestions for improvement?', name: 'trainingImprovement', type: 'textarea' },
    { label: 'Area you need most training in:', name: 'areaNeed', type: 'select', options: ['', 'Technical Skills', 'Communication', 'Leadership', 'Time Management', 'Other'] },
    { label: 'Training frequency preferred:', name: 'trainingFrequency', type: 'select', options: ['', 'Monthly', 'Quarterly', 'Bi-annually', 'Annually'] },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-2xl">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  HOD Dashboard
                </h1>
                <p className="text-purple-200 text-sm">Head of Department</p>
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
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  👤 <span className="hidden sm:inline">Profile</span>
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
                { id: 'my', label: 'My Requests', icon: '📤' },
                { id: 'map', label: 'Assign Employees', icon: '👥' }
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    tab === tabItem.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-lg">{tabItem.icon}</span>
                  <span className="hidden sm:inline">{tabItem.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mapping Tab */}
        {tab === 'map' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Assign Employees to Managers</h2>
            </div>
            
            <div className="mb-6">
              <select 
                onChange={(e) => setManagerMapDept(e.target.value)} 
                className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">Select Department</option>
                {[...new Set(employees.concat(managers).map(u => u.department))].map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            {managerMapDept && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Managers Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold mb-4 text-center text-blue-800 flex items-center justify-center gap-2">
                    <span>👨‍💼</span> Managers
                  </h3>
                  <div className="space-y-3">
                    {managers.filter(u => u.department === managerMapDept).map(manager => (
                      <div key={manager._id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <span className="font-medium text-gray-800">{manager.name}</span>
                        <button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                          onClick={() => {
                            setSelectedManager(manager);
                            fetchMappedEmployees(manager._id); 
                          }}
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employees Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold mb-4 text-center text-green-800 flex items-center justify-center gap-2">
                    <span>👥</span> Employees
                  </h3>
                  <div className="space-y-3">
                    {employees
                      .filter(u => u.department === managerMapDept)
                      .map(employee => {
                        const assignedManager = managers.find(m => m._id === employee.manager);
                        return (
                          <div key={employee._id} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-gray-800">{employee.name}</span>
                                {assignedManager && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Assigned to {assignedManager.name}
                                  </p>
                                )}
                              </div>
                              {!employee.manager ? (
                                <button
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                                  onClick={() => handleMapping(employee._id, selectedManager?._id)}
                                  disabled={!selectedManager}
                                >
                                  Map
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 italic bg-gray-100 px-2 py-1 rounded">
                                  Assigned
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Mapped Employees Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold mb-4 text-center text-purple-800 flex items-center justify-center gap-2">
                    <span>🎯</span> 
                    {selectedManager ? `Mapped to ${selectedManager.name}` : 'Selected Manager'}
                  </h3>

                  {!selectedManager ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">👆</div>
                      <p className="text-gray-500 italic">Select a manager to view mappings</p>
                    </div>
                  ) : mappedEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-gray-500 italic">No employees assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mappedEmployees.map(emp => (
                        <div key={emp._id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="font-medium text-gray-800">{emp.name}</span>
                          <button
                            onClick={() => handleUnmapping(emp._id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                          >
                            Unmap
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Tab */}
        {tab === 'review' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Training Requests - Review</h2>
                </div>
                
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-purple-600 font-medium">Loading requests...</span>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl text-gray-500 mb-2">No requests pending HOD review</p>
                  <p className="text-gray-400">All caught up! Check back later.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((req) => (
                    <div key={req._id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-600">Employee:</span>
                              <span className="font-bold text-gray-800">{req.user?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-600">Department:</span>
                              <span className="text-gray-800">{req.user?.department}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-600">Status:</span>
                              <span className={statusBadge(req.status)}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-600">Submitted:</span>
                              <span className="text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-600">Request ID:</span>
                            <span className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                              {req.requestNumber}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                            className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 hover:underline transition-colors duration-200"
                          >
                            🔍 View Full Details
                          </button>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecision(req._id, 'approve')}
                            className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                          >
                            <span className="flex items-center gap-2">
                              ✅ Approve
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                          </button>
                          <button
                            onClick={() => handleDecision(req._id, 'reject')}
                            className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                          >
                            <span className="flex items-center gap-2">
                              ❌ Reject
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Tab */}
        {tab === 'submit' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">➕</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Submit Training Request</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white hover:border-purple-300 resize-none"
                      rows="3"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white hover:border-purple-300"
                    >
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt || 'Select an option'}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white hover:border-purple-300"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
              
              <div className="md:col-span-2 flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
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
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">My Training Requests</h2>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search my requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-purple-600 font-medium">Loading your requests...</span>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl text-gray-500 mb-2">No requests submitted yet</p>
                  <p className="text-gray-400">Your submitted requests will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">Name:</span>
                          <span className="font-bold text-gray-800">{req.user?.name || 'You'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">Request ID:</span>
                          <span className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            {req.requestNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">Department:</span>
                          <span className="text-gray-800">{req.user?.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">Submitted:</span>
                          <span className="text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">Status:</span>
                          <span className={statusBadge(req.status)}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-6">
                        <button
                          onClick={() => {setSelectedRequest(req);setShowModal(true);}}
                          className="group relative bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                          <span className="flex items-center gap-2">
                            👁️ View
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
                        </button>
                        <button
                          onClick={() => navigate(`/training-form/${req._id}`)}
                          className="group relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                          <span className="flex items-center gap-2">
                            ✏️ Edit
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this request?')) {
                              try {
                                await API.delete(`/training-request/${req._id}`);
                                setRequests(prev => prev.filter(r => r._id !== req._id));
                              } catch {
                                alert('Failed to delete request');
                              }
                            }
                          }}
                          className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                          <span className="flex items-center gap-2">
                            🗑️ Delete
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  ))}
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
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-xl">📝</span>
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
                    <span className="text-sm font-semibold text-gray-600">Employee:</span>
                    <span className="font-bold text-gray-800">{selectedRequest.user?.name}</span>
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
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <span className={statusBadge(selectedRequest.status)}>
                      {selectedRequest.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Request ID:</span>
                    <span className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {selectedRequest.requestNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Date Submitted:</span>
                    <span className="text-gray-800">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['Skills to Improve', 'generalSkills'],
                  ['Tools for Training', 'toolsTraining'],
                  ['Soft Skills Training', 'softSkills'],
                  ['Tool Confidence Level', 'confidenceLevel'],
                  ['Technical Skills to Learn', 'technicalSkills'],
                  ['Data/Reporting Training', 'dataTraining'],
                  ['Current Role Challenges', 'roleChallenges'],
                  ['Job Efficiency Training', 'efficiencyTraining'],
                  ['Interested Certifications', 'certifications'],
                  ['2-Year Career Goal', 'careerGoals'],
                  ['Training for Career Goal', 'careerTraining'],
                  ['Preferred Format', 'trainingFormat'],
                  ['Preferred Duration', 'trainingDuration'],
                  ['Learning Style', 'learningPreference'],
                  ['Past Trainings', 'pastTraining'],
                  ['Feedback on Past Trainings', 'pastTrainingFeedback'],
                  ['Suggested Improvements', 'trainingImprovement'],
                  ['Urgent Training Areas', 'areaNeed'],
                  ['Training Frequency', 'trainingFrequency']
                ].map(([label, key]) => (
                  <div key={key} className="border-l-4 border-purple-500 pl-4">
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
                  onClick={() => setShowModal(false)}
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