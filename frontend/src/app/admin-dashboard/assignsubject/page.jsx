'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  X,
  LogOut,
  LayoutDashboard,
  Building,
  Layers,
  Users,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  User,
  BookMarked,
  Grid
} from 'lucide-react';
import Link from 'next/link';

export default function AssignSubjectPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter states
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');

  // Filtered options
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    branch: '',
    classRef: '',
    section: ''
  });

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Refresh teachers and subjects when modal opens
  useEffect(() => {
    if (showModal) {
      refreshTeachersAndSubjects();
    }
  }, [showModal]);

  const refreshTeachersAndSubjects = async () => {
    try {
      await Promise.all([
        fetchTeachers(),
        fetchSubjects()
      ]);
    } catch (error) {
      console.error('Error refreshing teachers and subjects:', error);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAssignments(),
        fetchTeachers(),
        fetchSubjects(),
        fetchBranches(),
        fetchClasses(),
        fetchSections()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await apiRequest('/assignsubject');
      if (response) {
        if (response.success && Array.isArray(response.data)) {
          setAssignments(response.data);
          setFilteredAssignments(response.data);
        } else if (Array.isArray(response)) {
          setAssignments(response);
          setFilteredAssignments(response);
        } else if (response.data && Array.isArray(response.data)) {
          setAssignments(response.data);
          setFilteredAssignments(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiRequest('/teachers');
      console.log('Teachers API Response:', response);
      
      if (response) {
        if (Array.isArray(response)) {
          setTeachers(response);
          console.log('Teachers set (direct array):', response.length);
        } else if (response.success && Array.isArray(response.data)) {
          setTeachers(response.data);
          console.log('Teachers set (wrapped data):', response.data.length);
        } else if (response.data && Array.isArray(response.data)) {
          setTeachers(response.data);
          console.log('Teachers set (data property):', response.data.length);
        } else if (response.teachers && Array.isArray(response.teachers)) {
          setTeachers(response.teachers);
          console.log('Teachers set (teachers property):', response.teachers.length);
        } else {
          console.error('Unexpected teachers response format:', response);
          setTeachers([]);
        }
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiRequest('/subjects');
      console.log('Subjects API Response:', response);
      
      if (response) {
        // Handle different response structures
        if (Array.isArray(response)) {
          // Direct array response
          setSubjects(response);
          console.log('Subjects set (direct array):', response.length);
        } else if (response.success && Array.isArray(response.data)) {
          // Wrapped response with data property
          setSubjects(response.data);
          console.log('Subjects set (wrapped data):', response.data.length);
        } else if (response.data && Array.isArray(response.data)) {
          // Response with data property but no success flag
          setSubjects(response.data);
          console.log('Subjects set (data property):', response.data.length);
        } else if (response.subjects && Array.isArray(response.subjects)) {
          // Response with subjects property
          setSubjects(response.subjects);
          console.log('Subjects set (subjects property):', response.subjects.length);
        } else {
          console.error('Unexpected subjects response format:', response);
          setSubjects([]);
        }
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiRequest('/branches');
      if (response) {
        if (Array.isArray(response)) {
          setBranches(response);
        } else if (response.success && Array.isArray(response.data)) {
          setBranches(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setBranches(response.data);
        } else if (response.branches && Array.isArray(response.branches)) {
          setBranches(response.branches);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiRequest('/classes');
      if (response) {
        if (Array.isArray(response)) {
          setClasses(response);
        } else if (response.success && Array.isArray(response.data)) {
          setClasses(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setClasses(response.data);
        } else if (response.classes && Array.isArray(response.classes)) {
          setClasses(response.classes);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await apiRequest('/sections');
      if (response) {
        if (Array.isArray(response)) {
          setSections(response);
        } else if (response.success && Array.isArray(response.data)) {
          setSections(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setSections(response.data);
        } else if (response.sections && Array.isArray(response.sections)) {
          setSections(response.sections);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchClassesByBranch = async (branchId) => {
    try {
      const response = await apiRequest(`/classes/branch/${branchId}`);
      if (response) {
        if (Array.isArray(response)) {
          return response;
        } else if (response.success && Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response.classes && Array.isArray(response.classes)) {
          return response.classes;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching classes by branch:', error);
      return classes.filter(cls => cls.branch === branchId || cls.branch?._id === branchId);
    }
  };

  const fetchSectionsByClass = async (classId) => {
    try {
      const response = await apiRequest(`/sections/class/${classId}`);
      if (response) {
        if (Array.isArray(response)) {
          return response;
        } else if (response.success && Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response.sections && Array.isArray(response.sections)) {
          return response.sections;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching sections by class:', error);
      return sections.filter(sec => sec.class === classId || sec.class?._id === classId);
    }
  };

  // Update filtered classes when branch changes
  useEffect(() => {
    if (selectedBranch !== 'all') {
      const filtered = classes.filter(cls => 
        cls.branch === selectedBranch || cls.branch?._id === selectedBranch
      );
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classes);
    }
    setSelectedClass('all');
    setSelectedSection('all');
  }, [selectedBranch, classes]);

  // Update filtered sections when class changes
  useEffect(() => {
    if (selectedClass !== 'all') {
      const filtered = sections.filter(sec => 
        sec.class === selectedClass || sec.class?._id === selectedClass
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
    setSelectedSection('all');
  }, [selectedClass, sections]);

  // Apply filters
  useEffect(() => {
    if (!loading && assignments.length > 0) {
      applyFilters();
    }
  }, [selectedBranch, selectedClass, selectedSection, selectedTeacher, assignments]);

  const applyFilters = () => {
    let filtered = [...assignments];
    
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(assignment => {
        const branchId = assignment.branch?._id || assignment.branch;
        return branchId === selectedBranch;
      });
    }
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(assignment => {
        const classId = assignment.classRef?._id || assignment.classRef;
        return classId === selectedClass;
      });
    }
    
    if (selectedSection !== 'all') {
      filtered = filtered.filter(assignment => {
        const sectionId = assignment.section?._id || assignment.section;
        return sectionId === selectedSection;
      });
    }

    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(assignment => {
        const teacherId = assignment.teacher?._id || assignment.teacher;
        return teacherId === selectedTeacher;
      });
    }
    
    setFilteredAssignments(filtered);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');

    if (name === 'branch' && value) {
      setFormData(prev => ({
        ...prev,
        classRef: '',
        section: ''
        // Don't reset subject when branch changes - we want all subjects to show
      }));
      
      const branchClasses = await fetchClassesByBranch(value);
      setFilteredClasses(branchClasses);
    }

    if (name === 'classRef' && value) {
      setFormData(prev => ({
        ...prev,
        section: ''
      }));
      
      const classSections = await fetchSectionsByClass(value);
      setFilteredSections(classSections);
    }
  };

  const handleTeacherChange = (e) => {
    const { value } = e.target;
    setSelectedTeacher(value);
  };

  const openCreateModal = async () => {
    // Refresh teachers and subjects before opening modal
    await refreshTeachersAndSubjects();
    
    setFormData({
      teacher: '',
      subject: '',
      branch: '',
      classRef: '',
      section: ''
    });
    setFilteredClasses([]);
    setFilteredSections([]);
    setError('');
    setShowModal(true);
  };

  const validateForm = () => {
    if (!formData.teacher) {
      setError('Please select a teacher');
      return false;
    }
    if (!formData.subject) {
      setError('Please select a subject');
      return false;
    }
    if (!formData.branch) {
      setError('Please select a branch');
      return false;
    }
    if (!formData.classRef) {
      setError('Please select a class');
      return false;
    }
    if (!formData.section) {
      setError('Please select a section');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiRequest('/assignsubject', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response) {
        if (response.success || response.message === 'Assignment created successfully' || response._id) {
          setSuccessMessage('Subject assigned successfully!');
          await fetchAssignments();
          
          // Refresh teachers and subjects to ensure dropdowns are up to date
          await refreshTeachersAndSubjects();
          
          setTimeout(() => {
            setShowModal(false);
            setSuccessMessage('');
          }, 1500);
        } else {
          setError(response.message || 'Failed to assign subject');
        }
      } else {
        setError('Failed to assign subject');
      }
    } catch (error) {
      console.error('Error assigning subject:', error);
      if (error.message?.includes('already exists')) {
        setError('This assignment already exists!');
      } else {
        setError(error.message || 'Error assigning subject. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this assignment? This action cannot be undone.')) return;

    try {
      const response = await apiRequest(`/assignsubject/${id}`, {
        method: 'DELETE'
      });

      if (response?.success || response?.message === 'Deleted successfully') {
        setSuccessMessage('Assignment removed successfully!');
        await fetchAssignments();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError(error.message || 'Error deleting assignment. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleRetry = () => {
    setError('');
    fetchInitialData();
  };

  // Search filter
  const searchedAssignments = filteredAssignments.filter(assignment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      assignment.teacher?.fullName?.toLowerCase().includes(searchLower) ||
      assignment.subject?.subjectName?.toLowerCase().includes(searchLower) ||
      assignment.branch?.branchName?.toLowerCase().includes(searchLower) ||
      assignment.classRef?.className?.toLowerCase().includes(searchLower) ||
      assignment.section?.sectionName?.toLowerCase().includes(searchLower)
    );
  });

  const getTeacherName = (teacher) => {
    if (!teacher) return 'N/A';
    return typeof teacher === 'object' ? teacher.fullName : 'Unknown';
  };

  const getSubjectName = (subject) => {
    if (!subject) return 'N/A';
    return typeof subject === 'object' ? subject.subjectName : 'Unknown';
  };

  const getBranchName = (branch) => {
    if (!branch) return 'N/A';
    return typeof branch === 'object' ? branch.branchName : 'Unknown';
  };

  const getClassName = (cls) => {
    if (!cls) return 'N/A';
    return typeof cls === 'object' ? cls.className : 'Unknown';
  };

  const getSectionName = (section) => {
    if (!section) return 'N/A';
    return typeof section === 'object' ? section.sectionName : 'Unknown';
  };

  if (loading && assignments.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Loading assignments...</span>
            </div>
            {error && (
              <div className="text-red-600 mb-4">
                <p>{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            )}
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
                <SidebarItem icon={<BookOpen />} label="Subjects" />
              </Link>
              <Link href="/admin-dashboard/assignsubject">
                <SidebarItem icon={<BookMarked />} label="Assign Subject" active={true} />
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
              <h2 className="text-3xl font-bold text-gray-900">Assign Subjects to Teachers</h2>
              <p className="text-gray-700">Manage teacher subject assignments</p>
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
                <Plus size={18} /> Assign Subject
              </button>
            </div>
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Branch Filter */}
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Class Filter */}
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none appearance-none bg-white"
                disabled={selectedBranch === 'all'}
              >
                <option value="all">All Classes</option>
                {filteredClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Section Filter */}
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none appearance-none bg-white"
                disabled={selectedClass === 'all'}
              >
                <option value="all">All Sections</option>
                {filteredSections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.sectionName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Teacher Filter */}
            <div className="relative">
              <select
                value={selectedTeacher}
                onChange={handleTeacherChange}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Teachers</option>
                {teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.fullName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No teachers available</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by teacher, subject, branch, class, section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* ASSIGNMENTS TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {searchedAssignments.length > 0 ? (
                  searchedAssignments.map((assignment, index) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <User size={16} className="text-gray-500" />
                          {getTeacherName(assignment.teacher)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <BookOpen size={16} className="text-gray-500" />
                          {getSubjectName(assignment.subject)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Building size={16} className="text-gray-500" />
                          {getBranchName(assignment.branch)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getClassName(assignment.classRef)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getSectionName(assignment.section)}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                          title="Remove Assignment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm
                        ? 'No assignments match your search criteria.'
                        : 'No assignments found. Click "Assign Subject" to create one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Assign Subject to Teacher</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                    disabled={submitting}
                  >
                    <option value="">Choose a teacher</option>
                    {teachers.length > 0 ? (
                      teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName} {teacher.employeeId ? `- ${teacher.employeeId}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No teachers available</option>
                    )}
                  </select>
                  {teachers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No teachers found. Please add teachers first.
                    </p>
                  )}
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                    disabled={submitting}
                  >
                    <option value="">Choose a branch</option>
                    {branches.length > 0 ? (
                      branches.map(branch => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branchName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No branches available</option>
                    )}
                  </select>
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classRef"
                    value={formData.classRef}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                    disabled={submitting || !formData.branch}
                  >
                    <option value="">Choose a class</option>
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.className}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No classes available for this branch</option>
                    )}
                  </select>
                  {!formData.branch && (
                    <p className="text-xs text-gray-500 mt-1">Select a branch first</p>
                  )}
                </div>

                {/* Section Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                    disabled={submitting || !formData.classRef}
                  >
                    <option value="">Choose a section</option>
                    {filteredSections.length > 0 ? (
                      filteredSections.map(section => (
                        <option key={section._id} value={section._id}>
                          {section.sectionName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No sections available for this class</option>
                    )}
                  </select>
                  {!formData.classRef && (
                    <p className="text-xs text-gray-500 mt-1">Select a class first</p>
                  )}
                </div>

                {/* Subject Selection - Now showing ALL subjects without branch filtering */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                    disabled={submitting}
                  >
                    <option value="">Choose a subject</option>
                    {subjects.length > 0 ? (
                      subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                          {subject.subjectName} {subject.subjectCode ? `(${subject.subjectCode})` : ''}
                          {subject.branch ? ` - ${typeof subject.branch === 'object' ? subject.branch.branchName : 'Branch assigned'}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No subjects available - please add subjects first</option>
                    )}
                  </select>
                  {subjects.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No subjects found. Please add subjects first.
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || teachers.length === 0 || branches.length === 0 || subjects.length === 0}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Subject'
                  )}
                </button>
              </div>
            </form>
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