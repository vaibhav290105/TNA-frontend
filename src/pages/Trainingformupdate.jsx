import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function Trainingformupdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

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
  useEffect(() => {
    API.get('/auth/me')
        .then(res => setRole(res.data.role))
        .catch(() => alert('Failed to fetch user info'));
    }, []);

  useEffect(() => {
    API.get(`/training-request/${id}`)
      .then((res) => setFormData(res.data))
      .catch(() => alert('Failed to load training request for editing'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await API.patch(`/training-request/${id}`, formData);
        alert('✅ Request updated successfully');
        // Navigate based on user role
        switch (role) {
        case 'employee':
            navigate('/my-training-requests');
            break;
        case 'manager':
            navigate('/manager', { state: { defaultTab: 'submitted' } });
            break;
        case 'hod':
            navigate('/hod', { state: { defaultTab: 'my' } });
            break;
        case 'hr':
            navigate('/hr', { state: { defaultTab: 'my' } });
            break;
        default:
            navigate('/');
        }
    } catch {
        alert('❌ Failed to update training request');
    }
    };


  const dropdownOptions = {
    confidenceLevel: ['Low', 'Medium', 'High'],
    trainingFormat: ['Online', 'In-person', 'Blended'],
    trainingDuration: ['1 week', '2 weeks', '1 month', '3 months'],
    learningPreference: ['Self-paced', 'Instructor-led', 'Peer learning'],
    trainingFrequency: ['Monthly', 'Quarterly', 'Yearly'],
  };

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

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">✏️ Update Training Request</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block mb-1 font-medium">{fieldLabels[key]}</label>
            {dropdownOptions[key] ? (
              <select
                name={key}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select</option>
                {dropdownOptions[key].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                name={key}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2 text-center mt-6">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            💾 Update Request
          </button>
        </div>
      </form>
    </div>
  );
}
