import React from 'react';
import { AcademicYear, Department, YearOption } from '../types';
import { ACADEMIC_YEARS } from '../data/academicYears';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Check,
} from 'lucide-react';

interface Step2YearProps {
  department: Department;
  selectedYear: AcademicYear;
  onSelectYear: (year: AcademicYear) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Year: React.FC<Step2YearProps> = ({
  department,
  selectedYear,
  onSelectYear,
  onBack,
  onNext,
}) => {
  const currentYearOption =
    ACADEMIC_YEARS.find((y) => y.year === selectedYear) || ACADEMIC_YEARS[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Department Context Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 font-bold text-base shadow-xs">
            {department.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Selected Department
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                Step 1 Complete
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {department.name}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          id="change-department-btn"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change Department
        </button>
      </div>

      {/* Main Header & Prompt */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          Step 2 of 6 • Academic Year
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Academic Year (1, 2, 3, or 4)
        </h2>
        <p className="text-sm text-slate-600">
          Choose the class standing for <strong className="text-slate-800 font-semibold">{department.name}</strong>.
          Every department supports curriculum generation for all four undergraduate years.
        </p>
      </div>

      {/* Year Quick-Select Tab Bar */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 bg-slate-100 border border-slate-200/80 rounded-2xl gap-1 sm:gap-2 shadow-inner">
          {ACADEMIC_YEARS.map((opt) => {
            const isSelected = selectedYear === opt.year;
            return (
              <button
                key={opt.year}
                type="button"
                id={`quick-year-btn-${opt.year}`}
                onClick={() => onSelectYear(opt.year)}
                className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/90 font-bold scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {opt.year}
                </span>
                <span>{opt.title}</span>
                <span className="hidden sm:inline text-xs text-slate-400 font-normal">
                  ({opt.shortCode})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Year Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACADEMIC_YEARS.map((option: YearOption) => {
          const isSelected = selectedYear === option.year;

          // Distinct visual identity for each year
          const yearThemes: Record<
            AcademicYear,
            { accent: string; badgeColor: string; ringColor: string }
          > = {
            1: {
              accent: 'from-blue-600 to-indigo-600',
              badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
              ringColor: 'ring-blue-500/40 border-blue-500',
            },
            2: {
              accent: 'from-emerald-600 to-teal-600',
              badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              ringColor: 'ring-emerald-500/40 border-emerald-500',
            },
            3: {
              accent: 'from-amber-500 to-orange-600',
              badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
              ringColor: 'ring-amber-500/40 border-amber-500',
            },
            4: {
              accent: 'from-purple-600 to-rose-600',
              badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
              ringColor: 'ring-purple-500/40 border-purple-500',
            },
          };

          const theme = yearThemes[option.year];

          return (
            <div
              key={option.year}
              id={`year-card-${option.year}`}
              onClick={() => onSelectYear(option.year)}
              className={`relative group rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                isSelected
                  ? `bg-white shadow-md ring-2 ${theme.ringColor} scale-[1.02]`
                  : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Active Selection Checkmark Badge */}
              {isSelected && (
                <div className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white rounded-full p-1 shadow-md ring-2 ring-white">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {/* Card Top: Year Number & Badges */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.accent} text-white flex items-center justify-center font-extrabold text-xl shadow-sm`}
                  >
                    {option.year}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${theme.badgeColor}`}
                  >
                    {option.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {option.semesters}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {option.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {option.label}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {option.focus}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Selection Status */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  Tailored Subjects
                </span>
                <span
                  className={`text-xs font-bold transition-colors ${
                    isSelected
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {isSelected ? 'Selected ✓' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Year Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white text-xl font-black">
            {selectedYear}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Current Configuration
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-medium">
                {currentYearOption.semesters}
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-0.5">
              {department.name} • {currentYearOption.title} ({currentYearOption.shortCode})
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-1">
              {currentYearOption.focus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-[11px] text-slate-400 block">Next Step</span>
            <span className="text-xs font-semibold text-white">
              Division / Section
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
        <button
          type="button"
          id="year-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300/80 px-4 sm:px-5 py-2.5 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Department</span>
        </button>

        <button
          type="button"
          id="year-next-btn"
          onClick={onNext}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 sm:px-7 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.01]"
        >
          <span>Continue to Division</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
