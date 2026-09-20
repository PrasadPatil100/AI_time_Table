import React from 'react';
import { CalendarDays, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  onReset: () => void;
  departmentName?: string;
  year?: number;
  divisionName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onReset,
  departmentName,
  year,
  divisionName,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-50">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Automatic Timetable Generator
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Auto-Scheduler
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Academic Year 2026–2027 • Multi-Year College Scheduler
              </p>
            </div>
          </div>

          {/* Context Badge & Reset */}
          <div className="flex items-center gap-3">
            {departmentName && (
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 border border-slate-200/70 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-900 font-semibold">{departmentName}</span>
                {year && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200/60">
                      Year {year}
                    </span>
                  </>
                )}
                {divisionName && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span>Div: <strong className="text-slate-800">{divisionName}</strong></span>
                  </>
                )}
              </div>
            )}

            {currentStep > 1 && (
              <button
                type="button"
                id="reset-flow-btn"
                onClick={onReset}
                title="Restart configuration"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Start Over</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
