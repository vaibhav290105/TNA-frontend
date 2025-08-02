import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: '', location: '', email: '' });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('choose');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const fetchUser = () => {
    setLoading(true);
    API.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          department: res.data.department || '',
          location: res.data.location || '',
          email: res.data.email || ''
        });
        if (res.data.image) {
          setPreview(`http://localhost:5000/uploads/${res.data.image}`);
        }
      })
      .catch(() => {
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        notification.innerHTML = '❌ Failed to load profile';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleImageChange = (file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = '❌ Image size should be less than 5MB';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = '❌ Please select a valid image file';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        return;
      }

      setNewImage(file);
      setPreview(URL.createObjectURL(file));
      setMode('save');
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!newImage) return;
    const formDataImage = new FormData();
    formDataImage.append('image', newImage);
    setUploading(true);
    try {
      await API.patch('/auth/update-image', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = '✅ Profile image updated successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      fetchUser();
      setNewImage(null);
      setMode('choose');
    } catch {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = '❌ Failed to update image';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      await API.patch('/auth/update-profile', formData);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = '✅ Profile updated successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      setEditMode(false);
      fetchUser();
    } catch {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = '❌ Failed to update profile';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (user?.role === 'employee') navigate('/dashboard');
    else if (user?.role === 'manager') navigate('/manager');
    else if (user?.role === 'hod') navigate('/hod');
    else if (user?.role === 'hr') navigate('/hr');
    else if (user?.role === 'admin') navigate('/admin');
    else navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
            
            <button
              onClick={handleBack}
              className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                Back to Dashboard
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📸</span>
                Profile Picture
              </h2>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Profile Image Display */}
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-indigo-500 shadow-2xl">
                    <img
                      src={preview || 'https://via.placeholder.com/160?text=No+Image'}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Role Badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                      <span className="mr-1">🏷️</span>
                      {user.role?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Image Upload Area */}
                <div className="w-full">
                  {mode === 'choose' ? (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('upload').click()}
                    >
                      <div className="space-y-3">
                        <div className="text-4xl">📁</div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                      <input
                        id="upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          💾 Save Image
                        </span>
                      )}
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Personal Information
                </h2>
                
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      ✏️ Edit Profile
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Full Name', name: 'name', icon: '👤', type: 'text' },
                  { label: 'Email Address', name: 'email', icon: '📧', type: 'email' },
                  { label: 'Department', name: 'department', icon: '🏢', type: 'text' },
                  { label: 'Location', name: 'location', icon: '📍', type: 'text' }
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">{field.icon}</span>
                      {field.label}
                    </label>
                    
                    {editMode ? (
                      <div className="relative">
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white hover:border-blue-300"
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">{field.icon}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                        <span className="text-lg">{field.icon}</span>
                        <span className="text-gray-800 font-medium">
                          {formData[field.name] || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {editMode && (
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      className="flex-1 group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          💾 Save Changes
                        </span>
                      )}
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: user.name || '',
                          department: user.department || '',
                          location: user.location || '',
                          email: user.email || ''
                        });
                      }}
                      className="flex-1 group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <span className="flex items-center justify-center gap-2">
                        ❌ Cancel
                      </span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Account Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Account Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-blue-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Profile Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  ✅ Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/training-request')}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-xl">🎓</span>
                <span className="font-medium text-gray-700">Request Training</span>
              </button>
              <button
                onClick={() => navigate('/my-training-requests')}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-xl">📋</span>
                <span className="font-medium text-gray-700">View My Requests</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}