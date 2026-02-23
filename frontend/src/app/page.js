'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Add error state for better UX

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role', data.user.role);
      
      // Store userId and linkedId if available
      if (data.user._id) {
        localStorage.setItem('userId', data.user._id);
      }
      if (data.user.linkedId) {
        localStorage.setItem('linkedId', data.user.linkedId);
      }

      // Role-based redirection
      switch (data.user.role) {
        case 'admin':
          router.push('/admin-dashboard');
          break;
        case 'teacher':
          router.push('/teacher-dashboard');
          break;
        case 'student':
          router.push('/student-dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message); // Show error in UI instead of alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE IMAGE - unchanged */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
          alt="education"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white p-10">
          <h1 className="text-4xl font-bold mb-4">Welcome Back 👋</h1>
          <p className="text-lg text-center max-w-md">
            Manage attendance, track performance, and simplify education with ease.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/80 shadow-2xl rounded-2xl p-8 border border-white/30">

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">SL</h2>
            <p className="text-gray-600">Attendance System</p>
          </div>

          {/* Login Title */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Login to Your Account
          </h3>

          {/* Error Message - ADD THIS */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-black font-medium placeholder:text-gray-400 transition-all"
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-black font-medium placeholder:text-gray-400 transition-all pr-12"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors"
                disabled={loading}
              >
                {showLoginPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Optional: Forgot Password link */}
            <div className="text-center mt-2">
              <a href="#" className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}