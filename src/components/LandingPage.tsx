import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({
  onLogin,
  onRegister,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl">
              📅
            </div>

            <div className="font-bold text-xl">
              Smart Timetable
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                Pro
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#home" className="hover:text-indigo-600">
              Home
            </a>
            <a href="#features" className="hover:text-indigo-600">
              Features
            </a>
            <a href="#about" className="hover:text-indigo-600">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-5 py-2 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-50"
            >
              Login
            </button>

            <button
              onClick={onRegister}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Smart Timetable
              <br />
              <span className="text-indigo-600">
                Management System
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
              Create smarter, conflict-free timetables with intelligent
              scheduling and real-time updates. Streamline academic planning
              with AI-powered automation.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={onRegister}
                className="px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
              >
                🚀 Get Started
              </button>

              <button
                onClick={onLogin}
                className="px-7 py-3.5 border border-slate-300 rounded-xl font-semibold hover:bg-white"
              >
                🔐 Login
              </button>

            </div>

            {/* Trust Row */}
            <div className="flex flex-wrap gap-6 mt-10 text-sm text-slate-600">

              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                100% Conflict-free
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Zero Room Collisions
              </div>

              <div className="flex items-center gap-2">
                <span className="text-indigo-600">◆</span>
                MongoDB Cloud Backed
              </div>

            </div>
          </div>

          {/* Timetable Preview */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5">

            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg">
                  Timetable Preview
                </h3>
                <p className="text-sm text-slate-500">
                  CS Dept · Section A
                </p>
              </div>

              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                ✓ Conflict Free
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  Subjects
                </p>
                <p className="font-bold">
                  8 Active
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  Faculty
                </p>
                <p className="font-bold">
                  8 Assigned
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  Rooms
                </p>
                <p className="font-bold">
                  5 Available
                </p>
              </div>

            </div>

            <div className="flex gap-2 mb-4">

              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(
                (day, index) => (
                  <button
                    key={day}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      index === 0
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {day}
                  </button>
                )
              )}

            </div>

            <div className="space-y-3">

              {[
                ['09:00 – 09:45', 'Mathematics', 'Room 101'],
                ['09:45 – 10:30', 'Physics', 'Room 102'],
                ['10:45 – 11:30', 'Computer Science', 'Lab 1'],
                ['11:30 – 12:15', 'Chemistry', 'Room 103'],
              ].map(([time, subject, room]) => (

                <div
                  key={time}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">
                      🕐 {time}
                    </span>

                    <span className="text-xs text-green-600 font-medium">
                      ✓ Confirmed
                    </span>
                  </div>

                  <div className="font-semibold mt-2">
                    {subject}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    👤 Faculty &nbsp; • &nbsp; 🏫 {room}
                  </div>
                </div>

              ))}

            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-20 px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold">
              ⭐ Core Features
            </p>

            <h2 className="text-4xl font-bold mt-3">
              Everything You Need for Smart Scheduling
            </h2>

            <p className="text-slate-500 mt-4">
              Powerful tools designed to automate, optimize, and manage
              academic timetables.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {[
              ['🧠', 'AI-Based Timetable Generation'],
              ['🔄', 'Real-Time Timetable Updates'],
              ['⚖️', 'Faculty Workload Management'],
              ['🏫', 'Classroom Change Recommendation'],
              ['👥', 'Inter-College Faculty Sharing'],
              ['⚠️', 'Timetable Conflict Detection'],
              ['🔔', 'Student Notifications'],
            ].map(([icon, title]) => (

              <div
                key={title}
                className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition"
              >
                <div className="text-3xl mb-4">
                  {icon}
                </div>

                <h3 className="font-bold text-lg">
                  {title}
                </h3>

                <p className="text-sm text-slate-500 mt-3">
                  Smart tools to simplify academic scheduling,
                  improve resource utilization, and reduce conflicts.
                </p>
              </div>

            ))}

          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-indigo-600 font-semibold">
              Technology Stack
            </p>

            <h2 className="text-4xl font-bold mt-3">
              Built for Scalable Academic Data
            </h2>

            <p className="text-slate-600 mt-5 leading-relaxed">
              The system uses a modern architecture for managing
              departments, subjects, faculty, classrooms and generated
              timetables efficiently.
            </p>

            <div className="mt-6 space-y-4">

              {[
                'Document-Based Storage',
                'Conflict Validation',
                'JSON Time Slots',
                'Scalable Architecture',
              ].map((item) => (

                <div
                  key={item}
                  className="flex gap-3 items-center"
                >
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">
                    {item}
                  </span>
                </div>

              ))}

            </div>

          </div>

          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl">
            <p className="text-green-400 text-sm mb-4">
              // Smart Timetable Architecture
            </p>

            <pre className="text-sm overflow-x-auto">
{`{
  "department": "Computer Science",
  "year": 3,
  "division": "A",
  "subjects": [],
  "faculty": [],
  "classrooms": [],
  "timeSlots": []
}`}
            </pre>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 text-white py-16 px-6 text-center">

        <h2 className="text-4xl font-bold">
          Ready to Transform Your Timetable Management?
        </h2>

        <p className="mt-4 text-indigo-100">
          Create optimized academic schedules and reduce timetable conflicts.
        </p>

        <div className="flex justify-center gap-4 mt-8">

          <button
            onClick={onRegister}
            className="px-7 py-3 bg-white text-indigo-600 rounded-xl font-semibold"
          >
            🚀 Get Started Free
          </button>

          <button
            onClick={onLogin}
            className="px-7 py-3 border border-white/40 rounded-xl font-semibold"
          >
            🔐 Sign In
          </button>

        </div>

      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6">

        <div className="max-w-7xl mx-auto text-center">

          <div className="text-white font-bold text-xl">
            📅 Smart Timetable
          </div>

          <p className="mt-3 text-sm">
            Intelligent scheduling platform for modern educational
            institutions.
          </p>

          <p className="mt-6 text-xs">
            © 2026 Smart Timetable Management System
          </p>

        </div>

      </footer>

    </div>
  );
}