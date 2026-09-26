import React, { useState } from 'react';
import { AcademicYear, Department, Division } from '../types';
import {
  Users,
  Plus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface Step2DivisionProps {
  department: Department;
  year: AcademicYear;
  divisions: Division[];
  selectedDivision: Division | null;
  onSelectDivision: (division: Division) => void;
  onAddCustomDivision: (division: Division) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Division: React.FC<Step2DivisionProps> = ({
  department,
  year,
  divisions,
  selectedDivision,
  onSelectDivision,
  onAddCustomDivision,
  onBack,
  onNext,
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRoom, setCustomRoom] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Please enter a division/section name (e.g., E, Section 2, Batch-A).');
      return;
    }

    const newDiv: Division = {
      id: `custom-div-${Date.now()}`,
      name: customName.trim(),
      roomNumber: customRoom.trim() || `Room ${100 + divisions.length + 1}`,
      isCustom: true,
    };

    onAddCustomDivision(newDiv);
    onSelectDivision(newDiv);
    setIsAddingCustom(false);
    setCustomName('');
    setCustomRoom('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2 border border-sky-200/60">
            <span>Step 3 of 6</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              Year {year}
            </span>
            <span>•</span>
            <span>Section & Cohort</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Select Division / Class Section
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Choose the student division for{' '}
            <strong className="text-slate-800">{department.name}</strong> •{' '}
            <strong className="text-indigo-700">Year {year}</strong>. Timetable periods
            will be uniquely assigned for this classroom.
          </p>
        </div>

        <button
          type="button"
          id="toggle-custom-division-btn"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 px-3.5 py-2 rounded-xl transition border border-sky-200/70"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingCustom ? 'Close Form' : 'Add Custom Division'}</span>
        </button>
      </div>

      {/* Add Custom Division Form */}
      {isAddingCustom && (
        <div className="p-5 bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/70 border-2 border-dashed border-sky-300 rounded-2xl shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <h4 className="text-sm font-bold text-sky-950">
              Create New Division / Batch
            </h4>
          </div>
          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 mb-3 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}
          <form onSubmit={handleCreateCustom} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Division / Section Name *
                </label>
                <input
                  type="text"
                  id="custom-div-name-input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. E, Section-1, Batch CS-A2"
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Designated Classroom / Lecture Hall
                </label>
                <input
                  type="text"
                  id="custom-div-room-input"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  placeholder="e.g. Hall 401, LH-3"
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                id="save-custom-div-btn"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save & Select Division</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Division Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {divisions.map((division) => {
          const isSelected = selectedDivision?.id === division.id;

          return (
            <div
              key={division.id}
              id={`div-card-${division.id}`}
              onClick={() => onSelectDivision(division)}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 border text-center relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50/70 border-sky-500 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/20'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-3.5">
                  <CheckCircle2 className="w-5 h-5 text-sky-600" />
                </div>
              )}

              <div className="mb-4">
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-extrabold text-2xl mb-3 transition-colors ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {division.name}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Division {division.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{division.roomNumber || 'Room Assigned'}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isSelected
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isSelected ? 'Active Selection' : 'Choose Division'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
        <button
          type="button"
          id="back-to-step-2-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Year Selection</span>
        </button>

        {selectedDivision && (
          <button
            type="button"
            id="proceed-to-subjects-btn"
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <span>Continue to Subjects & Teachers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
