'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [stats, setStats] = useState({
    totalClasses: 1,
    presentDays: 0,
    attendancePercentage: 0,
    upcomingClasses: 3
  });
  
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('studentName') || localStorage.getItem('username') || 'Student';
    setStudentName(name);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      const linkedId = localStorage.getItem('linkedId');
      
      if (!token) {
        router.push('/');
        return;
      }

      // Try to fetch real attendance data
      try {
        // First try to get student profile to get parent info
        if (userId) {
          const profileData = await apiRequest(`/users/${userId}`);
          if (profileData.success) {
            setParentName(profileData.data.parentName || 'Not available');
          }
        }

        // Get attendance data
        const studentId = linkedId || userId;
        if (studentId) {
          const attendanceData = await apiRequest(`/attendance/student/${studentId}`);
          
          if (attendanceData.success && attendanceData.data) {
            const attendance = attendanceData.data;
            
            const totalClasses = attendance.length;
            const presentDays = attendance.filter(a => {
              // Handle different possible data structures
              if (a.status === 'P') return true;
              if (a.students) {
                const studentRecord = a.students.find(s => 
                  s.student === studentId || s.studentId === studentId
                );
                return studentRecord?.status === 'P';
              }
              return false;
            }).length;
            
            const percentage = totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 0;
            
            setStats({
              totalClasses: totalClasses,
              presentDays: presentDays,
              attendancePercentage: percentage,
              upcomingClasses: 3 // This would come from schedule API
            });
            
            // Format recent attendance
            const formattedAttendance = attendance.slice(0, 3).map(record => {
              let status = 'A';
              let subject = record.subject || 'Class';
              let date = record.date ? new Date(record.date).toLocaleDateString() : 'Recent';
              
              if (record.status) {
                status = record.status;
              } else if (record.students) {
                const studentRecord = record.students.find(s => 
                  s.student === studentId || s.studentId === studentId
                );
                status = studentRecord?.status || 'A';
              }
              
              return {
                subject,
                date,
                status,
                formattedDate: record.date
              };
            });
            
            setRecentAttendance(formattedAttendance);
          } else {
            setApiError(true);
            loadSampleData();
          }
        }
      } catch (error) {
        console.log('Using sample data - API not available', error);
        setApiError(true);
        loadSampleData();
      }
      
      // Load sample schedule data (would come from API)
      setTodaySchedule([
        { time: '9:00 AM', subject: 'Mathematics', room: 'Room 101', teacher: 'Mr. Smith' },
        { time: '10:30 AM', subject: 'Science', room: 'Lab 203', teacher: 'Dr. Watson' },
        { time: '1:00 PM', subject: 'English', room: 'Room 105', teacher: 'Ms. Johnson' }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
      setApiError(true);
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setStats({
      totalClasses: 24,
      presentDays: 21,
      attendancePercentage: 88,
      upcomingClasses: 3
    });
    
    setRecentAttendance([
      { subject: 'Mathematics', date: 'March 15, 2024', status: 'P' },
      { subject: 'Science', date: 'March 14, 2024', status: 'P' },
      { subject: 'English', date: 'March 13, 2024', status: 'A' }
    ]);
    
    setParentName('Robert Johnson');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('linkedId');
    localStorage.removeItem('studentName');
    router.push('/');
  };

  const tabs = [
    { name: 'Dashboard', path: '/student-dashboard', active: true },
    { name: 'My Attendance', path: '/student-dashboard/attendance', active: false },
    { name: 'Class Schedule', path: '/student-dashboard/schedule', active: false },
    { name: 'Reports', path: '/student-dashboard/reports', active: false },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'P': return 'bg-green-100 text-green-700';
      case 'A': return 'bg-red-100 text-red-700';
      case 'L': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Late';
      default: return status || 'Unknown';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <div className="text-amber-600 flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-amber-50">
        <div className="p-8">
          {/* Header with Logout */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-800 mb-2">
                Amber Horizon
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200 transition"
            >
              <span>Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* API Warning if needed */}
          {apiError && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Using sample data - Backend API not available</span>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Student Dashboard
            </h2>
          </div>

          <div className="mb-8">
            <p className="text-xl text-gray-700">
              Welcome, <span className="font-semibold text-amber-700">{studentName}</span>
            </p>
            {parentName && (
              <p className="text-gray-600">
                Parent: {parentName}
              </p>
            )}
          </div>

          <div className="mb-8 border-b border-gray-300">
            <div className="flex space-x-8 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.path}
                  className={`pb-2 px-1 whitespace-nowrap ${
                    tab.active
                      ? 'text-amber-600 border-b-2 border-amber-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-1">Total Classes</h3>
              <p className="text-3xl font-bold text-amber-600">{stats.totalClasses}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-1">Attendance</h3>
              <p className="text-3xl font-bold text-amber-600">{stats.attendancePercentage}%</p>
              <p className="text-xs text-gray-500 mt-1">{stats.presentDays} days present</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm mb-1">Upcoming Classes</h3>
              <p className="text-3xl font-bold text-amber-600">{stats.upcomingClasses}</p>
            </div>
          </div>

          {/* Recent Attendance and Schedule Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">Recent Attendance</h3>
              
              {recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((record, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div>
                        <p className="font-medium text-gray-800">{record.subject}</p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No attendance records available</p>
              )}
              
              <Link 
                href="/student-dashboard/attendance"
                className="mt-4 text-sm text-amber-600 hover:text-amber-800 inline-flex items-center"
              >
                View all attendance
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">Today's Schedule</h3>
              
              {todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-sm font-medium min-w-[80px]">
                        {item.time}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.subject}</p>
                        <p className="text-xs text-gray-500">{item.room} • {item.teacher}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No classes scheduled today</p>
              )}
              
              <Link 
                href="/student-dashboard/schedule"
                className="mt-4 text-sm text-amber-600 hover:text-amber-800 inline-flex items-center"
              >
                View full schedule
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}