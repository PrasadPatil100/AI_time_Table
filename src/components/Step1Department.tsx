import React, { useState } from 'react';
import { Department } from '../types';
import {
  Laptop,
  Network,
  Cpu,
  Cog,
  Building2,
  Zap,
  Bot,
  Plus,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface Step1DepartmentProps {
  departments: Department[];
  selectedDepartment: Department | null;
  onSelectDepartment: (dept: Department) => void;
  onAddCustomDepartment: (dept: Department) => void;
  onNext: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Laptop,
  Network,
  Cpu,
  Cog,
  Building2,
  Zap,
  Bot,
  GraduationCap,
};

export const Step1Department: React.FC<Step1DepartmentProps> = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
  onAddCustomDepartment,
  onNext,
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customColor, setCustomColor] = useState('indigo');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Please enter a department name.');
      return;
    }

    const code = customCode.trim().toUpperCase() || customName.trim().slice(0, 4).toUpperCase();
    const newDept: Department = {
      id: `custom-dept-${Date.now()}`,
      name: customName.trim(),
      code,
      iconName: 'GraduationCap',
      accentColor: customColor,
      description: customDesc.trim() || 'Custom academic engineering department curriculum',
      isCustom: true,
    };

    onAddCustomDepartment(newDept);
    onSelectDepartment(newDept);
    setIsAddingCustom(false);
    setCustomName('');
    setCustomCode('');
    setCustomDesc('');
    setErrorMsg('');
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM_NEW') {
      setIsAddingCustom(true);
      return;
    }
    const found = departments.find((d) => d.id === val);
    if (found) {
      onSelectDepartment(found);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <span>Step 1 of 6</span>
            <span>•</span>
            <span>Academic Discipline</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Select Department
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Choose your faculty or engineering branch. We will automatically preload
            accredited core subjects, default teachers, and weekly hours for this department.
          </p>
        </div>

        {/* Quick Dropdown Selector */}
        <div className="w-full md:w-72 shrink-0">
          <label
            htmlFor="department-quick-dropdown"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Quick Select Dropdown
          </label>
          <div className="relative">
            <select
              id="department-quick-dropdown"
              value={selectedDepartment?.id || ''}
              onChange={handleDropdownChange}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2.5 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="" disabled>
                -- Select Department --
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code}) {d.isCustom ? '★ Custom' : ''}
                </option>
              ))}
              <option value="CUSTOM_NEW">+ Add Custom Department...</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            All Engineering Departments ({departments.length})
          </h3>
          <button
            type="button"
            id="add-custom-dept-toggle-btn"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingCustom ? 'Close Custom Form' : 'Add Custom Department'}</span>
          </button>
        </div>

        {/* Custom Department Modal / Expandable Card */}
        {isAddingCustom && (
          <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 border-2 border-dashed border-indigo-300 rounded-2xl shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-indigo-950">
                Register New Custom Department
              </h4>
            </div>
            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 mb-3 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    id="custom-dept-name-input"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence & Data Science, Aerospace, Biomedical"
                    className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    id="custom-dept-code-input"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="e.g. AI-DS"
                    maxLength={8}
                    className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Focus Area (Optional)
                </label>
                <input
                  type="text"
                  id="custom-dept-desc-input"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="e.g. Machine learning pipelines, deep learning, big data architectures"
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Theme Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500' },
                    { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-500' },
                    { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
                    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
                    { id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
                    { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
                    { id: 'teal', name: 'Teal', bg: 'bg-teal-500' },
                    { id: 'orange', name: 'Orange', bg: 'bg-orange-500' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setCustomColor(color.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition ${
                        customColor === color.id
                          ? 'border-slate-800 bg-white shadow-xs font-semibold'
                          : 'border-slate-200 bg-white/70 text-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${color.bg}`} />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  id="submit-custom-dept-btn"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add & Select Department</span>
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const isSelected = selectedDepartment?.id === dept.id;
            const Icon = ICON_MAP[dept.iconName] || GraduationCap;

            return (
              <div
                key={dept.id}
                id={`dept-card-${dept.id}`}
                onClick={() => onSelectDepartment(dept)}
                className={`relative group p-5 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100/70 group-hover:text-indigo-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
                        {dept.code}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-indigo-900">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Preloaded Curriculum
                  </span>
                  <span
                    className={`font-semibold ${
                      isSelected ? 'text-indigo-600' : 'text-slate-600'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Click to select →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedDepartment && (
        <div className="sticky bottom-4 z-20 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-200/80 shadow-lg shadow-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Selected Department</p>
              <h4 className="text-sm font-bold text-slate-900">
                {selectedDepartment.name}{' '}
                <span className="text-indigo-600 font-mono font-normal">({selectedDepartment.code})</span>
              </h4>
            </div>
          </div>

          <button
            type="button"
            id="proceed-to-division-btn"
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <span>Continue to Division</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
