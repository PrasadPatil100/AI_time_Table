import React, { useEffect, useMemo, useState } from 'react';
import { AcademicYear, Department, Division, Subject } from '../types';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  DoorClosed,
  FlaskConical,
  GraduationCap,
  Info,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';

interface Step5ClassroomsProps {
  department: Department;
  year: AcademicYear;
  division: Division;
  subjects: Subject[];
  onChangeSubjects: (subjects: Subject[]) => void;
  onBack: () => void;
  onNext: () => void;
}

type AllocationKind = 'theory' | 'lab';

const isLabSubject = (subject: Subject) => subject.isLab || subject.roomType === 'lab';
const defaultTheoryRooms = [1, 2, 3, 4, 5, 6, 7];
const defaultLabRooms = [1, 2, 3, 4, 5];

const activityLabel = (subject: Subject) => subject.activityType || (isLabSubject(subject) ? 'Lab' : 'Theory');

const groupLabel = (subject: Subject) => {
  if (subject.studentGroup && subject.studentGroup !== 'Whole Division') return subject.studentGroup;
  if (subject.activityMode === 'PARALLEL_BATCH' || subject.activityMode === 'ROTATIONAL_BATCH') return 'Batch activity';
  return 'Whole division';
};

export const Step5Classrooms: React.FC<Step5ClassroomsProps> = ({
  department,
  year,
  division,
  subjects,
  onChangeSubjects,
  onBack,
  onNext,
}) => {
  const [activeKind, setActiveKind] = useState<AllocationKind>('theory');

  useEffect(() => {
    let theoryIndex = 0;
    let labIndex = 0;
    let changed = false;
    const initializedSubjects = subjects.map((subject) => {
      if (subject.classroomNumber) return subject;
      changed = true;
      const lab = isLabSubject(subject);
      const roomPool = lab ? defaultLabRooms : defaultTheoryRooms;
      const roomIndex = lab ? labIndex++ : theoryIndex++;
      return {
        ...subject,
        classroomNumber: roomPool[roomIndex % roomPool.length],
        roomType: lab ? 'lab' : subject.roomType || 'lecture',
      };
    });
    if (changed) onChangeSubjects(initializedSubjects);
  }, [onChangeSubjects, subjects]);

  const theorySubjects = subjects.filter((subject) => !isLabSubject(subject));
  const labSubjects = subjects.filter(isLabSubject);
  const visibleSubjects = activeKind === 'lab' ? labSubjects : theorySubjects;

  const roomConflicts = useMemo(() => {
    const conflicts: { kind: AllocationKind; room: number; subjects: Subject[] }[] = [];
    (['theory', 'lab'] as AllocationKind[]).forEach((kind) => {
      const byRoom = new Map<number, Subject[]>();
      subjects
        .filter((subject) => (kind === 'lab' ? isLabSubject(subject) : !isLabSubject(subject)))
        .forEach((subject) => {
          if (!subject.classroomNumber) return;
          const occupants = byRoom.get(subject.classroomNumber) || [];
          byRoom.set(subject.classroomNumber, [...occupants, subject]);
        });
      byRoom.forEach((occupants, room) => {
        if (occupants.length > 1) conflicts.push({ kind, room, subjects: occupants });
      });
    });
    return conflicts;
  }, [subjects]);

  const missingTheory = theorySubjects.filter((subject) => !subject.classroomNumber);
  const missingLabs = labSubjects.filter((subject) => !subject.classroomNumber);
  const assignedCount = subjects.length - missingTheory.length - missingLabs.length;

  const updateRoom = (subjectId: string, value: number | string) => {
    const rawValue = String(value).trim();
    const room = rawValue === '' ? undefined : Number(rawValue);
    if (room !== undefined && (!Number.isInteger(room) || room < 1 || room > 100)) return;
    onChangeSubjects(subjects.map((subject) => subject.id === subjectId ? { ...subject, classroomNumber: room } : subject));
  };

  const updateRoomType = (subjectId: string, kind: AllocationKind) => {
    onChangeSubjects(subjects.map((subject) => subject.id === subjectId
      ? { ...subject, isLab: kind === 'lab', roomType: kind === 'lab' ? 'lab' : 'lecture' }
      : subject));
  };

  const autoAssign = () => {
    let nextTheoryRoom = 1;
    let nextLabRoom = 1;
    const usedTheory = new Set<number>();
    const usedLabs = new Set<number>();
    const nextRoom = (used: Set<number>, start: number) => {
      let room = start;
      while (used.has(room) && room <= 100) room += 1;
      if (room > 100) return undefined;
      used.add(room);
      return room;
    };

    onChangeSubjects(subjects.map((subject) => {
      const lab = isLabSubject(subject);
      const room = lab ? nextRoom(usedLabs, nextLabRoom) : nextRoom(usedTheory, nextTheoryRoom);
      if (lab && room !== undefined) nextLabRoom = room + 1;
      if (!lab && room !== undefined) nextTheoryRoom = room + 1;
      return { ...subject, classroomNumber: room, isLab: lab, roomType: lab ? 'lab' : 'lecture' };
    }));
  };

  const handleNext = () => {
    if (missingTheory.length || missingLabs.length) {
      setActiveKind(missingLabs.length ? 'lab' : 'theory');
      return;
    }
    onNext();
  };

  const renderSubject = (subject: Subject) => {
    const lab = isLabSubject(subject);
    const room = subject.classroomNumber;
    const conflict = roomConflicts.find((item) => item.kind === (lab ? 'lab' : 'theory') && item.room === room);

    return (
      <article key={subject.id} className={`rounded-2xl border bg-white p-4 shadow-xs ${lab ? 'border-emerald-200/80' : 'border-slate-200/80'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${lab ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
              {lab ? <FlaskConical className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">{subject.code}</span>
                <h3 className="text-base font-bold text-slate-900">{subject.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${lab ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>{lab ? 'LAB REQUIRED' : 'THEORY'}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>Activity: <strong className="text-slate-800">{activityLabel(subject)}</strong></span>
                <span>Group: <strong className="text-slate-800">{groupLabel(subject)}</strong></span>
                <span>Teacher: <strong className="text-slate-800">{subject.teacherName}</strong></span>
                <span>{subject.periodsPerWeek} periods/week</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500">
              <span className="border-r border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-600">{lab ? 'Lab #' : 'Room #'}</span>
              <button type="button" onClick={() => updateRoom(subject.id, Math.max(1, (room || 1) - 1))} disabled={!room || room <= 1} className="p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" title="Previous room number"><Minus className="h-3.5 w-3.5" /></button>
              <input type="number" min={1} max={100} value={room ?? ''} onChange={(event) => updateRoom(subject.id, event.target.value)} placeholder="-" aria-label={`${lab ? 'Lab' : 'Classroom'} number for ${subject.name}`} className="w-14 py-2 text-center text-sm font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <button type="button" onClick={() => updateRoom(subject.id, Math.min(100, (room || 0) + 1))} disabled={room === 100} className="p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" title="Next room number"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <select value={lab ? 'lab' : 'theory'} onChange={(event) => updateRoomType(subject.id, event.target.value as AllocationKind)} aria-label={`Activity room type for ${subject.name}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              <option value="theory">Theory classroom</option>
              <option value="lab">Laboratory</option>
            </select>
          </div>
        </div>
        {!room && <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />{lab ? 'A lab classroom number is required.' : 'A classroom number is required.'}</p>}
        {conflict && <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />{lab ? 'Lab' : 'Room'} {room} is also assigned to {conflict.subjects.filter((other) => other.id !== subject.id).map((other) => other.code).join(', ')}. This may conflict if scheduled at the same time.</p>}
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-2">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><span>Step 5 of 6</span><span>•</span><GraduationCap className="h-3.5 w-3.5" /><span>Year {year}</span><span>•</span><DoorClosed className="h-3.5 w-3.5" /><span>{department.code} / Division {division.name}</span></div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Classroom Configuration</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Assign a classroom to every theory activity and a laboratory number to every lab activity. Room numbers can be reused when the timetable places activities at different times.</p>
        </div>
        <button type="button" onClick={autoAssign} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-xs transition hover:bg-indigo-100"><Sparkles className="h-3.5 w-3.5" /> Auto-assign rooms</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs"><div className="text-xs text-slate-500">Theory activities</div><div className="text-lg font-bold text-indigo-700">{theorySubjects.length}</div></div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs"><div className="text-xs text-slate-500">Laboratories</div><div className="text-lg font-bold text-emerald-700">{labSubjects.length}</div></div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs"><div className="text-xs text-slate-500">Assigned</div><div className="text-lg font-bold text-slate-900">{assignedCount}/{subjects.length}</div></div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs"><div className="text-xs text-slate-500">Warnings</div><div className={`text-lg font-bold ${missingTheory.length || missingLabs.length || roomConflicts.length ? 'text-amber-700' : 'text-emerald-700'}`}>{missingTheory.length + missingLabs.length + roomConflicts.length}</div></div>
      </div>

      {(missingTheory.length || missingLabs.length) > 0 && <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50 p-3.5 text-xs text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><div><strong>Assignments needed before continuing.</strong> Every subject must have a room number. Lab subjects require a lab assignment.</div></div>}
      {roomConflicts.length > 0 && <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50 p-3.5 text-xs text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><div><strong>Potential room conflicts:</strong> {roomConflicts.map((item) => `${item.kind === 'lab' ? 'Lab' : 'Room'} ${item.room}`).join(', ')} are assigned more than once. This is allowed for activities at different times.</div></div>}

      <div className="flex gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100 p-1">
        <button type="button" onClick={() => setActiveKind('theory')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${activeKind === 'theory' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}><BookOpen className="h-4 w-4" /> Theory / Classrooms ({theorySubjects.length})</button>
        <button type="button" onClick={() => setActiveKind('lab')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${activeKind === 'lab' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}><FlaskConical className="h-4 w-4" /> Laboratories ({labSubjects.length})</button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{activeKind === 'lab' ? 'Laboratories' : 'Theory / Classrooms'}</h3><span className="text-xs text-slate-500">Numbers 1-100</span></div>
        {visibleSubjects.length ? visibleSubjects.map(renderSubject) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No {activeKind === 'lab' ? 'laboratory' : 'theory'} subjects configured.</div>}
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 text-xs text-slate-600"><Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /><p>Subject name, code, activity type, batch or division group, teacher, and the preserved classroom assignment are shown together. Auto-assign uses distinct numbers within theory and laboratory rooms and does not alter workload or activity metadata.</p></div>

      <div className="flex items-center justify-between border-t border-slate-200/80 pt-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-xs transition hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /> Back to Subjects</button>
        <button type="button" onClick={handleNext} disabled={Boolean(missingTheory.length || missingLabs.length)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition enabled:hover:from-indigo-700 enabled:hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><span>Ready to Generate Timetable</span>{missingTheory.length || missingLabs.length ? <AlertTriangle className="h-4 w-4" /> : <><CheckCircle2 className="h-4 w-4" /><ArrowRight className="h-4 w-4" /></>}</button>
      </div>
    </div>
  );
};
