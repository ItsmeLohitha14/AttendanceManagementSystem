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
  Layers,
  Users,
  GraduationCap,
  AlertCircle,
  Eye,
  Phone,
  UserCircle,
  Grid,
  ChevronDown,
  RefreshCw,
  Copy,
  CheckCircle,
  User,
  Lock,
  Key,
  Hash,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newCredentials, setNewCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filter states
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  // Filtered options based on selections
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);

  // Form state for create/edit modal
  const [formData, setFormData] = useState({
    fullName: '',
    rollNo: '',
    parentName: '',
    motherName: '',
    parentMobile: '',
    branch: '',
    classRef: '',
    section: '',
    username: '',
    password: ''
  });

  // State for form dropdowns
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllStudents(),
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

  // Apply filters when they change
  useEffect(() => {
    if (!loading && allStudents.length > 0) {
      applyFilters();
    }
  }, [selectedBranch, selectedClass, selectedSection, allStudents]);

  const fetchAllStudents = async () => {
    try {
      const response = await apiRequest('/students');
      if (response && response.success) {
        setAllStudents(response.data || []);
        setStudents(response.data || []);
      } else if (Array.isArray(response)) {
        setAllStudents(response);
        setStudents(response);
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw error;
    }
  };

  const applyFilters = () => {
    let filtered = [...allStudents];
    
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(student => {
        const branchId = student.branch?._id || student.branch;
        return branchId === selectedBranch;
      });
    }
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => {
        const classId = student.classRef?._id || student.classRef;
        return classId === selectedClass;
      });
    }
    
    if (selectedSection !== 'all') {
      filtered = filtered.filter(student => {
        const sectionId = student.section?._id || student.section;
        return sectionId === selectedSection;
      });
    }
    
    setStudents(filtered);
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

  const fetchClasses = async () => {
    try {
      const response = await apiRequest('/classes');
      if (response && response.success) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await apiRequest('/sections');
      if (response && response.success) {
        setSections(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchClassesByBranch = async (branchId) => {
    try {
      const response = await apiRequest(`/classes/branch/${branchId}`);
      if (response && response.success) {
        return response.data || [];
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
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching sections by class:', error);
      return sections.filter(sec => sec.class === classId || sec.class?._id === classId);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const generateUsername = (fullName, rollNo) => {
    // Generate username from name and roll number
    const namePart = fullName.toLowerCase().replace(/\s+/g, '').substring(0, 8);
    return `${namePart}_${rollNo}`;
  };

  const generatePassword = () => {
    // Generate a random password
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'fullName' || name === 'rollNo') {
      // Auto-generate username when name or roll number changes
      const newFullName = name === 'fullName' ? value : formData.fullName;
      const newRollNo = name === 'rollNo' ? value : formData.rollNo;
      
      if (newFullName && newRollNo) {
        const generatedUsername = generateUsername(newFullName, newRollNo);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          username: generatedUsername
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');

    if (name === 'branch' && value) {
      setAvailableClasses([]);
      setAvailableSections([]);
      setFormData(prev => ({
        ...prev,
        classRef: '',
        section: ''
      }));
      
      if (value) {
        const branchClasses = await fetchClassesByBranch(value);
        setAvailableClasses(branchClasses);
      }
    }

    if (name === 'classRef' && value) {
      setAvailableSections([]);
      setFormData(prev => ({
        ...prev,
        section: ''
      }));
      
      if (value) {
        const classSections = await fetchSectionsByClass(value);
        setAvailableSections(classSections);
      }
    }
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    const generatedPassword = generatePassword();
    setFormData({
      fullName: '',
      rollNo: '',
      parentName: '',
      motherName: '',
      parentMobile: '',
      branch: '',
      classRef: '',
      section: '',
      username: '',
      password: generatedPassword
    });
    setAvailableClasses([]);
    setAvailableSections([]);
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = async (student) => {
    setEditingStudent(student);
    
    const branchId = student.branch?._id || student.branch;
    const classId = student.classRef?._id || student.classRef;
    const sectionId = student.section?._id || student.section;
    
    setFormData({
      fullName: student.fullName || '',
      rollNo: student.rollNo || '',
      parentName: student.parentName || '',
      motherName: student.motherName || '',
      parentMobile: student.parentMobile || '',
      branch: branchId || '',
      classRef: classId || '',
      section: sectionId || '',
      username: '', // Username cannot be edited
      password: ''  // Password cannot be edited through student update
    });

    if (branchId) {
      const branchClasses = await fetchClassesByBranch(branchId);
      setAvailableClasses(branchClasses);
    }
    if (classId) {
      const classSections = await fetchSectionsByClass(classId);
      setAvailableSections(classSections);
    }

    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openDetailsModal = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const openCredentialsModal = (student, credentials) => {
    setSelectedStudent(student);
    setNewCredentials(credentials);
    setShowCredentialsModal(true);
    setCopied(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    if (!editingStudent) {
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
      if (!formData.username) {
        setError('Username is required');
        return false;
      }
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
    }
    
    if (!formData.fullName?.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (!formData.rollNo?.trim()) {
      setError('Roll number is required');
      return false;
    }
    
    if (!formData.parentName?.trim()) {
      setError('Parent name is required');
      return false;
    }
    
    if (!formData.parentMobile?.trim()) {
      setError('Parent mobile number is required');
      return false;
    }
    
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.parentMobile.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number');
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
      let response;

      if (editingStudent) {
        const updateData = {
          fullName: formData.fullName.trim(),
          parentName: formData.parentName.trim(),
          motherName: formData.motherName?.trim() || '',
          parentMobile: formData.parentMobile.trim()
        };

        response = await apiRequest(`/students/${editingStudent._id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (response && response.success) {
          setSuccessMessage('Student updated successfully!');
          await fetchAllStudents();
          
          setTimeout(() => {
            setShowModal(false);
            setSuccessMessage('');
          }, 1500);
        }
      } else {
        const createData = {
          fullName: formData.fullName.trim(),
          rollNo: formData.rollNo.trim(),
          parentName: formData.parentName.trim(),
          motherName: formData.motherName?.trim() || '',
          parentMobile: formData.parentMobile.trim(),
          branch: formData.branch,
          classRef: formData.classRef,
          section: formData.section,
          username: formData.username,
          password: formData.password
        };

        response = await apiRequest('/students', {
          method: 'POST',
          body: JSON.stringify(createData)
        });

        if (response && response.success) {
          setSuccessMessage('Student created successfully!');
          await fetchAllStudents();
          
          // Show credentials modal with the generated credentials
          const newStudent = response.data || response.student;
          if (newStudent) {
            openCredentialsModal(newStudent, {
              username: formData.username,
              password: formData.password,
              fullName: formData.fullName,
              rollNo: formData.rollNo
            });
          }
          
          setShowModal(false);
          setSuccessMessage('');
        }
      }
    } catch (error) {
      console.error('Error saving student:', error);

      if (error.message?.includes('username already exists')) {
        setError('Username already exists. Please try a different username or modify the name/roll number.');
      } else if (error.message?.includes('roll number already exists')) {
        setError('A student with this roll number already exists in this section.');
      } else if (error.message?.includes('Section does not belong to this class')) {
        setError('Selected section does not belong to the chosen class.');
      } else if (error.message?.includes('Class does not belong to this branch')) {
        setError('Selected class does not belong to the chosen branch.');
      } else {
        setError(error.message || 'Error saving student. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone and will remove the student\'s login credentials.')) return;

    try {
      setError('');
      const response = await apiRequest(`/students/${id}`, {
        method: 'DELETE'
      });

      if (response && response.success) {
        setSuccessMessage('Student deleted successfully!');
        await fetchAllStudents();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.message || 'Error deleting student. Please try again.');
    }
  };

  const handleRetry = () => {
    setError('');
    fetchInitialData();
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.rollNo?.toLowerCase().includes(searchLower) ||
      student.parentName?.toLowerCase().includes(searchLower) ||
      student.parentMobile?.includes(searchTerm) ||
      getBranchName(student.branch).toLowerCase().includes(searchLower) ||
      getClassName(student.classRef).toLowerCase().includes(searchLower) ||
      getSectionName(student.section).toLowerCase().includes(searchLower)
    );
  });

  const getBranchName = (branch) => {
    if (!branch) return 'N/A';
    if (typeof branch === 'object') return branch.branchName || 'Unknown';
    const found = branches.find(b => b._id === branch);
    return found ? found.branchName : 'Unknown Branch';
  };

  const getClassName = (cls) => {
    if (!cls) return 'N/A';
    if (typeof cls === 'object') return cls.className || 'Unknown';
    const found = classes.find(c => c._id === cls);
    return found ? found.className : 'Unknown Class';
  };

  const getSectionName = (section) => {
    if (!section) return 'N/A';
    if (typeof section === 'object') return section.sectionName || 'Unknown';
    const found = sections.find(s => s._id === section);
    return found ? found.sectionName : 'Unknown Section';
  };

  if (loading && allStudents.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Loading students...</span>
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
                <SidebarItem icon={<GraduationCap />} label="Students" active={true} />
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
              <h2 className="text-3xl font-bold text-gray-900">Students</h2>
              <p className="text-gray-700">Manage student records and enrollments</p>
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
                <Plus size={18} /> Add Student
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
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

            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, roll number, parent name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* STUDENTS TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch/Class/Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{student.rollNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <UserCircle size={16} className="text-gray-500" />
                          {student.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.parentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-500" />
                          {student.parentMobile}
                        </div>
                        {student.motherName && (
                          <div className="text-xs text-gray-500 mt-1">
                            Mother: {student.motherName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Building size={14} className="text-gray-500" />
                            <span>{getBranchName(student.branch)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <BookOpen size={14} className="text-gray-500" />
                            <span>{getClassName(student.classRef)} - {getSectionName(student.section)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailsModal(student)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
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
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm
                        ? 'No students match your search criteria.'
                        : selectedSection !== 'all'
                          ? 'No students found in this section. Click "Add Student" to enroll one.'
                          : selectedClass !== 'all'
                            ? 'No students found in this class. Click "Add Student" to enroll one.'
                            : selectedBranch !== 'all'
                              ? 'No students found in this branch. Click "Add Student" to enroll one.'
                              : 'No students found. Click "Add Student" to enroll one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL - HORIZONTAL LAYOUT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <UserCircle size={20} className="text-amber-500" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting || editingStudent}
                      placeholder="Enter roll number"
                    />
                    {editingStudent && (
                      <p className="text-xs text-gray-500 mt-1">Cannot be edited</p>
                    )}
                  </div>

                  {/* Parent Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="parentMobile"
                      value={formData.parentMobile}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                      placeholder="10 digit mobile"
                    />
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                      placeholder="Enter father's name"
                    />
                  </div>

                  {/* Mother's Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      disabled={submitting}
                      placeholder="Enter mother's name (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-500" />
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Branch Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting || editingStudent}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                    {editingStudent && (
                      <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                    )}
                  </div>

                  {/* Class Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="classRef"
                      value={formData.classRef}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting || editingStudent || !formData.branch}
                    >
                      <option value="">Select Class</option>
                      {availableClasses.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                      required
                      disabled={submitting || editingStudent || !formData.classRef}
                    >
                      <option value="">Select Section</option>
                      {availableSections.map(section => (
                        <option key={section._id} value={section._id}>
                          {section.sectionName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Login Credentials Section - Only for new students */}
              {!editingStudent && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-amber-500" />
                    Login Credentials
                  </h4>
                  <p className="text-sm text-gray-500 mb-3 bg-blue-50 p-3 rounded-lg">
                    These credentials will be used by the student to login to the system. 
                    Username is auto-generated based on name and roll number.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          disabled={submitting}
                          className="w-full p-2 pl-8 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-gray-50"
                          placeholder="Auto-generated username"
                        />
                        <User size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        You can modify this if needed
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={submitting}
                            className="w-full p-2 pl-8 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                            placeholder="Auto-generated password"
                          />
                          <Key size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
                          title="Generate new password"
                        >
                          <RefreshCw size={16} />
                          <span className="text-sm hidden sm:inline">Generate</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        You can modify or generate a new one
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Note for editing */}
              {editingStudent && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    Note: Username and password cannot be edited here. To reset password, use the admin tools.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
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
                  disabled={submitting}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingStudent ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingStudent ? 'Update Student' : 'Create Student'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL - Show after student creation */}
      {showCredentialsModal && newCredentials && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Student Login Credentials</h3>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Student created successfully! Please save these credentials.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Student Information</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Name:</span> <span className="font-medium">{newCredentials.fullName}</span></p>
                  <p><span className="text-gray-500">Roll No:</span> <span className="font-medium">{newCredentials.rollNo}</span></p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-700 mb-3">Login Credentials</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-amber-600">Username</p>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                      <code className="font-mono text-sm">{newCredentials.username}</code>
                      <button
                        onClick={() => copyToClipboard(newCredentials.username)}
                        className="p-1 text-amber-600 hover:bg-amber-100 rounded transition"
                        title="Copy username"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">Password</p>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                      <code className="font-mono text-sm">{newCredentials.password}</code>
                      <button
                        onClick={() => copyToClipboard(newCredentials.password)}
                        className="p-1 text-amber-600 hover:bg-amber-100 rounded transition"
                        title="Copy password"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Please save these credentials. They won't be shown again.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
              >
                I've Saved the Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAILS MODAL */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Roll Number</p>
                  <p className="font-medium text-gray-900">{selectedStudent.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Father's Name</p>
                  <p className="font-medium text-gray-900">{selectedStudent.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mother's Name</p>
                  <p className="font-medium text-gray-900">{selectedStudent.motherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Mobile</p>
                  <p className="font-medium text-gray-900">{selectedStudent.parentMobile}</p>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium text-gray-900">{getBranchName(selectedStudent.branch)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium text-gray-900">{getClassName(selectedStudent.classRef)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Section</p>
                    <p className="font-medium text-gray-900">{getSectionName(selectedStudent.section)}</p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">System Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-mono text-sm text-gray-900">{selectedStudent._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Login ID</p>
                    <p className="font-mono text-sm text-gray-900">{selectedStudent.loginId || 'Not generated yet'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStudent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStudent.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
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