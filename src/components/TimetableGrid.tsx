import React from 'react';
import {
  DayOfWeek,
  GeneratedTimetable,
  TimetableCell,
} from '../types';
import {
  Clock,
  FlaskConical,
  BookOpen,
} from 'lucide-react';
import { normalizeCellActivities } from '../utils/timetableActivities';

interface TimetableGridProps {
  timetable: GeneratedTimetable;
  highlightSubjectId: string | null;
  highlightTeacher: string | null;
  onCellClick: (cell: TimetableCell) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  timetable,
  highlightSubjectId,
  highlightTeacher,
  onCellClick,
}) => {
  const { grid, timeSlots, settings } = timetable;
  const days = settings.days;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Scrollable Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[1100px]">
          {/* Table Header with Periods and Timings */}
          <thead>
            <tr className="bg-slate-100/95 border-b border-slate-200 text-slate-700">
              <th className="py-4 px-4 w-36 font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 sticky left-0 z-20 border-r border-slate-200 shadow-2xs">
                Day / Time
              </th>
              {timeSlots.map((slot, sIdx) => {
                if (slot.isBreak) {
                  return (
                    <th
                      key={`header-break-${sIdx}`}
                      className="py-2 px-1 text-center min-w-[95px] border-r font-semibold text-xs bg-slate-50/90 border-slate-200 text-slate-950"
                    >
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold mb-0.5 bg-slate-200/80 text-slate-900">
                          Break
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span>Break</span>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-slate-700">
                          {slot.startTime}
                        </span>
                        <span className="text-[9px] uppercase tracking-tight font-semibold text-slate-600">
                          to {slot.endTime}
                        </span>
                      </div>
                    </th>
                  );
                }

                return (
                  <th
                    key={`header-slot-${sIdx}`}
                    className="py-2 px-2 text-center min-w-[135px] border-r border-slate-200 font-semibold text-xs text-slate-800"
                  >
                    <div className="flex flex-col items-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-extrabold text-xs mb-1">
                        Period {slot.periodNumber}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 font-semibold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        {slot.startTime}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        to {slot.endTime} (60m)
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Days */}
          <tbody className="divide-y divide-slate-200 text-sm">
            {days.map((day) => {
              const rowCells = grid[day] || [];

              return (
                <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                  {/* Day Label sticky column */}
                  <td className="py-2 px-3 font-bold text-slate-900 bg-slate-50/90 sticky left-0 z-10 border-r border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{day}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {timetable.division.name ? `Div ${timetable.division.name}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Period Cells */}
                  {timeSlots.map((slot, sIdx) => {
                    const cell = rowCells[sIdx];

                    const nextCell = rowCells[sIdx + 1];
                    const isMergedLabStart = Boolean(
                      cell?.isLabSession &&
                      cell.labBlockPart === 1 &&
                      nextCell?.isLabSession &&
                      nextCell.labBlockPart === 2 &&
                      nextCell.periodIndex === sIdx + 1 &&
                      nextCell.subject?.id === cell.subject?.id &&
                      nextCell.room === cell.room
                    );
                    const isMergedLabContinuation = Boolean(
                      cell?.isLabSession &&
                      cell.labBlockPart === 2 &&
                      rowCells[sIdx - 1]?.isLabSession &&
                      rowCells[sIdx - 1]?.labBlockPart === 1 &&
                      rowCells[sIdx - 1]?.subject?.id === cell.subject?.id &&
                      rowCells[sIdx - 1]?.room === cell.room
                    );

                    if (isMergedLabContinuation) return null;

                    // Break Cell
                    if (slot.isBreak) {
                      return (
                        <td
                          key={`${day}-break-${sIdx}`}
                          className="py-2 px-1 text-center border-r select-none bg-slate-50/60 border-slate-200/60"
                        >
                          <div className="h-full min-h-[75px] flex flex-col items-center justify-center p-1.5 text-slate-900">
                            <Clock className="w-4 h-4 text-slate-500 mb-1 opacity-90" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900">
                              Break
                            </span>
                            <span className="text-[9px] font-semibold mt-0.5 text-slate-700">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    // Regular teaching slot
                    const activities = cell ? normalizeCellActivities(cell) : [];
                    const subject = activities[0]?.subject;
                    const isMatchedSubject =
                      highlightSubjectId && activities.some((activity) =>
                        activity.subject.id === highlightSubjectId
                      );
                    const isMatchedTeacher =
                      highlightTeacher &&
                      activities.some((activity) =>
                        activity.teacher.toLowerCase() === highlightTeacher.toLowerCase()
                      );
                    const isDimmed =
                      (highlightSubjectId && !isMatchedSubject) ||
                      (highlightTeacher && !isMatchedTeacher);

                    const isLab = cell?.isLabSession || activities.some((activity) => activity.isLab);

                    return (
                      <td
                        key={`${day}-slot-${sIdx}`}
                        colSpan={isMergedLabStart ? 2 : undefined}
                        className={`p-1 border-r border-slate-200/80 align-top transition-all ${
                          isDimmed ? 'opacity-30' : 'opacity-100'
                        }`}
                      >
                        {activities.length > 0 ? (
                          <div
                            id={`cell-${day}-${sIdx}`}
                            onClick={() => cell && onCellClick(cell)}
                            className={`group relative p-2 rounded-xl border transition-all cursor-pointer h-full min-h-[75px] flex flex-col justify-between ${
                              isLab
                                ? 'bg-gradient-to-br from-purple-50 to-indigo-50/50 border-purple-300 border-l-4 border-l-purple-600 shadow-2xs'
                                : subject.bgLight || 'bg-indigo-50'
                            } ${!isLab ? subject.borderClass || 'border-indigo-200 border-l-4 border-l-indigo-500' : ''} ${
                              isMatchedSubject || isMatchedTeacher
                                ? 'ring-2 ring-indigo-600 shadow-md scale-102'
                                : 'hover:shadow-md hover:scale-101'
                            }`}
                            title={`Click to view/edit slot • ${activities.map((activity) => activity.subject.name).join(', ')}`}
                          >
                            <div>
                              {/* Activity count and lab indicator */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200/70 shadow-2xs">
                                  {activities.length === 1
                                    ? subject?.code
                                    : `${activities.length} Activities`}
                                </span>
                                <div className="flex items-center gap-1">
                                  {isLab ? (
                                    <span
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-200/80 text-purple-950 border border-purple-300 flex items-center gap-1"
                                      title="2-Hour Continuous Practical Lab Block"
                                    >
                                      <FlaskConical className="w-2.5 h-2.5 text-purple-700" />
                                      <span>2 Hours</span>
                                    </span>
                                  ) : (
                                    <span
                                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-900 border border-blue-200/60 flex items-center gap-0.5"
                                    >
                                      <BookOpen className="w-2.5 h-2.5 text-blue-600" />
                                      <span>Lecture</span>
                                    </span>
                                  )}

                                </div>
                              </div>

                              <div className="mt-2 space-y-1.5 border-t border-slate-200/60 pt-1.5">
                                {activities.map((activity) => (
                                  <div
                                    key={`${activity.studentGroup}-${activity.subject.id}-${activity.room}`}
                                    className="space-y-0.5 text-[10px] text-slate-700"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold truncate">
                                        {activity.subject.name} ({activity.subject.code})
                                      </span>
                                      <span className="font-semibold shrink-0">
                                        {activity.room || 'Room TBD'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 text-[9px]">
                                      <span className="font-bold shrink-0">
                                        {activity.studentGroup}
                                      </span>
                                      <span className="truncate">
                                        {activity.activityMode || activity.activityType} • {activity.teacher || 'Teacher TBD'}
                                      </span>
                                      {activity.isLab && (
                                        <span className="font-semibold shrink-0">
                                          {activity.durationPeriods} periods
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-end text-[11px]">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-600 font-bold shrink-0">
                                ✎
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => cell && onCellClick(cell)}
                            className="h-full min-h-[75px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer p-2 transition"
                          >
                            <span className="text-[11px] font-medium text-slate-400">
                              Free Slot
                            </span>
                            <span className="text-[10px] text-indigo-500 mt-1">
                              + Assign
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
