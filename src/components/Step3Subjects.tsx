import React, { useState } from 'react';
import { AcademicYear, Department, Division, Subject } from '../types';
import { COLOR_PALETTES } from '../data/colorPalettes';
import {
  BookOpen,
  UserCheck,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  DoorClosed,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';

interface Step3SubjectsProps {
  department: Department;
  year: AcademicYear;
  division: Division;
  subjects: Subject[];
  onChangeSubjects: (subjects: Subject[]) => void;
  onResetToDefaults: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step3Subjects: React.FC<Step3SubjectsProps> = ({
  department,
  year,
  division,
  subjects,
  onChangeSubjects,
  onResetToDefaults,
  onBack,
  onNext,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newPeriods, setNewPeriods] = useState(4);
  const [newIsLab, setNewIsLab] = useState(false);
  const [newColorIdx, setNewColorIdx] = useState(0);

  // Total periods calculation
  const totalWeeklyPeriods = subjects.reduce(
    (acc, s) => acc + (Number(s.periodsPerWeek) || 0),
    0
  );

  const labCount = subjects.filter((s) => s.isLab).length;
  const theoryCount = subjects.filter((s) => !s.isLab).length;

  // Typical weekly capacity benchmark (5 days x 6 periods = 30 periods, or 6 days x 6 = 36 periods)
  const standardCapacity = 36;

  const handleUpdateSubject = (id: string, field: keyof Subject, value: any) => {
    const updated = subjects.map((subj) => {
      if (subj.id === id) {
        return { ...subj, [field]: value };
      }
      return subj;
    });
    onChangeSubjects(updated);
  };

  const handleToggleLab = (id: string) => {
    const updated = subjects.map((subj) => {
      if (subj.id === id) {
        const nextIsLab = !subj.isLab;
        return {
          ...subj,
          isLab: nextIsLab,
          roomType: (nextIsLab ? 'lab' : 'lecture') as 'lecture' | 'lab',
          periodsPerWeek: nextIsLab ? Math.max(2, subj.periodsPerWeek) : subj.periodsPerWeek,
        };
      }
      return subj;
    });
    onChangeSubjects(updated);
  };

  const handlePeriodsIncrement = (id: string, delta: number) => {
    const updated = subjects.map((subj) => {
      if (subj.id === id) {
        const current = Number(subj.periodsPerWeek) || 0;
        const next = Math.max(1, Math.min(10, current + delta));
        return { ...subj, periodsPerWeek: next };
      }
      return subj;
    });
    onChangeSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert('You must have at least one subject to generate a timetable.');
      return;
    }
    onChangeSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    if (subjects.length >= 8) {
      const confirmAdd = window.confirm(
        'The college curriculum guideline specifies a maximum of 7 to 8 subjects (4 Theory + 3–4 Practical Labs) for balanced daily scheduling. Do you still want to add this subject?'
      );
      if (!confirmAdd) return;
    }

    const palette = COLOR_PALETTES[newColorIdx % COLOR_PALETTES.length];
    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      name: newSubjName.trim(),
      code:
        newSubjCode.trim().toUpperCase() ||
        `${department.code}${300 + subjects.length + 1}`,
      teacherName: newTeacherName.trim() || 'Faculty Assigned',
      periodsPerWeek: Number(newPeriods) || (newIsLab ? 2 : 4),
      isLab: newIsLab,
      roomType: newIsLab ? 'lab' : 'lecture',
      color: palette.color,
      bgLight: palette.bgLight,
      borderClass: palette.borderClass,
      textClass: palette.textClass,
    };

    onChangeSubjects([...subjects, newSubj]);
    setNewSubjName('');
    setNewSubjCode('');
    setNewTeacherName('');
    setNewPeriods(4);
    setNewIsLab(false);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200/60">
            <span>Step 4 of 6</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              Year {year}
            </span>
            <span>•</span>
            <span>Faculty & Load Allocation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Subjects & Teacher Assignment
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Preloaded curriculum for <strong className="text-slate-800">{department.name}</strong> •{' '}
            <strong className="text-indigo-700">Year {year}</strong> •{' '}
            <strong className="text-slate-800">Division {division.name}</strong>. Assign teacher
            names and configure weekly teaching periods for each subject.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="reset-default-subjects-btn"
            onClick={onResetToDefaults}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition shadow-xs"
            title="Reset to default subjects for this department"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            id="open-add-subject-btn"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Cancel New' : 'Add Subject'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-500 font-medium">Total Curriculum</p>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  subjects.length <= 8
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {subjects.length <= 8 ? '✓ 7–8 Subjects' : 'Exceeds 8'}
              </span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              {subjects.length} Subjects{' '}
              <span className="text-xs font-normal text-slate-500">
                ({theoryCount} Theory, {labCount} Labs)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Daily Lab Rule</p>
            <p className="text-sm font-extrabold text-purple-900">
              ≥1 Lab Every Day <span className="text-xs font-normal text-slate-500">(Mon–Sat)</span>
            </p>
            <p className="text-[11px] text-slate-500">4 Lec + 1 Lab (or 2 Lec + 2 Labs)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Daily Academic Hours</p>
            <p className="text-sm font-extrabold text-emerald-700">09:30 AM – 05:00 PM</p>
            <p className="text-[11px] text-slate-500">36 Slots / Week • 0 Free Slots</p>
          </div>
        </div>
      </div>

      {/* Exceeds 7-8 subjects warning if applicable */}
      {subjects.length > 8 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Curriculum Advisory: {subjects.length} Subjects Configured</span>
            <span>
              The standard college structure limits courses to a maximum of 7 to 8 subjects (4 Theory + 3–4 Practical Labs) to ensure each day has 4 lectures and 1 lab without student overload. Consider removing excess electives using the trash icon.
            </span>
          </div>
        </div>
      )}

      {/* Add New Subject Modal / Form */}
      {isAddingNew && (
        <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/70 border-2 border-dashed border-emerald-300 rounded-2xl shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-950">
              Add New Course / Subject
            </h4>
          </div>
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  id="new-subject-name-input"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Cloud Security, Embedded C"
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  id="new-subject-code-input"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  placeholder="e.g. CS308"
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Teacher / Professor Name
                </label>
                <input
                  type="text"
                  id="new-subject-teacher-input"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="e.g. Dr. John Watson, Prof. Mary Adams"
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Periods per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  id="new-subject-periods-input"
                  value={newPeriods}
                  onChange={(e) => setNewPeriods(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Practical Lab Toggle */}
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="text-xs font-bold text-purple-950 block">
                    Is this a Practical Laboratory course?
                  </span>
                  <span className="text-[11px] text-purple-700">
                    Will be scheduled in continuous 2-hour lab blocks and assigned to a Laboratory room.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsLab}
                  onChange={(e) => {
                    setNewIsLab(e.target.checked);
                    if (e.target.checked) setNewPeriods(2);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Color preview */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Timetable Color Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTES.map((palette, idx) => (
                  <button
                    key={palette.color}
                    type="button"
                    onClick={() => setNewColorIdx(idx)}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      newColorIdx === idx
                        ? 'ring-2 ring-slate-800 ring-offset-2 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: palette.hex }}
                    title={palette.color}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                id="submit-add-subject-btn"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Subject List</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table of Subjects */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="subjects-config-table">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[200px]">Subject Name & Code</th>
                <th className="py-3.5 px-4 w-32 text-center">Course Type</th>
                <th className="py-3.5 px-4 min-w-[220px]">Teacher / Faculty Name</th>
                <th className="py-3.5 px-4 min-w-[150px] text-center">
                  Periods / Week
                </th>
                <th className="py-3.5 px-4 text-center w-20">Color</th>
                <th className="py-3.5 px-4 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjects.map((subj, index) => {
                const palette =
                  COLOR_PALETTES.find((p) => p.color === subj.color) ||
                  COLOR_PALETTES[index % COLOR_PALETTES.length];

                return (
                  <tr
                    key={subj.id}
                    id={`subject-row-${subj.id}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Index Number */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                      {index + 1}
                    </td>

                    {/* Subject Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <input
                          type="text"
                          aria-label={`Subject Name for ${subj.name}`}
                          value={subj.name}
                          onChange={(e) =>
                            handleUpdateSubject(subj.id, 'name', e.target.value)
                          }
                          className="w-full font-semibold text-slate-900 text-sm bg-transparent hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 outline-none border border-transparent focus:border-slate-300 transition"
                        />
                        <div className="flex items-center gap-2 px-2">
                          <input
                            type="text"
                            aria-label={`Code for ${subj.name}`}
                            value={subj.code}
                            onChange={(e) =>
                              handleUpdateSubject(
                                subj.id,
                                'code',
                                e.target.value.toUpperCase()
                              )
                            }
                            className="font-mono text-xs text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 max-w-[90px] focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Course Type (Theory vs Practical Lab) */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleLab(subj.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          subj.isLab
                            ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                        }`}
                        title="Click to toggle between Theory Lecture and Practical Lab"
                      >
                        {subj.isLab ? (
                          <>
                            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                            <span>Lab (2h)</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Theory</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Teacher Name Input */}
                    <td className="py-3.5 px-4">
                      <div className="relative flex items-center">
                        <UserCheck className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          aria-label={`Teacher Name for ${subj.name}`}
                          value={subj.teacherName}
                          onChange={(e) =>
                            handleUpdateSubject(subj.id, 'teacherName', e.target.value)
                          }
                          placeholder="Type teacher name..."
                          className="w-full text-xs font-medium text-slate-800 bg-slate-50/80 hover:bg-slate-100 focus:bg-white pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                        />
                      </div>
                    </td>

                    {/* Periods per Week */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/90 rounded-xl p-1">
                        <button
                          type="button"
                          aria-label="Decrease periods"
                          onClick={() => handlePeriodsIncrement(subj.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-900">
                          {subj.periodsPerWeek}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase periods"
                          onClick={() => handlePeriodsIncrement(subj.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition"
                        >
                          +
                        </button>
                      </div>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        periods / wk
                      </span>
                    </td>

                    {/* Color Swatch / Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">
                        <span
                          className={`inline-block w-6 h-6 rounded-full border-2 border-white shadow-xs`}
                          style={{ backgroundColor: palette.hex }}
                          title={`Color: ${palette.color}`}
                        />
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        aria-label={`Delete ${subj.name}`}
                        onClick={() => handleDeleteSubject(subj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful Guidance Notice */}
      <div className="p-3.5 bg-slate-100/90 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p>
          Each subject has been preloaded with standard academic course codes and 4 weekly
          periods. You can freely rename any teacher, adjust weekly periods, or click{' '}
          <strong>Add Subject</strong> to introduce custom elective courses.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
        <button
          type="button"
          id="back-to-step-2-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Division</span>
        </button>

        <button
          type="button"
          id="proceed-to-classrooms-btn"
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold px-7 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <DoorClosed className="w-4 h-4" />
          <span>Proceed to Classrooms (Rooms 1–100)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
