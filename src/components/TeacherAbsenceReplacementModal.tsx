import React, { useMemo, useState } from 'react';
import { DayOfWeek, GeneratedTimetable, Subject, TimetableCell } from '../types';

interface TeacherAbsenceReplacementModalProps {
  timetable: GeneratedTimetable;
  subjects: Subject[];
  allTimetables: GeneratedTimetable[];
  onClose: () => void;
  onApply: (cell: TimetableCell) => void;
}

const teachingSlots = [0, 1, 3, 4, 6, 7];
const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TeacherAbsenceReplacementModal: React.FC<TeacherAbsenceReplacementModalProps> = ({
  timetable,
  subjects,
  allTimetables,
  onClose,
  onApply,
}) => {
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [slot, setSlot] = useState(0);
  const [absentTeacher, setAbsentTeacher] = useState('');
  const [replacement, setReplacement] = useState('');
  const [maxWeeklyPeriods, setMaxWeeklyPeriods] = useState('');

  const assignedPeriods = (teacher: string) => allTimetables.reduce((total, other) =>
    total + Object.values(other.grid).reduce((dayTotal, cells) => dayTotal + cells.reduce((slotTotal, item) => {
      if (!item || item.isBreak) return slotTotal;
      const activities = item.activities || (item.subject ? [{ teacher: item.subject.teacherName }] : []);
      return slotTotal + activities.filter((activity) => activity.teacher === teacher).length;
    }, 0), 0), 0);

  const cell = timetable.grid[day]?.[slot] || null;
  const currentTeachers = useMemo(() => {
    if (!cell) return [];
    const activityTeachers = (cell.activities || []).map((activity) => activity.teacher);
    const subjectTeacher = cell.subject?.teacherName ? [cell.subject.teacherName] : [];
    return Array.from(new Set([...activityTeachers, ...subjectTeacher].filter((teacher) => teacher && teacher !== 'TBD')));
  }, [cell]);

  const teacherCandidates = useMemo(() => {
    const workloadLimit = Number(maxWeeklyPeriods);
    if (!Number.isFinite(workloadLimit) || workloadLimit <= 0) return [];
    const knownTeachers = subjects.map((subject) => subject.teacherName).filter((teacher) => teacher && teacher !== 'TBD');
    return Array.from(new Set(knownTeachers)).filter((teacher) => {
      if (teacher === absentTeacher) return false;
      const occupiedElsewhere = allTimetables.some((other) => {
        if ((other.timetableKey || '') === (timetable.timetableKey || '')) return false;
        const otherCell = other.grid[day]?.[slot];
        return Boolean(otherCell?.subject?.teacherName === teacher || otherCell?.activities?.some((activity) => activity.teacher === teacher));
      });
      const occupiedHere = currentTeachers.includes(teacher);
      return !occupiedElsewhere && !occupiedHere && assignedPeriods(teacher) < workloadLimit;
    });
  }, [allTimetables, absentTeacher, currentTeachers, day, maxWeeklyPeriods, slot, subjects, timetable.timetableKey]);

  const applyReplacement = () => {
    if (!cell || !absentTeacher || !replacement) return;
    const updated: TimetableCell = {
      ...cell,
      subject: cell.subject && cell.subject.teacherName === absentTeacher
        ? { ...cell.subject, teacherName: replacement }
        : cell.subject,
      activities: cell.activities?.map((activity) => activity.teacher === absentTeacher
        ? { ...activity, teacher: replacement, subject: { ...activity.subject, teacherName: replacement } }
        : activity),
    };
    onApply(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Teacher Absence / Replacement</h3>
            <p className="text-xs text-slate-500 mt-1">Uses only existing in-memory teacher and timetable data. Qualification and workload limits are not available in the current model.</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-900">Close</button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="font-semibold text-slate-700">Day
            <select value={day} onChange={(event) => setDay(event.target.value as DayOfWeek)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-normal">
              {days.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="font-semibold text-slate-700">Teaching period
            <select value={slot} onChange={(event) => setSlot(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-normal">
              {teachingSlots.map((item) => <option key={item} value={item}>Period {timetable.timeSlots[item]?.periodNumber}</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
          <div className="font-bold text-slate-800">Selected slot</div>
          <div className="text-slate-600 mt-1">{timetable.timeSlots[slot]?.startTime} - {timetable.timeSlots[slot]?.endTime}</div>
          <div className="text-slate-600 mt-1">{cell?.subject?.name || cell?.activities?.map((activity) => activity.subject.name).join(', ') || 'No scheduled activity'}</div>
        </div>

        <label className="block text-xs font-semibold text-slate-700">Absent teacher
          <select value={absentTeacher} onChange={(event) => { setAbsentTeacher(event.target.value); setReplacement(''); }} className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-normal">
            <option value="">Select teacher</option>
            {currentTeachers.map((teacher) => <option key={teacher}>{teacher}</option>)}
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-700">Available replacement
          <select value={replacement} onChange={(event) => setReplacement(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-normal" disabled={!absentTeacher}>
            <option value="">Select replacement</option>
            {teacherCandidates.map((teacher) => <option key={teacher}>{teacher}</option>)}
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-700">Temporary maximum weekly periods for replacement teachers
          <input
            type="number"
            min="1"
            max="60"
            value={maxWeeklyPeriods}
            onChange={(event) => { setMaxWeeklyPeriods(event.target.value); setReplacement(''); }}
            className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-normal"
            placeholder="Required to check workload"
          />
        </label>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button>
          <button type="button" onClick={applyReplacement} disabled={!cell || !absentTeacher || !replacement} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Apply replacement</button>
        </div>
      </div>
    </div>
  );
};
