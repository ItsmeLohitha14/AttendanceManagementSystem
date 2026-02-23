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
  Search,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Layers,
  Users,
  GraduationCap,
  Grid,
  AlertCircle,
  Eye,
  User,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    className: '',
    branchId: '',
    teacherId: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchBranches();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedBranch !== 'all') {
      fetchClassesByBranch(selectedBranch);
    } else {
      fetchClasses();
    }
  }, [selectedBranch]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiRequest('/classes');
      if (response && response.success) {
        setClasses(response.data || []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes. Please try again.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesByBranch = async (branchId) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiRequest(`/classes/branch/${branchId}`);
      if (response && response.success) {
        setClasses(response.data || []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes by branch:', error);
      setError('Failed to load classes for this branch.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiRequest('/branches');
      if (response && response.success) {
        setBranches(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiRequest('/teachers');
      if (response && Array.isArray(response)) {
        setTeachers(response);
      } else if (response && response.success) {
        setTeachers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
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
    // Clear error when user starts typing
    setError('');
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      branchId: '',
      teacherId: ''
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      className: cls.className || '',
      branchId: cls.branch?._id || cls.branch || '',
      teacherId: cls.classIncharge?._id || cls.classIncharge || ''
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openDetailsModal = (cls) => {
    setSelectedClass(cls);
    setShowDetailsModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      let response;
      
      if (editingClass) {
        // Update class - only send className and teacherId
        const updateData = {
          className: formData.className
        };
        
        // Only include teacherId if it's provided and not empty
        if (formData.teacherId) {
          updateData.teacherId = formData.teacherId;
        }
        
        response = await apiRequest(`/classes/${editingClass._id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new class
        if (!formData.branchId) {
          setError('Please select a branch');
          setSubmitting(false);
          return;
        }
        
        const createData = {
          className: formData.className,
          branchId: formData.branchId
        };
        
        // Only include teacherId if it's provided
        if (formData.teacherId) {
          createData.teacherId = formData.teacherId;
        }
        
        response = await apiRequest('/classes', {
          method: 'POST',
          body: JSON.stringify(createData)
        });
      }
      
      if (response && response.success) {
        setSuccessMessage(editingClass ? 'Class updated successfully!' : 'Class created successfully!');
        
        // Refresh the classes list based on current filter
        if (selectedBranch !== 'all') {
          await fetchClassesByBranch(selectedBranch);
        } else {
          await fetchClasses();
        }
        
        // Close modal after short delay to show success message
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage('');
        }, 1500);
      } else {
        setError(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving class:', error);
      
      // Handle specific error messages
      if (error.message && error.message.includes('already exists')) {
        setError('A class with this name already exists in the selected branch.');
      } else if (error.message && error.message.includes('Teacher not found')) {
        setError('Selected teacher not found. Please choose another teacher.');
      } else if (error.message && error.message.includes('Branch not found')) {
        setError('Selected branch not found. Please choose another branch.');
      } else {
        setError(error.message || 'Error saving class. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone and may affect associated sections and students.')) return;
    
    try {
      setError('');
      const response = await apiRequest(`/classes/${id}`, {
        method: 'DELETE'
      });
      
      if (response && response.success) {
        setSuccessMessage('Class deleted successfully!');
        
        // Refresh the classes list based on current filter
        if (selectedBranch !== 'all') {
          await fetchClassesByBranch(selectedBranch);
        } else {
          await fetchClasses();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      setError(error.message || 'Error deleting class. Please try again.');
    }
  };

  // Filter classes based on search
  const filteredClasses = classes.filter(cls => 
    cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.branch?.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classIncharge?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get branch name by ID
  const getBranchName = (branch) => {
    if (!branch) return 'N/A';
    if (typeof branch === 'object') return branch.branchName || 'Unknown';
    const found = branches.find(b => b._id === branch);
    return found ? found.branchName : 'Unknown Branch';
  };

  // Get teacher name by ID
  const getTeacherName = (teacher) => {
    if (!teacher) return 'Not Assigned';
    if (typeof teacher === 'object') return teacher.fullName || 'Unknown';
    const found = teachers.find(t => t._id === teacher);
    return found ? found.fullName : 'Unknown Teacher';
  };

  if (loading && classes.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Loading classes...</span>
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
                <SidebarItem icon={<Layers />} label="Classes" active={true} />
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
                <SidebarItem icon={<BookOpen />} label="Subjects" />
              </Link>
              <Link href="/admin-dashboard/assignsubject">
                <SidebarItem icon={<BookMarked />} label="Assign Subject"/>
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
              <h2 className="text-3xl font-bold text-gray-900">Classes</h2>
              <p className="text-gray-700">Manage classes across all branches</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} /> Create Class
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

          {/* FILTERS AND SEARCH */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            {/* Branch Filter */}
            <div className="relative md:w-64">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black pointer-events-none" size={18} />
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by class name, branch, or class teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg text-black focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* CLASSES TABLE - Updated with column removed */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls, index) => (
                    <tr key={cls._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.className}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Building size={14} className="text-gray-500" />
                          {getBranchName(cls.branch)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-gray-500" />
                          {getTeacherName(cls.classIncharge)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailsModal(cls)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(cls)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cls._id)}
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
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      {selectedBranch !== 'all' 
                        ? 'No classes found for this branch. Click "Create Class" to add one.'
                        : 'No classes found. Click "Create Class" to add one.'}
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
                {editingClass ? 'Edit Class' : 'Create New Class'}
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
                {/* Branch Selection - Disabled in edit mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch *
                  </label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    required={!editingClass}
                    disabled={submitting || editingClass}
                    className="w-full px-3 py-2 border border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                  {editingClass && (
                    <p className="text-xs text-gray-500 mt-1">Branch cannot be changed after creation</p>
                  )}
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 border  border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                    placeholder="e.g., Class 10, Grade 5, etc."
                  />
                </div>

                {/* Class Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher (Optional)
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-400 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Select Class Teacher</option>
                    {teachers
                      .filter(teacher => {
                        // Optional: Filter teachers by branch if needed
                        return true;
                      })
                      .map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName} {teacher.phone ? `(${teacher.phone})` : ''}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">You can assign or change the class teacher later</p>
                </div>

                {/* Additional info for editing */}
                {editingClass && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    <p className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      You can update the class name and class teacher. Branch cannot be changed.
                    </p>
                  </div>
                )}
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
                  {submitting ? 'Saving...' : (editingClass ? 'Update Class' : 'Create Class')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS DETAILS MODAL */}
      {showDetailsModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Class Details</h3>
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
                    <p className="text-sm text-gray-500">Class Name</p>
                    <p className="font-medium">{selectedClass.className}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <div className="flex items-center gap-1">
                      <Building size={14} className="text-gray-500" />
                      <p>{getBranchName(selectedClass.branch)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class Teacher</p>
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      <p>{getTeacherName(selectedClass.classIncharge)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class ID</p>
                    <p className="font-mono text-sm">{selectedClass._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p>{selectedClass.createdAt ? new Date(selectedClass.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{selectedClass.updatedAt ? new Date(selectedClass.updatedAt).toLocaleString() : 'N/A'}</p>
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