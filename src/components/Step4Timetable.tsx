import React, { useState } from 'react';
import {
  AcademicYear,
  Department,
  Division,
  GeneratedTimetable,
  Subject,
  TimetableCell,
  TimetableSettings,
} from '../types';
import {
  DEFAULT_TIMETABLE_SETTINGS,
} from '../utils/timetableGenerator';
import { generateNewTimetableGrid } from '../utils/newTimetableGenerator';
import { useTimetables } from '../context/TimetableContext';
import { TimetableGrid } from './TimetableGrid';
import { EditCellModal } from './EditCellModal';
import { TeacherWorkloadModal } from './TeacherWorkloadModal';
import { GenerationReportCard } from './GenerationReportCard';
import { CrossDivisionMasterModal } from './CrossDivisionMasterModal';
import { TeacherAbsenceReplacementModal } from './TeacherAbsenceReplacementModal';
import {
  CalendarCheck,
  Sparkles,
  RefreshCw,
  Printer,
  Download,
  Filter,
  UserCheck,
  ArrowLeft,
  Settings2,
  Clock,
  CheckCircle2,
  Building,
  GraduationCap,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface Step4TimetableProps {
  department: Department;
  year: AcademicYear;
  division: Division;
  subjects: Subject[];
  timetable: GeneratedTimetable | null;
  onSetTimetable: (tt: GeneratedTimetable) => void;
  onBack: () => void;
}

export const Step4Timetable: React.FC<Step4TimetableProps> = ({
  department,
  year,
  division,
  subjects,
  timetable,
  onSetTimetable,
  onBack,
}) => {
  const { allTimetables, saveTimetable } = useTimetables();
  const [settings, setSettings] = useState<TimetableSettings>(
    timetable?.settings || DEFAULT_TIMETABLE_SETTINGS
  );
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);

  // Filters & Highlights
  const [highlightSubjectId, setHighlightSubjectId] = useState<string | null>(null);
  const [highlightTeacher, setHighlightTeacher] = useState<string | null>(null);

  // Modals
  const [editingCell, setEditingCell] = useState<TimetableCell | null>(null);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);

  // Timetable Generator Handler with cross-division clash checking
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateNewTimetableGrid(
        department,
        year,
        division,
        subjects,
        settings,
        allTimetables
      );
      onSetTimetable(generated);
      saveTimetable(generated);
      setIsGenerating(false);
    }, 450);
  };

  // Cell Editing
  const handleSaveEditedCell = (updatedCell: TimetableCell) => {
    if (!timetable) return;
    const { day, periodIndex } = updatedCell;
    const newGrid = { ...timetable.grid };
    newGrid[day] = [...newGrid[day]];
    newGrid[day][periodIndex] = updatedCell;

    const updatedTt: GeneratedTimetable = {
      ...timetable,
      grid: newGrid,
    };
    onSetTimetable(updatedTt);
    saveTimetable(updatedTt);
    setEditingCell(null);
  };

  const handleClearCell = () => {
    if (!editingCell || !timetable) return;
    const { day, periodIndex } = editingCell;
    const newGrid = { ...timetable.grid };
    newGrid[day] = [...newGrid[day]];
    newGrid[day][periodIndex] = {
      ...editingCell,
      subject: undefined,
    };

    const updatedTt: GeneratedTimetable = {
      ...timetable,
      grid: newGrid,
    };
    onSetTimetable(updatedTt);
    saveTimetable(updatedTt);
    setEditingCell(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!timetable) return;
    const headers = ['Day', ...timetable.timeSlots.map((s) => `${s.startTime}-${s.endTime}`)];
    const rows: string[][] = [
      [`Department: ${department.name}`, `Year: ${year}`, `Division: ${division.name}`],
      headers,
    ];

    timetable.settings.days.forEach((day) => {
      const row = [day];
      timetable.timeSlots.forEach((slot, idx) => {
        const cell = timetable.grid[day]?.[idx];
        if (slot.isBreak) {
          row.push(slot.breakTitle || 'BREAK');
        } else if (cell?.subject) {
          row.push(`${cell.subject.name} (${cell.subject.teacherName})`);
        } else {
          row.push('Free Slot');
        }
      });
      rows.push(row);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Timetable_${department.code}_Year${year}_Div${division.name}_2026.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header & Main Generator Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2 border border-purple-200/60">
            <span>Step 6 of 6</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              Year {year}
            </span>
            <span>•</span>
            <span>Automated Schedule Generation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Timetable Schedule Engine
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Department: <strong className="text-slate-800">{department.name}</strong> ({department.code}) •{' '}
            Year: <strong className="text-indigo-700">Year {year}</strong> •{' '}
            Division: <strong className="text-slate-800">{division.name}</strong> •{' '}
            Hall: <strong className="text-slate-800">{division.roomNumber || 'R301'}</strong>
          </p>
        </div>

        {/* Generate / Regenerate button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="open-master-inspector-btn"
            onClick={() => setShowMasterModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            title="Inspect global master timetable store and faculty cross-division schedule"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Master Divisions Store ({allTimetables.length})</span>
          </button>

          <button
            type="button"
            id="toggle-schedule-settings-btn"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showSettingsDrawer ? 'Hide Settings' : 'Schedule Options'}</span>
          </button>

          <button
            type="button"
            id="generate-timetable-main-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer disabled:opacity-75"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing Schedule...</span>
              </>
            ) : timetable ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Regenerate Timetable</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>Generate Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Drawer / Panel */}
      {showSettingsDrawer && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4 print:hidden animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>Timetable Constraints & Rules</span>
            </h4>
            <span className="text-xs text-slate-500">
              Changes apply on next generation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Working Days */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Working Days
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      includeSaturday: false,
                      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    })
                  }
                  className={`flex-1 py-2 px-3 rounded-lg border font-medium transition ${
                    !settings.includeSaturday
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  5 Days (Mon-Fri)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      includeSaturday: true,
                      days: [
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ],
                    })
                  }
                  className={`flex-1 py-2 px-3 rounded-lg border font-medium transition ${
                    settings.includeSaturday
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  6 Days (Mon-Sat)
                </button>
              </div>
            </div>

            {/* Periods Per Day */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Periods per Day
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-semibold">
                6 Periods / Day (60 mins each)
              </div>
            </div>

            {/* College Timing */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                College Timings (No Free Slots)
              </label>
              <div className="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg px-3 py-2 text-xs font-bold">
                09:30 AM – 05:00 PM (Full Schedule Busy)
              </div>
            </div>

            {/* Scheduled Breaks */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Scheduled Daily Breaks
              </label>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="font-semibold text-slate-800">💧 Morning Water Break:</span>
                  <span className="font-mono text-sky-700">11:30 – 11:45 AM (15m)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/80">
                  <span className="font-semibold text-amber-900">🍱 Fixed Lunch Break:</span>
                  <span className="font-mono text-amber-800">12:45 – 01:45 PM (60m)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="font-semibold text-slate-800">💧 Afternoon Water Break:</span>
                  <span className="font-mono text-sky-700">02:45 – 03:00 PM (15m)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If Timetable is NOT yet generated, show an informative card with Generate CTA */}
      {!timetable && (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-dashed border-indigo-200 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-900">
              Ready to Generate Schedule
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              We will generate a balanced, conflict-free timetable for{' '}
              <strong className="text-slate-800">{department.name}</strong>,{' '}
              <strong className="text-slate-800">Division {division.name}</strong> with{' '}
              {subjects.length} pre-configured subjects and assigned faculties.
            </p>
          </div>

          {/* Quick Summary Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
              🏢 {department.name}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
              👥 Division {division.name} ({division.roomNumber || 'Room 301'})
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
              📚 {subjects.length} Subjects
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
              ⏱️ {subjects.reduce((a, b) => a + (Number(b.periodsPerWeek) || 0), 0)} Total
              Weekly Hours
            </span>
          </div>

          <div>
            <button
              type="button"
              id="initial-generate-timetable-btn"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition hover:scale-102 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Timetable Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Generated Timetable View */}
      {timetable && (
        <div className="space-y-4">
          {/* Generation Report Card with Success, Warnings, Auto-Shifted Clashes & Lab info */}
          {timetable.generationReport && (
            <GenerationReportCard
              report={timetable.generationReport}
              divisionName={division.name}
            />
          )}

          {/* Action & Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs print:hidden">
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Highlight:
              </span>

              {/* Subject Filter */}
              <select
                value={highlightSubjectId || ''}
                onChange={(e) => setHighlightSubjectId(e.target.value || null)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>

              {/* Teacher Filter */}
              <select
                value={highlightTeacher || ''}
                onChange={(e) => setHighlightTeacher(e.target.value || null)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Teachers</option>
                {Array.from(new Set(subjects.map((s) => s.teacherName))).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {(highlightSubjectId || highlightTeacher) && (
                <button
                  type="button"
                  onClick={() => {
                    setHighlightSubjectId(null);
                    setHighlightTeacher(null);
                  }}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Clear Highlights
                </button>
              )}
            </div>

            {/* Action Tools: Workload, Print, Export */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                id="view-workload-btn"
                onClick={() => setShowWorkloadModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Teacher Workload</span>
              </button>

              <button
                type="button"
                id="teacher-absence-btn"
                onClick={() => setShowAbsenceModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Teacher Absence</span>
              </button>

              <button
                type="button"
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs"
                title="Download CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                type="button"
                id="print-timetable-btn"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs"
                title="Print Timetable"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Printable Header (Visible during Print / PDF) */}
          <div className="hidden print:block mb-4 p-4 border-b border-slate-300">
            <h1 className="text-xl font-bold text-slate-900">
              Department of {department.name}
            </h1>
            <p className="text-sm text-slate-600">
              Class Timetable • Year {year} • Division {division.name} • Room {division.roomNumber || 'R301'} • Academic Session 2026–2027
            </p>
          </div>

          {/* Timetable Grid View */}
          <TimetableGrid
            timetable={timetable}
            highlightSubjectId={highlightSubjectId}
            highlightTeacher={highlightTeacher}
            onCellClick={(cell) => setEditingCell(cell)}
          />

          {/* Legend / Color Palette indicator */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs print:hidden">
            <div className="flex items-center justify-between mb-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Subject Course Codes & Color Reference ({subjects.length})
              </h5>
              <span className="text-[11px] text-slate-400">
                Click any slot above to swap subject or adjust teacher
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  onClick={() =>
                    setHighlightSubjectId(
                      highlightSubjectId === s.id ? null : s.id
                    )
                  }
                  className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                    highlightSubjectId === s.id
                      ? 'bg-indigo-50 border-indigo-400 font-bold'
                      : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        s.color === 'indigo'
                          ? '#6366f1'
                          : s.color === 'emerald'
                          ? '#10b981'
                          : s.color === 'sky'
                          ? '#0ea5e9'
                          : s.color === 'rose'
                          ? '#f43f5e'
                          : s.color === 'amber'
                          ? '#f59e0b'
                          : s.color === 'purple'
                          ? '#a855f7'
                          : s.color === 'teal'
                          ? '#14b8a6'
                          : '#f97316',
                    }}
                  />
                  <div className="truncate">
                    <span className="font-mono font-bold text-[11px] mr-1">
                      {s.code}:
                    </span>
                    <span className="truncate">{s.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 print:hidden">
        <button
          type="button"
          id="back-to-step-5-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classrooms (1–100)</span>
        </button>

        {timetable && (
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Schedule generated for Division {division.name}</span>
          </div>
        )}
      </div>

      {/* Edit Cell Modal */}
      {editingCell && (
        <EditCellModal
          cell={editingCell}
          availableSubjects={subjects}
          onClose={() => setEditingCell(null)}
          onSave={handleSaveEditedCell}
          onClear={handleClearCell}
        />
      )}

      {/* Workload Modal */}
      {showWorkloadModal && timetable && (
        <TeacherWorkloadModal
          timetable={timetable}
          onClose={() => setShowWorkloadModal(false)}
          onSelectTeacherToHighlight={(teacher) => {
            setHighlightTeacher(teacher);
            setShowWorkloadModal(false);
          }}
          activeHighlightedTeacher={highlightTeacher}
        />
      )}

      {showAbsenceModal && timetable && (
        <TeacherAbsenceReplacementModal
          timetable={timetable}
          subjects={subjects}
          allTimetables={allTimetables}
          onClose={() => setShowAbsenceModal(false)}
          onApply={handleSaveEditedCell}
        />
      )}

      {/* Cross-Division Master Store & Clash Inspector Modal */}
      {showMasterModal && (
        <CrossDivisionMasterModal
          onClose={() => setShowMasterModal(false)}
          onSelectTimetableToView={(t) => onSetTimetable(t)}
          currentTimetableId={timetable?.id}
        />
      )}
    </div>
  );
};
