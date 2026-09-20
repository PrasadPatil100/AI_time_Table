import React, { useState } from 'react';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
}

export function Register({
  onRegisterSuccess,
  onBackToLogin,
}: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const [loading, setLoading] = useState(false);

  // Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !department || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            department,
            role: 'faculty',
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Registration failed.');
        return;
      }

      // OTP has been sent
      alert('OTP sent to your email.');

      setShowOTP(true);

    } catch (error) {
      console.error('Registration error:', error);

      alert(
        'Cannot connect to the server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      alert('Please enter the OTP.');
      return;
    }

    if (otp.length !== 6) {
      alert('OTP must be 6 digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Invalid OTP.');
        return;
      }

      alert('Email verified successfully!');

      // Go back to login
      onRegisterSuccess();

    } catch (error) {
      console.error('OTP verification error:', error);

      alert(
        'Cannot connect to the server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP screen
  if (showOTP) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📧</div>

            <h1 className="text-3xl font-bold text-slate-800">
              Verify Your Email
            </h1>

            <p className="text-slate-500 mt-2">
              Enter the 6-digit OTP sent to
            </p>

            <p className="font-semibold text-slate-700 mt-1">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-sm text-center text-slate-500">
              OTP is valid for <b>5 minutes</b>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

          </form>

          <div className="text-center mt-6">
            <button
              onClick={onBackToLogin}
              className="text-blue-600 font-semibold hover:underline"
            >
              Back to Login
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Registration screen
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📅</div>

          <h1 className="text-3xl font-bold text-slate-800">
            Create Account
          </h1>

          <p className="text-slate-500 mt-2">
            Register for Automatic Timetable Generator
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Department
            </label>

            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter your department"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Create Account'}
          </button>

        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Already have an account?
          </p>

          <button
            onClick={onBackToLogin}
            className="mt-2 text-blue-600 font-semibold hover:underline"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}