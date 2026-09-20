import React from 'react';
import { GeneratedTimetable } from '../types';
import { X, UserCheck, Clock, Calendar, CheckCircle } from 'lucide-react';

interface TeacherWorkloadModalProps {
  timetable: GeneratedTimetable;
  onClose: () => void;
  onSelectTeacherToHighlight: (teacherName: string | null) => void;
  activeHighlightedTeacher: string | null;
}

export const TeacherWorkloadModal: React.FC<TeacherWorkloadModalProps> = ({
  timetable,
  onClose,
  onSelectTeacherToHighlight,
  activeHighlightedTeacher,
}) => {
  const { grid, settings } = timetable;
  const days = settings.days;

  // Aggregate teacher stats
  const teacherStatsMap: Record<
    string,
    {
      teacherName: string;
      totalPeriods: number;
      subjects: Set<string>;
      daysActive: Set<string>;
    }
  > = {};

  days.forEach((day) => {
    (grid[day] || []).forEach((cell) => {
      if (cell?.subject && !cell.isBreak) {
        const tName = cell.subject.teacherName || 'Unassigned';
        if (!teacherStatsMap[tName]) {
          teacherStatsMap[tName] = {
            teacherName: tName,
            totalPeriods: 0,
            subjects: new Set(),
            daysActive: new Set(),
          };
        }
        teacherStatsMap[tName].totalPeriods += 1;
        teacherStatsMap[tName].subjects.add(cell.subject.name);
        teacherStatsMap[tName].daysActive.add(day);
      }
    });
  });

  const teacherList = Object.values(teacherStatsMap).sort(
    (a, b) => b.totalPeriods - a.totalPeriods
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Faculty & Teacher Workload Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly contact hours, active teaching days, and assigned courses
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Teachers */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {teacherList.map((stat) => {
            const isHighlighted = activeHighlightedTeacher === stat.teacherName;

            return (
              <div
                key={stat.teacherName}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isHighlighted
                    ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {stat.teacherName}
                    </h4>
                    {isHighlighted && (
                      <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Highlighted
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{stat.totalPeriods}</strong> hours/week (
                      {stat.totalPeriods * 60} mins)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{stat.daysActive.size}</strong> teaching days
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {Array.from(stat.subjects).map((subjName) => (
                      <span
                        key={subjName}
                        className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        {subjName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTeacherToHighlight(
                        isHighlighted ? null : stat.teacherName
                      );
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                      isHighlighted
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isHighlighted ? 'Clear Highlight' : 'Highlight on Grid'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
