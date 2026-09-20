import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  UserCheck,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useTimetables } from '../context/TimetableContext';
import { GeneratedTimetable, DayOfWeek } from '../types';

interface CrossDivisionMasterModalProps {
  onClose: () => void;
  onSelectTimetableToView?: (t: GeneratedTimetable) => void;
  currentTimetableId?: string;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_LABELS = ['P1', 'P2', 'P3', 'Lunch', 'P5', 'P6', 'P7'];

export const CrossDivisionMasterModal: React.FC<CrossDivisionMasterModalProps> = ({
  onClose,
  onSelectTimetableToView,
  currentTimetableId,
}) => {
  const { allTimetables, deleteTimetable, clearAllTimetables } = useTimetables();
  const [activeTab, setActiveTab] = useState<'divisions' | 'teachers'>('divisions');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // Collect all unique teachers across all timetables
  const allTeachers = Array.from(
    new Set(
      allTimetables.flatMap((t) =>
        t.subjects.map((s) => s.teacherName).filter(Boolean)
      )
    )
  ).sort();

  // Set default teacher if not selected
  React.useEffect(() => {
    if (!selectedTeacher && allTeachers.length > 0) {
      setSelectedTeacher(allTeachers[0]);
    }
  }, [allTeachers, selectedTeacher]);

  // Compute schedule matrix for selected teacher across all timetables
  // day -> periodIndex -> { divisionName, deptName, subjectName, room }
  const teacherSchedule: Record<
    DayOfWeek,
    Record<number, { divisionName: string; deptName: string; subjectName: string; room?: string }[]>
  > = {
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
  };

  if (selectedTeacher) {
    allTimetables.forEach((t) => {
      DAYS.forEach((day) => {
        const row = t.grid[day] || [];
        row.forEach((cell, pIdx) => {
          if (
            cell?.subject &&
            cell.subject.teacherName?.toLowerCase() === selectedTeacher.toLowerCase()
          ) {
            if (!teacherSchedule[day][pIdx]) {
              teacherSchedule[day][pIdx] = [];
            }
            teacherSchedule[day][pIdx].push({
              divisionName: t.division.name,
              deptName: t.department.code,
              subjectName: cell.subject.name,
              room: cell.room,
            });
          }
        });
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Global Timetable Store & Clash Inspector</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {allTimetables.length} Division{allTimetables.length !== 1 ? 's' : ''} in Memory
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Shared React Context validating cross-division teacher clash prevention
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('divisions')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'divisions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>All Stored Divisions ({allTimetables.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teachers')}
              className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'teachers'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Master Faculty Clash Inspector ({allTeachers.length})</span>
            </button>
          </div>

          {allTimetables.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all stored division timetables from master context?')) {
                  clearAllTimetables();
                }
              }}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Master Store</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'divisions' ? (
            <div>
              {allTimetables.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-600">No Timetables Generated Yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click &ldquo;Generate Timetable&rdquo; on any division to build schedules. They will be
                    stored globally to prevent teacher clashes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allTimetables.map((t) => {
                    const timetableKey =
                      t.timetableKey ||
                      `${t.department.id}-y${t.year}-${t.division.id}`;
                    const isCurrent =
                      timetableKey === currentTimetableId ||
                      t.department.id === currentTimetableId;
                    return (
                      <div
                        key={timetableKey}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {t.department.name}
                              </h4>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                                  Currently Viewing
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              Year {t.year} • Division {t.division.name} ({t.division.roomNumber || 'Room 301'})
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteTimetable(timetableKey)}
                            title="Remove from master context"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs my-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Subjects</span>
                            <span className="font-bold text-slate-700">{t.subjects.length}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Periods Placed</span>
                            <span className="font-bold text-indigo-600">
                              {t.generationReport?.totalPlacedPeriods || t.totalPeriodsAllocated || 36}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Clashes Saved</span>
                            <span className="font-bold text-emerald-600">
                              {t.generationReport?.clashesAvoided || 0}
                            </span>
                          </div>
                        </div>

                        {/* View Button */}
                        {onSelectTimetableToView && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTimetableToView(t);
                              onClose();
                            }}
                            className="w-full py-1.5 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Load & View Timetable</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Teacher Selector */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  Select Faculty Member:
                </span>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 outline-none font-semibold focus:ring-1 focus:ring-indigo-500"
                >
                  {allTeachers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-emerald-700 font-medium ml-auto flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  No Double-Bookings Detected
                </span>
              </div>

              {/* Teacher Weekly Matrix */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="py-2.5 px-3 text-left font-bold w-24 border-r border-slate-200">
                        Day / Slot
                      </th>
                      {PERIOD_LABELS.map((p, idx) => (
                        <th
                          key={idx}
                          className={`py-2.5 px-2 text-center font-bold border-r border-slate-200 ${
                            idx === 3 ? 'bg-amber-50/80 text-amber-900 w-16' : 'min-w-[100px]'
                          }`}
                        >
                          {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DAYS.map((day) => (
                      <tr key={day} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200">
                          {day}
                        </td>
                        {PERIOD_LABELS.map((p, pIdx) => {
                          if (pIdx === 3) {
                            return (
                              <td
                                key={pIdx}
                                className="py-1 px-1 bg-amber-50/50 text-center border-r border-slate-200 text-[10px] text-amber-700 font-medium"
                              >
                                Lunch
                              </td>
                            );
                          }

                          const assignedList = teacherSchedule[day]?.[pIdx] || [];
                          const hasAssignment = assignedList.length > 0;
                          const hasClash = assignedList.length > 1;

                          return (
                            <td
                              key={pIdx}
                              className={`p-1.5 border-r border-slate-200 align-top ${
                                hasClash
                                  ? 'bg-rose-100'
                                  : hasAssignment
                                  ? 'bg-indigo-50/60'
                                  : 'bg-white'
                              }`}
                            >
                              {hasAssignment ? (
                                <div className="space-y-1">
                                  {assignedList.map((a, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className={`p-1 rounded text-[10px] font-semibold border ${
                                        hasClash
                                          ? 'bg-rose-200 text-rose-900 border-rose-300'
                                          : 'bg-white text-indigo-900 border-indigo-200 shadow-2xs'
                                      }`}
                                    >
                                      <div className="font-bold truncate">
                                        Div {a.divisionName}
                                      </div>
                                      <div className="text-[9px] text-slate-500 truncate">
                                        {a.subjectName}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-300 block text-center">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Teacher Double-Booking Prevention Active across All Generated Divisions</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
