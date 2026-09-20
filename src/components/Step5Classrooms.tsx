import React, { useState } from 'react';
import { AcademicYear, Department, Division, Subject } from '../types';
import {
  DoorClosed,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  Hash,
  Info,
  Check,
  Building,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Minus,
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

export const Step5Classrooms: React.FC<Step5ClassroomsProps> = ({
  department,
  year,
  division,
  subjects,
  onChangeSubjects,
  onBack,
  onNext,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'lecture' | 'lab'>('all');
  const [activePickerSubjectId, setActivePickerSubjectId] = useState<string | null>(null);
  const [pickerFloor, setPickerFloor] = useState<number>(1); // 1: 1-25, 2: 26-50, 3: 51-75, 4: 76-100

  // Update room number for a subject (enforcing 1 to 100)
  const handleRoomNumberChange = (subjectId: string, rawVal: number | string) => {
    let num = typeof rawVal === 'string' ? parseInt(rawVal, 10) : rawVal;
    if (isNaN(num)) num = 1;
    if (num < 1) num = 1;
    if (num > 100) num = 100;

    const updated = subjects.map((subj) => {
      if (subj.id === subjectId) {
        return {
          ...subj,
          classroomNumber: num,
        };
      }
      return subj;
    });
    onChangeSubjects(updated);
  };

  // Toggle or change room type (lecture vs lab)
  const handleRoomTypeChange = (subjectId: string, roomType: 'lecture' | 'lab') => {
    const updated = subjects.map((subj) => {
      if (subj.id === subjectId) {
        return {
          ...subj,
          roomType,
          isLab: roomType === 'lab',
        };
      }
      return subj;
    });
    onChangeSubjects(updated);
  };

  // Auto-assign unique non-conflicting rooms 1 to 100
  const handleAutoAssignUniqueRooms = () => {
    let nextLectureRoom = 10;
    let nextLabRoom = 1;

    const updated = subjects.map((subj, idx) => {
      const isLab = subj.isLab || subj.roomType === 'lab';
      let roomNum: number;
      if (isLab) {
        roomNum = (nextLabRoom <= 100) ? nextLabRoom : ((idx * 3 + 1) % 100 || 1);
        nextLabRoom += 2;
      } else {
        roomNum = (nextLectureRoom <= 100) ? nextLectureRoom : ((idx * 4 + 10) % 100 || 1);
        nextLectureRoom += 3;
      }
      return {
        ...subj,
        classroomNumber: roomNum,
        roomType: (isLab ? 'lab' : 'lecture') as 'lab' | 'lecture',
      };
    });

    onChangeSubjects(updated);
  };

  // Check for duplicates/shared rooms
  const roomUsageMap: Record<number, Subject[]> = {};
  subjects.forEach((s) => {
    const r = s.classroomNumber || 1;
    if (!roomUsageMap[r]) roomUsageMap[r] = [];
    roomUsageMap[r].push(s);
  });

  const duplicateRooms = Object.entries(roomUsageMap)
    .filter(([_, list]) => list.length > 1)
    .map(([room, list]) => ({ room: Number(room), list }));

  const totalAssigned = subjects.filter(
    (s) => s.classroomNumber && s.classroomNumber >= 1 && s.classroomNumber <= 100
  ).length;
  const lectureCount = subjects.filter((s) => !s.isLab && s.roomType !== 'lab').length;
  const labCount = subjects.filter((s) => s.isLab || s.roomType === 'lab').length;

  const filteredSubjects = subjects.filter((s) => {
    const isLab = s.isLab || s.roomType === 'lab';
    if (filterType === 'lecture') return !isLab;
    if (filterType === 'lab') return isLab;
    return true;
  });

  // Active subject for modal picker
  const activeSubject = subjects.find((s) => s.id === activePickerSubjectId);

  // Helper floor ranges
  const floorRanges = [
    { floor: 1, label: 'Floor 1 (Rooms 1–25)', start: 1, end: 25 },
    { floor: 2, label: 'Floor 2 (Rooms 26–50)', start: 26, end: 50 },
    { floor: 3, label: 'Floor 3 (Rooms 51–75)', start: 51, end: 75 },
    { floor: 4, label: 'Floor 4 & Labs (Rooms 76–100)', start: 76, end: 100 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200/60">
            <span>Step 5 of 6</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              Year {year}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <DoorClosed className="w-3.5 h-3.5" />
              Classrooms 1–100
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Classroom & Lab Allocation
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Assign designated classrooms for each lecture as well as lab hall for{' '}
            <strong className="text-slate-800">{department.name}</strong> •{' '}
            <strong className="text-indigo-700">Year {year}</strong> •{' '}
            <strong className="text-slate-800">Division {division.name}</strong>.
            Classroom numbering starts from <strong className="text-blue-700">1 to 100</strong>.
          </p>
        </div>

        {/* Auto-assign & Reset actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleAutoAssignUniqueRooms}
            id="auto-assign-rooms-btn"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Automatically assign unique distinct room numbers 1 to 100"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart Auto-Assign (1–100)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Classroom Range</div>
            <div className="text-base font-bold text-slate-900">1 to 100</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Lecture Classes</div>
            <div className="text-base font-bold text-slate-900">{lectureCount} Lectures</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Lab Sessions</div>
            <div className="text-base font-bold text-slate-900">{labCount} Labs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Allocation Status</div>
            <div className="text-base font-bold text-emerald-700">
              {totalAssigned}/{subjects.length} Ready
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Room Alert if applicable */}
      {duplicateRooms.length > 0 && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-amber-950">
              Shared Classroom Notice (Rooms 1–100)
            </div>
            <p className="mt-0.5 text-amber-800">
              {duplicateRooms.map((d) => `Room ${d.room} is shared by ${d.list.map((s) => s.name).join(' & ')}`).join('; ')}.
              Classes scheduled at different times can share rooms, or you can click{' '}
              <button
                type="button"
                onClick={handleAutoAssignUniqueRooms}
                className="underline font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
              >
                Smart Auto-Assign (1–100)
              </button>{' '}
              to assign unique rooms for every course.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Courses ({subjects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('lecture')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 ${
              filterType === 'lecture'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Lectures ({lectureCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('lab')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 ${
              filterType === 'lab'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Labs ({labCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Numbering: <span className="font-bold text-slate-800">1 to 100</span> (Ground to 4th Floor & Wing Labs)
        </div>
      </div>

      {/* Classroom Allocation Cards List */}
      <div className="space-y-3">
        {filteredSubjects.map((subj, index) => {
          const isLab = subj.isLab || subj.roomType === 'lab';
          const roomNum = subj.classroomNumber || 1;
          const otherInSameRoom = roomUsageMap[roomNum]?.filter((s) => s.id !== subj.id) || [];

          return (
            <div
              key={subj.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${
                isLab
                  ? 'border-emerald-200/80 hover:border-emerald-300'
                  : 'border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Subject Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isLab
                        ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
                        : 'bg-indigo-50 border-indigo-200/80 text-indigo-700'
                    }`}
                  >
                    {isLab ? (
                      <FlaskConical className="w-5 h-5" />
                    ) : (
                      <DoorClosed className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                        {subj.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {subj.name}
                      </h3>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isLab
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isLab ? 'Lab Session' : 'Lecture / Theory'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                      <span>Faculty: <strong className="text-slate-700 font-semibold">{subj.teacherName}</strong></span>
                      <span>•</span>
                      <span>{subj.periodsPerWeek} Periods / Week</span>
                      {otherInSameRoom.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-medium">
                            Shares room with {otherInSameRoom[0].code}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Controls for Type (Lecture vs Lab) and Room Number (1 to 100) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Lecture / Lab Type Switcher */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRoomTypeChange(subj.id, 'lecture')}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${
                        !isLab
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Lecture</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoomTypeChange(subj.id, 'lab')}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${
                        isLab
                          ? 'bg-white text-emerald-700 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <FlaskConical className="w-3 h-3" />
                      <span>Lab</span>
                    </button>
                  </div>

                  {/* Room Number Stepper & Direct Input (1 to 100) */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                      <span className="px-2.5 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-r border-slate-200 select-none">
                        {isLab ? 'Lab #' : 'Room #'}
                      </span>

                      {/* Decrement Button */}
                      <button
                        type="button"
                        onClick={() => handleRoomNumberChange(subj.id, Math.max(1, roomNum - 1))}
                        disabled={roomNum <= 1}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                        title="Previous room number"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Number Input (1 to 100) */}
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={roomNum}
                        onChange={(e) => handleRoomNumberChange(subj.id, e.target.value)}
                        className="w-14 py-2 text-center text-sm font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`Classroom number for ${subj.name}`}
                      />

                      {/* Increment Button */}
                      <button
                        type="button"
                        onClick={() => handleRoomNumberChange(subj.id, Math.min(100, roomNum + 1))}
                        disabled={roomNum >= 100}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                        title="Next room number"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Visual 1-100 Grid Picker Trigger */}
                    <button
                      type="button"
                      onClick={() => setActivePickerSubjectId(subj.id)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition shadow-xs"
                      title="Open 1–100 Room Grid Picker"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual 1–100 Room Grid Modal */}
      {activeSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60 mb-1">
                  <Hash className="w-3 h-3" />
                  <span>Interactive Room Selector (1–100)</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Select Room for {activeSubject.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently assigned to:{' '}
                  <strong className="text-slate-800">
                    {activeSubject.isLab ? 'Lab' : 'Room'} {activeSubject.classroomNumber || 1}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePickerSubjectId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Floor Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 pb-3">
              {floorRanges.map((fr) => (
                <button
                  key={fr.floor}
                  type="button"
                  onClick={() => setPickerFloor(fr.floor)}
                  className={`text-xs font-semibold p-2 rounded-xl border text-center transition ${
                    pickerFloor === fr.floor
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {fr.label}
                </button>
              ))}
            </div>

            {/* 1–100 Interactive Room Grid */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-2">
                {Array.from(
                  { length: 25 },
                  (_, i) => (pickerFloor - 1) * 25 + i + 1
                ).map((roomNum) => {
                  const isCurrent = activeSubject.classroomNumber === roomNum;
                  const occupyingSubjects = roomUsageMap[roomNum] || [];
                  const isOccupiedByOther = occupyingSubjects.some(
                    (s) => s.id !== activeSubject.id
                  );

                  return (
                    <button
                      key={roomNum}
                      type="button"
                      onClick={() => {
                        handleRoomNumberChange(activeSubject.id, roomNum);
                        setActivePickerSubjectId(null);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                          : isOccupiedByOther
                          ? 'bg-amber-50/80 hover:bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base font-bold">
                          {roomNum}
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] font-medium leading-none opacity-80">
                        {isCurrent
                          ? 'Selected'
                          : isOccupiedByOther
                          ? `Occupied (${occupyingSubjects[0].code})`
                          : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span>
                  <span>Selected</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block"></span>
                  <span>Shared</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block"></span>
                  <span>Available</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActivePickerSubjectId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition"
              >
                Close Picker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Guidance Notice */}
      <div className="p-4 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          Each subject is now linked with a designated classroom or lab hall numbered between{' '}
          <strong className="text-slate-800">1 and 100</strong>. When the timetable schedule is
          generated, these exact classroom numbers will be printed inside each period slot and
          included in the export reports.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
        <button
          type="button"
          id="back-to-step-4-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subjects</span>
        </button>

        <button
          type="button"
          id="proceed-to-timetable-btn"
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-sm font-semibold px-7 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <span>Ready to Generate Timetable</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
