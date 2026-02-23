'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  LogOut,
  LayoutDashboard,
  Building,
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  AlertCircle,
  Eye,
  Grid,
  BookMarked,
  Hash,
  RefreshCw,
  Server
} from 'lucide-react';
import Link from 'next/link';

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  
  // Form state
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: ''
  });

  useEffect(() => {
    checkServerStatus();
  }, []);

  useEffect(() => {
    if (serverStatus === 'online') {
      fetchSubjects();
    }
  }, [retryCount, serverStatus]);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      // Try to access the server root or a simple endpoint
      const response = await fetch('http://localhost:5000/api/subjects', {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);
      
      if (response) {
        setServerStatus('online');
        fetchSubjects();
      } else {
        setServerStatus('offline');
        setError('Cannot connect to backend server. Please make sure the server is running on port 5000.');
        setLoading(false);
      }
    } catch (error) {
      setServerStatus('offline');
      setError('Cannot connect to backend server. Please make sure the server is running on port 5000.');
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching subjects from API...');
      
      const response = await apiRequest('/subjects');
      console.log('Subjects API response:', response);
      
      // Handle different response formats
      if (response && response.success === true) {
        setSubjects(response.data || []);
      } else if (Array.isArray(response)) {
        setSubjects(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setSubjects(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      
      if (error.message.includes('404')) {
        setError('Subjects API endpoint not found. Please check if subject routes are properly configured in the backend.');
      } else if (error.message.includes('connect to server')) {
        setError('Cannot connect to backend server. Please ensure it\'s running on port 5000.');
      } else if (error.message.includes('HTML')) {
        setError('Server returned HTML instead of JSON. The API endpoint may be incorrect or the server is misconfigured.');
      } else if (error.message.includes('401')) {
        setError('Authentication failed. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          router.push('/');
        }, 2000);
      } else {
        setError(error.message || 'Failed to load subjects. Please try again.');
      }
      
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    checkServerStatus();
    setRetryCount(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormData({
      subjectName: '',
      subjectCode: ''
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subjectName: subject.subjectName || '',
      subjectCode: subject.subjectCode || ''
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openDetailsModal = (subject) => {
    setSelectedSubject(subject);
    setShowDetailsModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      let response;
      
      if (editingSubject) {
        // Update subject
        const updateData = {};
        
        if (formData.subjectName && formData.subjectName.trim() !== editingSubject.subjectName) {
          updateData.subjectName = formData.subjectName.trim();
        }
        
        if (formData.subjectCode !== editingSubject.subjectCode) {
          updateData.subjectCode = formData.subjectCode.trim() || '';
        }
        
        if (Object.keys(updateData).length === 0) {
          setError('No changes to save');
          setSubmitting(false);
          return;
        }
        
        console.log('Updating subject with data:', updateData);
        response = await apiRequest(`/subjects/${editingSubject._id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new subject
        if (!formData.subjectName || !formData.subjectName.trim()) {
          setError('Subject name is required');
          setSubmitting(false);
          return;
        }
        
        const createData = {
          subjectName: formData.subjectName.trim()
        };
        
        if (formData.subjectCode && formData.subjectCode.trim()) {
          createData.subjectCode = formData.subjectCode.trim();
        }
        
        console.log('Creating subject with data:', createData);
        response = await apiRequest('/subjects', {
          method: 'POST',
          body: JSON.stringify(createData)
        });
      }
      
      console.log('Save response:', response);
      
      // Check for success
      if (response?.data || response?._id || response?.success === true) {
        setSuccessMessage(editingSubject ? 'Subject updated successfully!' : 'Subject created successfully!');
        await fetchSubjects();
        
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setError(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      
      if (error.message.includes('404')) {
        setError('API endpoint not found. Please check if the backend routes are properly configured.');
      } else if (error.message.includes('already exists')) {
        setError('A subject with this name already exists.');
      } else if (error.message.includes('duplicate key')) {
        setError('A subject with this name already exists.');
      } else if (error.message.includes('connect to server')) {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError(error.message || 'Error saving subject. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone and may affect teacher assignments.')) return;
    
    try {
      setError('');
      const response = await apiRequest(`/subjects/${id}`, {
        method: 'DELETE'
      });
      
      if (response && (response.success === true || response.message)) {
        setSuccessMessage('Subject deleted successfully!');
        await fetchSubjects();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError(error.message || 'Error deleting subject. Please try again.');
    }
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        subject.subjectName?.toLowerCase().includes(searchLower) ||
        (subject.subjectCode && subject.subjectCode.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Loading state with server status
  if (loading || serverStatus === 'checking') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">
                {serverStatus === 'checking' ? 'Checking server connection...' : 'Loading subjects...'}
              </span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Server offline state
  if (serverStatus === 'offline') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center max-w-2xl p-8 bg-white rounded-lg shadow">
            <Server className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Server Connection Error</h2>
            <p className="text-gray-600 mb-6">
              Cannot connect to the backend server. Please make sure:
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
              <ol className="list-decimal list-inside space-y-2 text-red-700">
                <li>Your backend server is running on <code className="bg-red-100 px-2 py-0.5 rounded">http://localhost:5000</code></li>
                <li>Run this command in your backend directory:</li>
              </ol>
              <pre className="bg-red-100 p-3 rounded text-xs mt-2 overflow-x-auto">
                cd D:\AttendanceManagementSystem\backend
                node server.js
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
              <p className="font-medium text-amber-800 mb-2">🔧 Backend Configuration Check:</p>
              <p className="text-amber-700 text-sm mb-2">1. Verify subjectRoutes.js exists:</p>
              <pre className="bg-amber-100 p-2 rounded text-xs mb-2">
                D:\AttendanceManagementSystem\backend\routes\subjectRoutes.js
              </pre>
              
              <p className="text-amber-700 text-sm mb-2">2. Check server.js has this line:</p>
              <pre className="bg-amber-100 p-2 rounded text-xs">
                const subjectRoutes = require('./routes/subjectRoutes');
                app.use('/api/subjects', subjectRoutes);
              </pre>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
              >
                <RefreshCw size={18} /> Retry Connection
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        {/* SIDEBAR */}
        <div className="w-64 bg-[#0f172a] text-white flex flex-col justify-between">
          <div>
            <div className="p-6">
              <h1 className="text-xl font-bold">SL</h1>
              <p className="text-sm text-gray-400">Admin Portal</p>
            </div>

            <nav className="space-y-2 px-4">
              <Link href="/admin-dashboard">
                <SidebarItem icon={<LayoutDashboard />} label="Dashboard" />
              </Link>
              <Link href="/admin-dashboard/branches">
                <SidebarItem icon={<Building />} label="Branches" />
              </Link>
              <Link href="/admin-dashboard/classes">
                <SidebarItem icon={<Layers />} label="Classes" />
              </Link>
              <Link href="/admin-dashboard/sections">
                <SidebarItem icon={<Grid />} label="Sections" />
              </Link>
              <Link href="/admin-dashboard/students">
                <SidebarItem icon={<GraduationCap />} label="Students" />
              </Link>
              <Link href="/admin-dashboard/teachers">
                <SidebarItem icon={<Users />} label="Teachers" />
              </Link>
              <Link href="/admin-dashboard/subjects">
                <SidebarItem icon={<BookOpen />} label="Subjects" active={true} />
              </Link>
              <Link href="/admin-dashboard/assignsubject">
                <SidebarItem icon={<BookMarked />} label="Assign Subject" />
              </Link>
            </nav>
          </div>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-8 overflow-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold text-gray-900">Subjects</h2>
              </div>
              <p className="text-gray-700">Manage academic subjects</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus size={18} /> Add Subject
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* SEARCH BAR */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by subject name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
            />
          </div>

          {/* SUBJECTS TABLE - Updated with "Created" column removed */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject, index) => (
                    <tr key={subject._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <BookMarked size={16} className="text-amber-500" />
                          {subject.subjectName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {subject.subjectCode ? (
                          <div className="flex items-center gap-1">
                            <Hash size={14} className="text-gray-500" />
                            {subject.subjectCode}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailsModal(subject)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(subject)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(subject._id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm 
                        ? 'No subjects match your search criteria.'
                        : 'No subjects found. Click "Add Subject" to create one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Success Message */}
            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="e.g., Mathematics, Science, English"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Subject name must be unique
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="e.g., MATH101, SCI202, ENG103"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    Subject names must be unique across the system.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {submitting ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Add Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT DETAILS MODAL */}
      {showDetailsModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Subject Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Subject Name</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BookMarked size={16} className="text-amber-500" />
                      <p className="font-medium">{selectedSubject.subjectName}</p>
                    </div>
                  </div>
                  
                  {selectedSubject.subjectCode && (
                    <div>
                      <p className="text-sm text-gray-500">Subject Code</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash size={16} className="text-gray-500" />
                        <p className="font-mono">{selectedSubject.subjectCode}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Subject ID</p>
                    <p className="font-mono text-sm">{selectedSubject._id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p>{selectedSubject.createdAt ? new Date(selectedSubject.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{selectedSubject.updatedAt ? new Date(selectedSubject.updatedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${
        active
          ? 'bg-amber-500 text-white'
          : 'hover:bg-gray-700 text-gray-300'
      }`}
    >
      {icon}
      {label}
    </div>
  );
}