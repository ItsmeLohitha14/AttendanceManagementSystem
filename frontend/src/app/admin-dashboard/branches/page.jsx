'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';
import { useRouter } from 'next/navigation';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Search,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  Grid,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    schoolName: '',
    branchName: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiRequest('/branches');
      if (response && response.success) {
        setBranches(response.data || []);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Failed to load branches. Please try again.');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({
      schoolName: '',
      branchName: '',
      location: '',
      status: 'active'
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      schoolName: branch.schoolName || '',
      branchName: branch.branchName || '',
      location: branch.location || '',
      status: branch.status || 'active'
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      let response;
      
      if (editingBranch) {
        // Update branch
        response = await apiRequest(`/branches/${editingBranch._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        // Create new branch
        response = await apiRequest('/branches', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      
      if (response && response.success) {
        setSuccessMessage(editingBranch ? 'Branch updated successfully!' : 'Branch created successfully!');
        await fetchBranches();
        
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setError(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      
      if (error.message?.includes('already exists')) {
        setError('A branch with this name already exists. Please use a different name.');
      } else {
        setError(error.message || 'Error saving branch. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) return;
    
    try {
      setError('');
      const response = await apiRequest(`/branches/${id}`, {
        method: 'DELETE'
      });
      
      if (response && response.success) {
        setSuccessMessage('Branch deleted successfully!');
        await fetchBranches();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      setError(error.message || 'Error deleting branch. Please try again.');
    }
  };

  // Update the toggleStatus function
const toggleStatus = async (branch) => {
  const newStatus = branch.status === 'active' ? 'inactive' : 'active';
  
  try {
    setError('');
    console.log('Toggling status:', branch._id, 'from', branch.status, 'to', newStatus);
    
    const response = await apiRequest(`/branches/${branch._id}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        schoolName: branch.schoolName,
        branchName: branch.branchName,
        location: branch.location || '',
        status: newStatus 
      })
    });
    
    console.log('Toggle response:', response);
    
    if (response && response.success) {
      await fetchBranches();
      setSuccessMessage(`Branch ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(response?.message || 'Status update failed');
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    
    // Handle specific error cases
    if (error.message?.includes('already exists')) {
      // This is the duplicate branch name error
      setError('Cannot update status due to branch name conflict. Please check if another branch has the same name.');
    } else if (error.status === 400) {
      setError('Bad request. Please check the data and try again.');
    } else if (error.status === 404) {
      setError('Branch not found. It may have been deleted.');
    } else if (error.message?.includes('connect')) {
      setError('Cannot connect to server. Please check your connection.');
    } else {
      setError(error.message || 'Error updating status. Please try again.');
    }
  }
};

  // Filter branches based on search
  const filteredBranches = branches.filter(branch => 
    branch.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.location && branch.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Loading branches...</span>
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
                <SidebarItem icon={<Building />} label="Branches" active={true} />
              </Link>
              <Link href="/admin-dashboard/classes">
                <SidebarItem icon={<BookOpen />} label="Classes" />
              </Link>
              <Link href="/admin-dashboard/sections">
                <SidebarItem icon={<Layers />} label="Sections" />
              </Link>
              <Link href="/admin-dashboard/students">
                <SidebarItem icon={<GraduationCap />} label="Students" />
              </Link>
              <Link href="/admin-dashboard/teachers">
                <SidebarItem icon={<Users />} label="Teachers" />
              </Link>
              <Link href="/admin-dashboard/subjects">
                <SidebarItem icon={<BookOpen />} label="Subjects" />
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
              <h2 className="text-3xl font-bold text-gray-900">Branches</h2>
              <p className="text-gray-700">Manage all school branches</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} /> Create Branch
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
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
              placeholder="Search by school name, branch name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg text-black focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
            />
          </div>

          {/* BRANCHES TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch, index) => (
                    <tr key={branch._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{branch.schoolName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{branch.branchName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{branch.location || 'Not specified'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          branch.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {branch.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleStatus(branch)}
                            className={`p-1 rounded transition ${
                              branch.status === 'active'
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title={branch.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {branch.status === 'active' ? <Unlock size={18} /> : <Lock size={18} />}
                          </button>
                          <button
                            onClick={() => openEditModal(branch)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(branch._id)}
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
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No branches found. Click "Create Branch" to add one.
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBranch ? 'Edit Branch' : 'Create New Branch'}
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
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="Enter school name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="Enter branch name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                  {submitting ? 'Saving...' : (editingBranch ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

/* Sidebar Item Component */
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