'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronDown,
  RefreshCw,
  Download,
  Filter,
  UserCheck,
  UserX,
  BarChart3,
  GraduationCap,
  School,
  BookMarked,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('MORNING');
  const [description, setDescription] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendancePercentage: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Time slots options
  const timeSlots = [
    { value: 'MORNING', label: 'Morning (8:00 - 9:30)' },
    { value: 'MID_MORNING', label: 'Mid Morning (9:45 - 11:15)' },
    { value: 'AFTERNOON', label: 'Afternoon (11:30 - 1:00)' },
    { value: 'LUNCH', label: 'Lunch Break' },
    { value: 'EVENING', label: 'Evening (2:00 - 3:30)' }
  ];

  useEffect(() => {
    // Check localStorage first
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    
    console.log('LocalStorage data:', { 
      token: token ? 'exists' : 'missing', 
      userRole, 
      username 
    });

    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/');
      return;
    }

    if (userRole !== 'teacher') {
      console.log('User is not a teacher, role:', userRole);
      router.push('/');
      return;
    }

    if (!username) {
      console.log('No username found in localStorage');
      setError('User information not found. Please login again.');
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    fetchTeacherData();
  }, [router]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      // Get user info from localStorage
      const username = localStorage.getItem('username');
      
      console.log('Fetching teacher data for username:', username);

      // Set teacher info from username
      setTeacher({
        fullName: username || 'Teacher',
        username: username
      });

      // Fetch assignments
      await fetchAssignments();
      
    } catch (error) {
      console.error('Error in fetchTeacherData:', error);
      setError('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      // For demo purposes, use mock data
      // In production, you would fetch from your API
      const mockAssignments = [
        {
          _id: '1',
          subject: { _id: 'sub1', subjectName: 'Mathematics' },
          classRef: { _id: 'cls1', className: 'Class 10' },
          section: { _id: 'sec1', sectionName: 'A' },
          branch: { _id: 'br1', branchName: 'Main Branch' }
        },
        {
          _id: '2',
          subject: { _id: 'sub2', subjectName: 'Science' },
          classRef: { _id: 'cls2', className: 'Class 9' },
          section: { _id: 'sec2', sectionName: 'B' },
          branch: { _id: 'br1', branchName: 'Main Branch' }
        },
        {
          _id: '3',
          subject: { _id: 'sub3', subjectName: 'English' },
          classRef: { _id: 'cls3', className: 'Class 8' },
          section: { _id: 'sec3', sectionName: 'C' },
          branch: { _id: 'br1', branchName: 'Main Branch' }
        }
      ];
      
      setAssignments(mockAssignments);
      
      if (mockAssignments.length > 0) {
        setSelectedAssignment(mockAssignments[0]);
        await fetchStudentsForAssignment(mockAssignments[0]);
        await fetchAttendanceHistory(mockAssignments[0]._id);
      }
      
    } catch (error) {
      console.error('Error in fetchAssignments:', error);
    }
  };

  const fetchStudentsForAssignment = async (assignment) => {
    try {
      // Mock students data
      const mockStudents = Array.from({ length: 25 }, (_, i) => ({
        _id: `student${i + 1}`,
        fullName: `Student ${i + 1}`,
        rollNo: `${100 + i}`,
        parentName: `Parent ${i + 1}`,
        parentMobile: `98765432${i}`
      }));
      
      setStudents(mockStudents);
      
      // Initialize attendance data (default Present)
      const initialAttendance = {};
      mockStudents.forEach(student => {
        initialAttendance[student._id] = 'P';
      });
      setAttendanceData(initialAttendance);
      
      // Update stats
      updateStats(mockStudents, initialAttendance);
      
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendanceHistory = async (assignmentId) => {
    try {
      // Mock attendance history
      const mockAttendance = [
        {
          _id: 'att1',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          timeSlot: 'MORNING',
          description: 'Regular class',
          students: Array.from({ length: 25 }, (_, i) => ({
            student: { _id: `student${i + 1}`, fullName: `Student ${i + 1}` },
            status: Math.random() > 0.2 ? 'P' : 'A'
          }))
        },
        {
          _id: 'att2',
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          timeSlot: 'AFTERNOON',
          description: 'Test preparation',
          students: Array.from({ length: 25 }, (_, i) => ({
            student: { _id: `student${i + 1}`, fullName: `Student ${i + 1}` },
            status: Math.random() > 0.15 ? 'P' : 'A'
          }))
        }
      ];
      
      setAttendanceRecords(mockAttendance);
      
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const updateStats = (studentsList, attendance) => {
    const total = studentsList.length;
    let present = 0;
    Object.values(attendance).forEach(status => {
      if (status === 'P') present++;
    });
    setStats({
      totalStudents: total,
      presentToday: present,
      absentToday: total - present,
      attendancePercentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
    });
  };

  const handleAssignmentChange = async (assignmentId) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    setSelectedAssignment(assignment);
    await fetchStudentsForAssignment(assignment);
    await fetchAttendanceHistory(assignmentId);
  };

  const handleAttendanceToggle = (studentId, status) => {
    const newAttendance = {
      ...attendanceData,
      [studentId]: status
    };
    setAttendanceData(newAttendance);
    updateStats(students, newAttendance);
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendanceData(newAttendance);
    updateStats(students, newAttendance);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    
    if (!selectedAssignment) {
      setError('Please select an assignment');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setMarkingAttendance(true);
    setError('');
    setSuccessMessage('');

    try {
      const studentsList = Object.keys(attendanceData).map(studentId => ({
        student: studentId,
        status: attendanceData[studentId]
      }));

      const attendancePayload = {
        assignmentId: selectedAssignment._id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        description: description,
        students: studentsList
      };

      console.log('Submitting attendance:', attendancePayload);

      // Simulate API call
      setTimeout(() => {
        setSuccessMessage('Attendance marked successfully!');
        setShowAttendanceModal(false);
        
        // Add to history (for demo)
        const newRecord = {
          _id: `att${Date.now()}`,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          description: description,
          students: studentsList.map(s => ({
            student: { _id: s.student, fullName: `Student ${s.student.slice(-1)}` },
            status: s.status
          }))
        };
        setAttendanceRecords(prev => [newRecord, ...prev]);
        
        setTimeout(() => setSuccessMessage(''), 3000);
        setMarkingAttendance(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.message || 'Failed to mark attendance');
      setMarkingAttendance(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStatus = (studentId, records) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => {
      const recordDate = r.date ? new Date(r.date).toISOString().split('T')[0] : null;
      return recordDate === todayStr;
    });
    
    if (todayRecord && todayRecord.students) {
      const studentAttendance = todayRecord.students.find(s => 
        (typeof s.student === 'object' ? s.student._id === studentId : s.student === studentId)
      );
      return studentAttendance?.status;
    }
    return null;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Loading dashboard...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-[#0f172a] text-white flex flex-col justify-between">
          <div>
            <div className="p-6">
              <h1 className="text-xl font-bold">SL</h1>
              <p className="text-sm text-gray-400">Teacher Portal</p>
            </div>

            <nav className="space-y-2 px-4">
              <Link href="/teacher-dashboard">
                <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={true} />
              </Link>
              <Link href="/teacher-dashboard/attendance">
                <SidebarItem icon={<Calendar />} label="Attendance" />
              </Link>
              <Link href="/teacher-dashboard/classes">
                <SidebarItem icon={<BookOpen />} label="My Classes" />
              </Link>
              <Link href="/teacher-dashboard/students">
                <SidebarItem icon={<Users />} label="Students" />
              </Link>
              <Link href="/teacher-dashboard/reports">
                <SidebarItem icon={<BarChart3 />} label="Reports" />
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

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {teacher?.fullName || 'Teacher'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your classes and attendance
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Assignment Selector */}
          {assignments.length > 0 ? (
            <>
      

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={<Users className="text-blue-500" size={24} />}
                  label="Total Students"
                  value={stats.totalStudents}
                  bgColor="bg-blue-50"
                />
                <StatCard
                  icon={<UserCheck className="text-green-500" size={24} />}
                  label="Present Today"
                  value={stats.presentToday}
                  bgColor="bg-green-50"
                />
                <StatCard
                  icon={<UserX className="text-red-500" size={24} />}
                  label="Absent Today"
                  value={stats.absentToday}
                  bgColor="bg-red-50"
                />
                <StatCard
                  icon={<BarChart3 className="text-amber-500" size={24} />}
                  label="Attendance %"
                  value={`${stats.attendancePercentage}%`}
                  bgColor="bg-amber-50"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-6 rounded-xl transition flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Mark Attendance</h3>
                    <p className="text-amber-100">Take attendance for today's class</p>
                  </div>
                  <Plus size={32} className="group-hover:rotate-90 transition-transform" />
                </button>

                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-6 rounded-xl transition flex items-center justify-between border border-gray-200 group"
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-2">View History</h3>
                    <p className="text-gray-500">Check past attendance records</p>
                  </div>
                  <Calendar size={32} className="text-gray-400 group-hover:text-amber-500 transition" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classes Assigned</h3>
              <p className="text-gray-500">
                You haven't been assigned any classes yet. Please contact the administrator.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Mark Attendance</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendance}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    required
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    placeholder="Add any notes about today's class..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Present:</span>
                      <span className="ml-2 font-medium text-green-600">{stats.presentToday}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Absent:</span>
                      <span className="ml-2 font-medium text-red-600">{stats.absentToday}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-2 font-medium">{stats.totalStudents}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Percentage:</span>
                      <span className="ml-2 font-medium">{stats.attendancePercentage}%</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={markingAttendance}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {markingAttendance ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Attendance'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Attendance History - {selectedAssignment?.subject?.subjectName || 'Subject'}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            {attendanceRecords.length > 0 ? (
              <div className="space-y-4">
                {attendanceRecords.map(record => (
                  <div key={record._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-medium text-gray-900">
                          {record.date ? new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown Date'}
                        </span>
                        <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {timeSlots.find(s => s.value === record.timeSlot)?.label || record.timeSlot || 'Unknown Slot'}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-sm text-green-600">
                          Present: {record.students?.filter(s => s.status === 'P').length || 0}
                        </span>
                        <span className="text-sm text-red-600">
                          Absent: {record.students?.filter(s => s.status === 'A').length || 0}
                        </span>
                      </div>
                    </div>
                    
                    {record.description && (
                      <p className="text-sm text-gray-600 mb-2">📝 {record.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {(record.students || []).slice(0, 8).map((student, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-1">
                          <span className="truncate">
                            {typeof student.student === 'object' ? student.student?.fullName || 'Unknown' : 'Student'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            student.status === 'P' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                      ))}
                      {record.students && record.students.length > 8 && (
                        <div className="text-sm text-gray-500">
                          +{record.students.length - 8} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance records found
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

// Sidebar Item Component
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

// Stat Card Component
function StatCard({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-6 flex items-center justify-between`}>
      <div>
        <p className="text-gray-600 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 bg-white rounded-lg shadow-sm">
        {icon}
      </div>
    </div>
  );
}