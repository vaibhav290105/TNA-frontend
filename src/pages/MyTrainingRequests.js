import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
export default function MyTrainingRequests() {
  const [myRequests, setMyRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/training-request/my-requests')
      .then((res) => setMyRequests(res.data))
      .catch(() => alert('Failed to fetch your training requests'));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await API.delete(`/training-request/${id}`);
        setMyRequests(myRequests.filter(req => req._id !== id));
        alert('Request deleted successfully');
      } catch (err) {
        alert('Failed to delete request');
      }
    }
  };


  const statusBadge = (status) => {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'Approved_By_Admin':
        return `${base} bg-green-100 text-green-700`;
      case 'Rejected_By_Manager':
      case 'Rejected_By_Admin':
        return `${base} bg-red-100 text-red-700`;
      case 'Pending_Manager':
        return `${base} bg-yellow-100 text-yellow-700`;
      case 'Approved_By_Manager':
      case 'Pending_Admin':
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📋 My Training Requests</h2>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          ← Back to Dashboard
        </button>
      </div>

      {myRequests.length === 0 ? (
        <p className="text-gray-500 text-center">You haven’t submitted any training requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white text-sm text-left border">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs border-b">
              <tr>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted On</th>
                <th className="px-5 py-3">Request_no</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 border-b">
                  <td className="px-5 py-3">
                    <span className={statusBadge(req.status)}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="text-sm text-gray-500">
                    <strong>🆔:</strong> {req.requestNumber}
                  </td>
                  <td className="px-5 py-3 text-center space-x-4">
                    <button onClick={() => setSelectedRequest(req)} title="View">
                      <span role="img" aria-label="view" className="text-blue-600 text-lg hover:scale-110 transition-transform">👁️‍🗨️</span>
                    </button>

                    <button onClick={() => navigate(`/training-form/${req._id}`)} title="Edit">
                      <span role="img" aria-label="edit" className="text-green-600 text-lg hover:scale-110 transition-transform">✏️</span>
                    </button>

                    <button onClick={() => handleDelete(req._id)} title="Delete">
                      <span role="img" aria-label="delete" className="text-red-600 text-lg hover:scale-110 transition-transform">🗑️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-5xl w-full overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">📑 Training Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✖ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><strong>Status:</strong> {selectedRequest.status.replace(/_/g, ' ')}</p>
              <p><strong>Date Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
              <p><strong>Request No:</strong> {selectedRequest.requestNumber}</p>

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
                <p key={key}><strong>{label}:</strong> {selectedRequest[key] || '—'}</p>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
