'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building,
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  Grid,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalBranches: 0,
    totalClasses: 0,
    totalSections: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeSessions: 0
  });

  const [recentBranches, setRecentBranches] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel for better performance
      const [branchesRes, teachersRes, studentsRes, classesRes, sectionsRes] = await Promise.allSettled([
        apiRequest('/branches'),
        apiRequest('/teachers'),
        apiRequest('/students'),
        apiRequest('/classes'),
        apiRequest('/sections')
      ]);

      // Process Branches
      if (branchesRes.status === 'fulfilled' && branchesRes.value?.success) {
        // Get only first 2 branches for recent
        setRecentBranches(branchesRes.value.data.slice(0, 2));
        setStats(prev => ({
          ...prev,
          totalBranches: branchesRes.value.data.length
        }));
      } else {
        console.error('Branches fetch failed:', branchesRes.reason);
      }

      // Process Teachers
      if (teachersRes.status === 'fulfilled') {
        const teachersData = teachersRes.value;
        if (Array.isArray(teachersData)) {
          // Get only first 2 teachers for recent
          setRecentTeachers(teachersData.slice(0, 2));
          setStats(prev => ({ ...prev, totalTeachers: teachersData.length }));
        } else if (teachersData?.success && Array.isArray(teachersData.data)) {
          // Get only first 2 teachers for recent
          setRecentTeachers(teachersData.data.slice(0, 2));
          setStats(prev => ({ ...prev, totalTeachers: teachersData.data.length }));
        }
      }

      // Process Students
      if (studentsRes.status === 'fulfilled') {
        const studentsData = studentsRes.value;
        if (Array.isArray(studentsData)) {
          setStats(prev => ({ ...prev, totalStudents: studentsData.length }));
        } else if (studentsData?.success && Array.isArray(studentsData.data)) {
          setStats(prev => ({ ...prev, totalStudents: studentsData.data.length }));
        }
      }

      // Process Classes - get total count
      if (classesRes.status === 'fulfilled') {
        const classesData = classesRes.value;
        if (Array.isArray(classesData)) {
          setStats(prev => ({ ...prev, totalClasses: classesData.length }));
        } else if (classesData?.success && Array.isArray(classesData.data)) {
          setStats(prev => ({ ...prev, totalClasses: classesData.data.length }));
        }
      }

      // Process Sections - get total count
      if (sectionsRes.status === 'fulfilled') {
        const sectionsData = sectionsRes.value;
        if (Array.isArray(sectionsData)) {
          setStats(prev => ({ ...prev, totalSections: sectionsData.length }));
        } else if (sectionsData?.success && Array.isArray(sectionsData.data)) {
          setStats(prev => ({ ...prev, totalSections: sectionsData.data.length }));
        }
      }

      // Set active sessions (you can implement this based on your needs)
      setStats(prev => ({ ...prev, activeSessions: 0 }));

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Loading dashboard...</span>
            </div>
            <p className="text-sm text-gray-500">Fetching your data</p>
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
                <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={true} />
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

          {/* HEADER with Refresh Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-700">Welcome back, Admin!</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Branches" 
              value={stats.totalBranches} 
              color="border-amber-500"
              icon={<Building className="text-amber-500" size={24} />}
            />
            <StatCard 
              title="Total Classes" 
              value={stats.totalClasses} 
              color="border-blue-500"
              icon={<BookOpen className="text-blue-500" size={24} />}
            />
            <StatCard 
              title="Total Sections" 
              value={stats.totalSections} 
              color="border-green-500"
              icon={<Layers className="text-green-500" size={24} />}
            />
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              color="border-purple-500"
              icon={<Users className="text-purple-500" size={24} />}
            />
            <StatCard 
              title="Total Teachers" 
              value={stats.totalTeachers} 
              color="border-orange-500"
              icon={<Users className="text-orange-500" size={24} />}
            />
            <StatCard 
              title="Active Sessions" 
              value={stats.activeSessions} 
              color="border-red-500"
              icon={<GraduationCap className="text-red-500" size={24} />}
            />
          </div>

          {/* RECENT ACTIVITY SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Branches - Only 2 rows */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Branches</h3>
              {recentBranches.length > 0 ? (
                <div className="space-y-3">
                  {recentBranches.map((branch, idx) => (
                    <div key={branch._id || idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{branch.branchName}</p>
                        <p className="text-sm text-gray-500">{branch.schoolName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        branch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {branch.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No branches found</p>
              )}
              <Link 
                href="/admin-dashboard/branches"
                className="mt-4 inline-flex items-center text-amber-500 hover:text-amber-600"
              >
                View All ({stats.totalBranches}) →
              </Link>
            </div>

            {/* Recent Teachers - Only 2 rows */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Teachers</h3>
              {recentTeachers.length > 0 ? (
                <div className="space-y-3">
                  {recentTeachers.map((teacher, idx) => (
                    <div key={teacher._id || idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{teacher.fullName || teacher.name}</p>
                        <p className="text-sm text-gray-500">{teacher.phone || 'No phone'}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        ₹{teacher.salary?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No teachers found</p>
              )}
              <Link 
                href="/admin-dashboard/teachers"
                className="mt-4 inline-flex items-center text-amber-500 hover:text-amber-600"
              >
                View All ({stats.totalTeachers}) →
              </Link>
            </div>
          </div>
        </div>
      </div>
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

/* Stat Card Component */
function StatCard({ title, value, color, icon }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${color} relative overflow-hidden hover:shadow-lg transition`}>
      <div className="absolute right-4 top-4 opacity-20">
        {icon}
      </div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-2">
        {value}
      </h3>
    </div>
  );
}