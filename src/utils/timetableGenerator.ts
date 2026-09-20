import {
  AcademicYear,
  ClashDetail,
  DayOfWeek,
  Department,
  Division,
  GeneratedTimetable,
  GenerationReport,
  LabAllocation,
  Subject,
  StudentGroup,
  TimetableActivity,
  TimeSlot,
  TimetableCell,
  TimetableSettings,
  UnplacedSubject,
} from '../types';

export const DEFAULT_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DEFAULT_TIMETABLE_SETTINGS: TimetableSettings = {
  days: DEFAULT_DAYS,
  periodsPerDay: 6, // 6 academic teaching periods per day (P1 to P6)
  includeSaturday: true,
  startTime: '09:30', // College starts at 9:30 AM
  endTime: '16:20', // College concludes at 4:20 PM
  periodDurationMinutes: 60, // 60 minutes per lecture
  waterBreakDurationMinutes: 40, // 11:30 AM - 12:10 PM break
  lunchDurationMinutes: 10, // 2:10 PM - 2:20 PM break
  defaultRoom: 'Room 101',
};

/**
 * Generates the 8 timetable slots from 09:30 AM to 04:20 PM:
 * 1. Period 1: 09:30 AM – 10:30 AM (60 min)
 * 2. Period 2: 10:30 AM – 11:30 AM (60 min)
 * 3. Break: 11:30 AM – 12:10 PM (40 min)
 * 4. Period 3: 12:10 PM – 01:10 PM (60 min)
 * 5. Period 4: 01:10 PM – 02:10 PM (60 min)
 * 6. Break: 02:10 PM – 02:20 PM (10 min)
 * 7. Period 5: 02:20 PM – 03:20 PM (60 min)
 * 8. Period 6: 03:20 PM – 04:20 PM (60 min)
 */
export function generateTimeSlots(_settings?: Partial<TimetableSettings>): TimeSlot[] {
  return [
    {
      periodNumber: 1,
      startTime: '09:30 AM',
      endTime: '10:30 AM',
      isBreak: false,
    },
    {
      periodNumber: 2,
      startTime: '10:30 AM',
      endTime: '11:30 AM',
      isBreak: false,
    },
    {
      periodNumber: 0,
      startTime: '11:30 AM',
      endTime: '12:10 PM',
      isBreak: true,
      breakType: 'recess',
      breakTitle: 'Morning Break',
    },
    {
      periodNumber: 3,
      startTime: '12:10 PM',
      endTime: '01:10 PM',
      isBreak: false,
    },
    {
      periodNumber: 4,
      startTime: '01:10 PM',
      endTime: '02:10 PM',
      isBreak: false,
    },
    {
      periodNumber: 0,
      startTime: '02:10 PM',
      endTime: '02:20 PM',
      isBreak: true,
      breakType: 'recess',
      breakTitle: 'Afternoon Break',
    },
    {
      periodNumber: 5,
      startTime: '02:20 PM',
      endTime: '03:20 PM',
      isBreak: false,
    },
    {
      periodNumber: 6,
      startTime: '03:20 PM',
      endTime: '04:20 PM',
      isBreak: false,
    },
  ];
}

/**
 * Helper to determine if a subject is a practical Lab
 */
export function isLabSubject(subj: Subject): boolean {
  return (
    Boolean(subj.isLab) ||
    subj.roomType === 'lab' ||
    subj.activityType === 'Lab' ||
    /lab|practicum|workshop|practical/i.test(subj.name)
  );
}

interface TeacherBusySlot {
  teacherName: string;
  departmentName: string;
  year: AcademicYear;
  divisionName: string;
  subjectName: string;
  room?: string;
}

const STUDENT_GROUPS: StudentGroup[] = ['Whole Division', 'TB1', 'TB2', 'TB3'];

const normalizeStudentGroup = (subject: Subject): StudentGroup =>
  subject.studentGroup || 'Whole Division';

const activityTypeFor = (subject: Subject): Subject['activityType'] =>
  subject.activityType || (isLabSubject(subject) ? 'Lab' : 'Theory');

const durationFor = (subject: Subject): 1 | 2 =>
  subject.durationPeriods || (isLabSubject(subject) ? 2 : 1);

const roomTypeFor = (subject: Subject): 'lecture' | 'lab' | 'any' =>
  subject.roomType || (isLabSubject(subject) ? 'lab' : 'lecture');

/**
 * Timetable Generator Rules:
 * 1. College hours: 09:30 AM to 04:20 PM (Monday to Saturday).
 * 2. Breaks:
 *    - Morning Break (11:30 AM - 12:10 PM)
 *    - Afternoon Break (02:10 PM - 02:20 PM)
 * 3. Daily Composition:
 *    - Standard Day: 4 Lectures + 1 Lab (2-hour continuous block).
 *    - Double Lab Day: If 2 labs occur on the same day, then exactly 2 lectures on that day!
 *    - Zero Lab Day: 6 lectures / tutorials to ensure no gap.
 * 4. Strictly NO FREE SLOTS for students: full schedule is 100% occupied.
 * 5. Lab constraint: Each specific lab runs once per week for a division.
 * 6. Global store cross-division teacher clash detection & auto-shifting.
 */
export function generateTimetableGrid(
  department: Department,
  year: AcademicYear,
  division: Division,
  subjects: Subject[],
  customSettings?: Partial<TimetableSettings>,
  existingTimetables?: GeneratedTimetable[]
): GeneratedTimetable {
  const currentKey = `${department.id}-y${year}-${division.id}`;
    const settings: TimetableSettings = {
      ...DEFAULT_TIMETABLE_SETTINGS,
      ...customSettings,
      days: DEFAULT_DAYS,
      periodsPerDay: 6,
      includeSaturday: true,
    };
    const timeSlots = generateTimeSlots(settings);
    const days = settings.days;
    const teachingSlotIndices = [0, 1, 3, 4, 6, 7];
    const labBlocks = [
      { indices: [6, 7], name: 'afternoon' },
      { indices: [0, 1], name: 'morning' },
    ];
    const totalWeeklyTeachingSlots = days.length * teachingSlotIndices.length;
    const grid: Record<DayOfWeek, (TimetableCell | null)[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [],
    };

    days.forEach((day) => {
      grid[day] = timeSlots.map((slot, periodIndex) =>
        slot.isBreak
          ? {
              id: `${day}-break-${periodIndex}`,
              day,
              periodIndex,
              timeSlot: slot,
              isBreak: true,
              breakTitle: slot.breakTitle || 'Break',
            }
          : null
      );
    });

    const teacherBusyMap = new Map<string, TeacherBusySlot>();
    const roomBusyMap = new Map<string, string>();
    const groupBusyMap = new Map<string, string>();
    const otherTimetables = existingTimetables || [];
    otherTimetables.forEach((otherTt) => {
      const otherKey = otherTt.timetableKey ||
        `${otherTt.department.id}-y${otherTt.year}-${otherTt.division.id}`;
      if (otherKey === currentKey) return;
      const otherDays = otherTt.settings?.days || (Object.keys(otherTt.grid) as DayOfWeek[]);
      otherDays.forEach((day) => {
        (otherTt.grid[day] || []).forEach((cell, slotIndex) => {
          if (!cell || cell.isBreak) return;
          const activities = cell.activities || (cell.subject ? [{
            subject: cell.subject,
            studentGroup: normalizeStudentGroup(cell.subject),
            teacher: cell.subject.teacherName,
            room: cell.room || '',
            durationPeriods: durationFor(cell.subject),
            activityType: activityTypeFor(cell.subject)!,
          }] : []);
          activities.forEach((activity) => {
            if (activity.teacher) {
              teacherBusyMap.set(`${activity.teacher.trim().toLowerCase()}__${day}__${slotIndex}`, {
                teacherName: activity.teacher,
                departmentName: otherTt.department.name,
                year: otherTt.year,
                divisionName: otherTt.division.name,
                subjectName: activity.subject.name,
                room: activity.room,
              });
            }
            if (activity.room) {
              roomBusyMap.set(`${activity.room.trim().toLowerCase()}__${day}__${slotIndex}`,
                `${otherTt.department.name} (Yr ${otherTt.year} Div ${otherTt.division.name})`);
            }
            groupBusyMap.set(`${activity.studentGroup}__${day}__${slotIndex}`,
              `${otherTt.department.name} (Yr ${otherTt.year} Div ${otherTt.division.name})`);
          });
        });
      });
    });

    const localTeacherSlots = new Map<string, Set<string>>();
    const localRoomSlots = new Map<string, Set<string>>();
    const localGroupSlots = new Map<string, Set<string>>();
    const teacherKey = (teacher: string, day: DayOfWeek, slot: number) =>
      `${teacher.trim().toLowerCase()}__${day}__${slot}`;
    const roomKey = (room: string, day: DayOfWeek, slot: number) =>
      `${room.trim().toLowerCase()}__${day}__${slot}`;
    const isTeacherBusyAt = (teacher: string, day: DayOfWeek, slot: number) => {
      if (!teacher || teacher.trim().toLowerCase() === 'tbd') return false;
      const normalized = teacher.trim().toLowerCase();
      return teacherBusyMap.has(teacherKey(teacher, day, slot)) ||
        Boolean(localTeacherSlots.get(normalized)?.has(`${day}__${slot}`));
    };
    const isRoomBusyAt = (room: string, day: DayOfWeek, slot: number) =>
      Boolean(roomBusyMap.has(roomKey(room, day, slot)) ||
        localRoomSlots.get(room.trim().toLowerCase())?.has(`${day}__${slot}`));
    const conflictingGroups = (group: StudentGroup): StudentGroup[] =>
      group === 'Whole Division' ? STUDENT_GROUPS : ['Whole Division', group];
    const isGroupBusyAt = (group: StudentGroup, day: DayOfWeek, slot: number) =>
      conflictingGroups(group).some((conflictingGroup) =>
        groupBusyMap.has(`${conflictingGroup}__${day}__${slot}`) ||
        Boolean(localGroupSlots.get(conflictingGroup)?.has(`${day}__${slot}`))
      );
    const markTeacher = (teacher: string, day: DayOfWeek, slot: number) => {
      if (!teacher || teacher.trim().toLowerCase() === 'tbd') return;
      const normalized = teacher.trim().toLowerCase();
      if (!localTeacherSlots.has(normalized)) localTeacherSlots.set(normalized, new Set());
      localTeacherSlots.get(normalized)!.add(`${day}__${slot}`);
    };
    const markRoom = (room: string, day: DayOfWeek, slot: number) => {
      const normalized = room.trim().toLowerCase();
      if (!localRoomSlots.has(normalized)) localRoomSlots.set(normalized, new Set());
      localRoomSlots.get(normalized)!.add(`${day}__${slot}`);
    };
    const markGroup = (group: StudentGroup, day: DayOfWeek, slot: number) => {
      if (!localGroupSlots.has(group)) localGroupSlots.set(group, new Set());
      localGroupSlots.get(group)!.add(`${day}__${slot}`);
    };
    const conflictingDivision = (teacher: string, day: DayOfWeek, slot: number) => {
      const busy = teacherBusyMap.get(teacherKey(teacher, day, slot));
      return busy ? `${busy.departmentName} (Yr ${busy.year} Div ${busy.divisionName})` : 'Current Division';
    };

    const clashDetails: ClashDetail[] = [];
    const warningMessages: string[] = [];
    const unplacedSubjects: UnplacedSubject[] = [];
    const labAllocations: LabAllocation[] = [];
    let teacherConflictAttempts = 0;
    let roomConflictAttempts = 0;
    let studentGroupConflictAttempts = 0;
    const dailyLabStatus: Record<DayOfWeek, string> = {
      Monday: 'not scheduled', Tuesday: 'not scheduled', Wednesday: 'not scheduled',
      Thursday: 'not scheduled', Friday: 'not scheduled', Saturday: 'not scheduled',
    };
    const dailyLabCounts: Record<DayOfWeek, number> = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0,
    };
    const dailySubjectCounts: Record<DayOfWeek, Record<string, number>> = {
      Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {}, Saturday: {},
    };
    const theorySubjects = subjects.filter((subject) => !isLabSubject(subject));
    const labSubjects = subjects.filter(isLabSubject);
    const theoryTargets = new Map(theorySubjects.map((subject) => [subject.id, Math.max(0, subject.periodsPerWeek)]));
    const labTargets = new Map(labSubjects.map((subject) => [subject.id, Math.max(0, subject.periodsPerWeek)]));
    const labPlaced = new Map(labSubjects.map((subject) => [subject.id, 0]));
    const theoryPlaced = new Map(theorySubjects.map((subject) => [subject.id, 0]));
    const requestedTheoryPeriods = theorySubjects.reduce((sum, subject) => sum + Math.max(0, subject.periodsPerWeek), 0);
    const requestedLabPeriods = labSubjects.reduce((sum, subject) => sum + Math.max(0, subject.periodsPerWeek), 0);

    // Stage 1: validate curriculum allocations without manufacturing subjects or sessions.
    labSubjects.forEach((subject) => {
      if (subject.periodsPerWeek % 2 !== 0) {
        warningMessages.push(`${subject.name}: ${subject.periodsPerWeek} lab periods requested; 1 period is unusable because labs require two consecutive periods.`);
      }
      if (!subject.classroomNumber) {
        warningMessages.push(`${subject.name}: no laboratory number supplied; generated laboratory room names will be used.`);
      }
    });
    if (requestedTheoryPeriods + requestedLabPeriods > totalWeeklyTeachingSlots) {
      warningMessages.push(`Curriculum requests ${requestedTheoryPeriods + requestedLabPeriods} periods, but only ${totalWeeklyTeachingSlots} teaching slots are available.`);
    }
    // Stage 2: reserve valid two-period lab sessions. Each subject is capped by floor(periodsPerWeek / 2).
    const labSessionCapacity = new Map(labSubjects.map((subject) => [subject.id,
      Math.floor(Math.max(0, subject.periodsPerWeek) / durationFor(subject))]));
    const lectureRooms = Array.from(new Set(
      theorySubjects
        .flatMap((subject) => [
          ...(subject.suitableRooms || []),
          ...(subject.classroomNumber ? [`Room ${subject.classroomNumber}`] : []),
        ])
        .filter((room) => !/^lab\s/i.test(room))
    ));
    const laboratoryRooms = Array.from(new Set(
      labSubjects
        .flatMap((subject) => [
          ...(subject.suitableRooms || []),
          ...(subject.classroomNumber ? [`Lab ${subject.classroomNumber}`] : []),
        ])
        .filter((room) => /^lab\s/i.test(room))
    ));
    const labRoomsFor = (subject: Subject) => {
      const assignedRoom = subject.classroomNumber ? `Lab ${subject.classroomNumber}` : '';
      const suitableRooms = (subject.suitableRooms || []).filter((room) => /^lab\s/i.test(room));
      return [assignedRoom, ...suitableRooms, ...laboratoryRooms, `Lab ${subject.id}`].filter(
        (room, index, rooms) => room && rooms.indexOf(room) === index
      );
    };
    const theoryRoomsFor = (subject: Subject) => {
      const assignedRoom = subject.classroomNumber ? `Room ${subject.classroomNumber}` : '';
      const suitableRooms = (subject.suitableRooms || []).filter((room) => !/^lab\s/i.test(room));
      return [assignedRoom, ...suitableRooms, ...lectureRooms, settings.defaultRoom || 'Room 101'].filter(
        (room, index, rooms) => room && rooms.indexOf(room) === index
      );
    };
    const previousTeachingSlot = (slot: number) => {
      const index = teachingSlotIndices.indexOf(slot);
      return index > 0 ? teachingSlotIndices[index - 1] : undefined;
    };
    const preferredRooms = (subject: Subject, day: DayOfWeek, slot: number, isLab: boolean) => {
      const type = roomTypeFor(subject);
      const rooms = type === 'lab'
        ? labRoomsFor(subject)
        : type === 'any'
          ? [...new Set([...theoryRoomsFor(subject), ...labRoomsFor(subject)])]
          : theoryRoomsFor(subject);
      const previousSlot = previousTeachingSlot(slot);
      const previousRoom = previousSlot === undefined ? undefined : grid[day][previousSlot]?.room;
      if (previousRoom && rooms.includes(previousRoom)) {
        return [previousRoom, ...rooms.filter((room) => room !== previousRoom)];
      }
      return rooms;
    };
    const activityForSubject = (subject: Subject, room: string): TimetableActivity => ({
      subject,
      studentGroup: normalizeStudentGroup(subject),
      teacher: subject.teacherName,
      room,
      durationPeriods: durationFor(subject),
      activityType: activityTypeFor(subject)!,
    });
    const canShareCell = (subject: Subject, day: DayOfWeek, slot: number) => {
      const cell = grid[day][slot];
      return cell === null || (!cell.isBreak && normalizeStudentGroup(subject) !== 'Whole Division' &&
        Boolean(cell.activities) && !cell.subject);
    };
    const teachingBlocksFor = (duration: number) => {
      if (duration === 1) return teachingSlotIndices.map((slot) => [slot]);
      const blocks: number[][] = [];
      for (let index = 0; index <= teachingSlotIndices.length - duration; index++) {
        const block = teachingSlotIndices.slice(index, index + duration);
        if (block[block.length - 1] - block[0] === duration - 1) blocks.push(block);
      }
      return blocks;
    };
    const appendBatchActivity = (day: DayOfWeek, slot: number, activity: TimetableActivity) => {
      const cell = grid[day][slot];
      if (!cell || cell.isBreak) return;
      cell.activities = [...(cell.activities || []), activity];
    };
    const recordLabConflict = (subject: Subject, day: DayOfWeek, slot: number, kind: 'teacher' | 'room') => {
      const divisionName = kind === 'teacher' ? conflictingDivision(subject.teacherName, day, slot) : 'another scheduled class';
      clashDetails.push({
        teacherName: subject.teacherName,
        subjectName: subject.name,
        conflictDay: day,
        conflictPeriod: timeSlots[slot].periodNumber,
        conflictingDivision: divisionName,
        shiftedToDay: day,
        shiftedToPeriod: 0,
        resolutionNote: `${kind === 'teacher' ? 'Teacher' : 'Room'} conflict prevented this lab placement.`,
      });
    };
    const findLabRoom = (subject: Subject, day: DayOfWeek, block: number[]) => {
      return preferredRooms(subject, day, block[0], true).find((room) =>
        block.every((slot) => !isRoomBusyAt(room, day, slot))
      );
    };
    const canPlaceBlock = (subject: Subject, day: DayOfWeek, block: number[]) => {
      if (block.some((slot) => !canShareCell(subject, day, slot))) return false;
      if (block.some((slot) => isGroupBusyAt(normalizeStudentGroup(subject), day, slot))) {
        studentGroupConflictAttempts++;
        warningMessages.push(`${subject.name}: ${normalizeStudentGroup(subject)} was already occupied on ${day}; the activity block was rejected.`);
        return false;
      }
      if (block.some((slot) => isTeacherBusyAt(subject.teacherName, day, slot))) {
        teacherConflictAttempts++;
        recordLabConflict(subject, day, block.find((slot) => isTeacherBusyAt(subject.teacherName, day, slot))!, 'teacher');
        return false;
      }
      const room = preferredRooms(subject, day, block[0], roomTypeFor(subject) === 'lab')
        .find((candidateRoom) => block.every((slot) => !isRoomBusyAt(candidateRoom, day, slot)));
      if (!room) {
        roomConflictAttempts++;
        recordLabConflict(subject, day, block[0], 'room');
        return false;
      }
      return true;
    };
    const placeBlock = (subject: Subject, day: DayOfWeek, block: number[]) => {
      const isLab = isLabSubject(subject);
      const room = preferredRooms(subject, day, block[0], isLab)
        .find((candidateRoom) => block.every((slot) => !isRoomBusyAt(candidateRoom, day, slot)));
      if (!room) return;
      const activity = activityForSubject(subject, room);
      const sessionNumber = (labPlaced.get(subject.id) || 0) / 2 + 1;
      const sessionLabel = sessionNumber > 1 ? `Practical Session ${sessionNumber}` : 'Practical Session';
      const isDoubleLabDay = dailyLabCounts[day] > 0;
      block.forEach((slot, part) => {
        if (normalizeStudentGroup(subject) !== 'Whole Division') {
          if (!grid[day][slot]) {
            grid[day][slot] = {
              id: `${day}-p${slot}`,
              day,
              periodIndex: slot,
              timeSlot: timeSlots[slot],
              room,
              isBreak: false,
              activities: [],
            };
          }
          appendBatchActivity(day, slot, activity);
        } else {
          grid[day][slot] = {
            id: `${day}-p${slot}`,
            day,
            periodIndex: slot,
            timeSlot: timeSlots[slot],
            subject: { ...subject, isLab: isLab || subject.isLab, roomType: isLab ? 'lab' : subject.roomType },
            room,
            isBreak: false,
            isLabSession: isLab,
            labBlockPart: isLab ? (part + 1) as 1 | 2 : undefined,
            labBlockTitle: isLab ? `${subject.name} (${sessionLabel} - Part ${part + 1})` : undefined,
            isDoubleLabDay: isLab ? isDoubleLabDay : undefined,
          };
        }
        markTeacher(subject.teacherName, day, slot);
        markRoom(room, day, slot);
        markGroup(normalizeStudentGroup(subject), day, slot);
      });
      const placedPeriods = block.length;
      if (isLab) {
        labPlaced.set(subject.id, (labPlaced.get(subject.id) || 0) + placedPeriods);
        dailyLabCounts[day]++;
        dailyLabStatus[day] = `${dailyLabCounts[day]} lab${dailyLabCounts[day] === 1 ? '' : 's'} scheduled`;
        labAllocations.push({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          teacherName: subject.teacherName,
          day,
          periodNumber: timeSlots[block[0]].periodNumber,
          periodNumbers: block.map((slot) => timeSlots[slot].periodNumber),
          startTime: timeSlots[block[0]].startTime,
          endTime: timeSlots[block[block.length - 1]].endTime,
          room,
          durationHours: block.length,
          frequency: `${sessionLabel} (Weekly)`,
          isDoubleLabDay,
        });
      }
      return placedPeriods;
    };

    // Place only the sessions requested by each lab subject. Days are selected for
    // availability, not to manufacture a daily lab requirement.
    labSubjects.forEach((subject) => {
      const duration = durationFor(subject);
      const blocks = duration === 2
        ? labBlocks.map((block) => block.indices)
        : teachingBlocksFor(duration);
      while ((labPlaced.get(subject.id) || 0) < (labSessionCapacity.get(subject.id) || 0) * duration) {
        let placed = false;
        for (const day of days) {
          for (const block of blocks) {
            if (canPlaceBlock(subject, day, block)) {
              placeBlock(subject, day, block);
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (!placed) break;
      }
      days.forEach((day) => {
        dailyLabStatus[day] = dailyLabCounts[day] > 0
          ? `${dailyLabCounts[day]} lab${dailyLabCounts[day] === 1 ? '' : 's'} scheduled`
          : 'no lab session scheduled';
      });
    });

    // Place non-lab activities that explicitly require consecutive periods.
    subjects.filter((subject) => !isLabSubject(subject) && durationFor(subject) > 1).forEach((subject) => {
      const target = Math.max(0, subject.periodsPerWeek);
      let placed = 0;
      while (placed + durationFor(subject) <= target) {
        let didPlace = false;
        for (const day of days) {
          const blocks = teachingBlocksFor(durationFor(subject));
          for (const block of blocks) {
            if (canPlaceBlock(subject, day, block)) {
              placeBlock(subject, day, block);
              placed += block.length;
              didPlace = true;
              break;
            }
          }
          if (didPlace) break;
        }
        if (!didPlace) break;
      }
      theoryPlaced.set(subject.id, placed);
      if (placed < target) {
        unplacedSubjects.push({ subjectId: subject.id, subjectName: subject.name, subjectCode: subject.code,
          teacherName: subject.teacherName, requestedPeriods: target, placedPeriods: placed,
          reason: 'No valid consecutive block satisfied the student-group, teacher, room, or timetable constraints.' });
        warningMessages.push(`${subject.name}: placed ${placed}/${target} periods.`);
      }
    });

    // Stage 3-5: place exact theory periods, checking both teacher and room before committing.
    const theoryOrder = theorySubjects
      .filter((subject) => durationFor(subject) === 1)
      .sort((a, b) => b.periodsPerWeek - a.periodsPerWeek);
    theoryOrder.forEach((subject) => {
      while ((theoryPlaced.get(subject.id) || 0) < (theoryTargets.get(subject.id) || 0)) {
        const candidates = days.map((day) => ({
          day,
          count: dailySubjectCounts[day][subject.id] || 0,
          free: teachingSlotIndices.filter((slot) => grid[day][slot] === null).length,
        })).sort((a, b) => a.count - b.count || b.free - a.free);
        let placed = false;
        for (const candidate of candidates) {
          for (const slot of teachingSlotIndices) {
            if (!canShareCell(subject, candidate.day, slot)) continue;
            if (isGroupBusyAt(normalizeStudentGroup(subject), candidate.day, slot)) {
              studentGroupConflictAttempts++;
              warningMessages.push(`${subject.name}: ${normalizeStudentGroup(subject)} was already occupied on ${candidate.day}, period ${timeSlots[slot].periodNumber}.`);
              continue;
            }
            if (isTeacherBusyAt(subject.teacherName, candidate.day, slot)) {
              teacherConflictAttempts++;
              clashDetails.push({
                teacherName: subject.teacherName,
                subjectName: subject.name,
                conflictDay: candidate.day,
                conflictPeriod: timeSlots[slot].periodNumber,
                conflictingDivision: conflictingDivision(subject.teacherName, candidate.day, slot),
                shiftedToDay: candidate.day,
                shiftedToPeriod: 0,
                resolutionNote: 'Teacher conflict prevented this lecture placement.',
              });
              continue;
            }
            const room = preferredRooms(subject, candidate.day, slot, false).find((candidateRoom) =>
              !isRoomBusyAt(candidateRoom, candidate.day, slot)
            );
            if (!room) {
              roomConflictAttempts++;
              warningMessages.push(`${subject.name}: no suitable lecture room was available on ${candidate.day}, period ${timeSlots[slot].periodNumber}.`);
              continue;
            }
            if (normalizeStudentGroup(subject) !== 'Whole Division') {
              if (!grid[candidate.day][slot]) {
                grid[candidate.day][slot] = {
                  id: `${candidate.day}-p${slot}`,
                  day: candidate.day,
                  periodIndex: slot,
                  timeSlot: timeSlots[slot],
                  room,
                  isBreak: false,
                  activities: [],
                };
              }
              appendBatchActivity(candidate.day, slot, activityForSubject(subject, room));
            } else {
              grid[candidate.day][slot] = {
                id: `${candidate.day}-p${slot}`,
                day: candidate.day,
                periodIndex: slot,
                timeSlot: timeSlots[slot],
                subject: { ...subject, isLab: false, roomType: roomTypeFor(subject) },
                room,
                isBreak: false,
              };
            }
            markTeacher(subject.teacherName, candidate.day, slot);
            markRoom(room, candidate.day, slot);
            markGroup(normalizeStudentGroup(subject), candidate.day, slot);
            theoryPlaced.set(subject.id, (theoryPlaced.get(subject.id) || 0) + 1);
            dailySubjectCounts[candidate.day][subject.id] = (dailySubjectCounts[candidate.day][subject.id] || 0) + 1;
            placed = true;
            break;
          }
          if (placed) break;
        }
        if (!placed) break;
      }
    });

    theorySubjects.filter((subject) => durationFor(subject) === 1).forEach((subject) => {
      const requested = theoryTargets.get(subject.id) || 0;
      const placed = theoryPlaced.get(subject.id) || 0;
      if (placed < requested) {
        unplacedSubjects.push({ subjectId: subject.id, subjectName: subject.name, subjectCode: subject.code,
          teacherName: subject.teacherName, requestedPeriods: requested, placedPeriods: placed,
          reason: 'No remaining slot satisfied the teacher, room, or timetable constraints.' });
        warningMessages.push(`${subject.name}: placed ${placed}/${requested} theory periods.`);
      }
    });
    labSubjects.forEach((subject) => {
      const requested = labTargets.get(subject.id) || 0;
      const placed = labPlaced.get(subject.id) || 0;
      if (placed < requested) {
        unplacedSubjects.push({ subjectId: subject.id, subjectName: subject.name, subjectCode: subject.code,
          teacherName: subject.teacherName, requestedPeriods: requested, placedPeriods: placed,
          reason: requested % 2 === 1 && placed === requested - 1
            ? 'One odd lab period is unusable because each lab session requires two periods.'
            : 'No valid two-period block satisfied the teacher, laboratory room, or timetable constraints.' });
        warningMessages.push(`${subject.name}: placed ${placed}/${requested} lab periods.`);
      }
    });

    // Stage 6: validate the actual grid; empty teaching slots remain empty by design.
    let filledSlots = 0;
    let actualTeacherConflicts = 0;
    let actualRoomConflicts = 0;
    let actualStudentGroupConflicts = 0;
    const seenTeachers = new Set<string>();
    const seenRooms = new Set<string>();
    const seenGroups = new Set<StudentGroup>();
    days.forEach((day) => teachingSlotIndices.forEach((slot) => {
      const cell = grid[day][slot];
      if (!cell?.subject && !cell?.activities?.length) return;
      filledSlots++;
      const activities: TimetableActivity[] = cell.activities || (cell.subject ? [activityForSubject(cell.subject, cell.room || '')] : []);
      const slotGroups: StudentGroup[] = [];
      activities.forEach((activity) => {
        const group = activity.studentGroup;
        const tKey = teacherKey(activity.teacher, day, slot);
        const rKey = activity.room ? roomKey(activity.room, day, slot) : '';
        if (activity.teacher && seenTeachers.has(tKey)) actualTeacherConflicts++;
        if (activity.room && seenRooms.has(rKey)) actualRoomConflicts++;
        if (slotGroups.some((existingGroup) => conflictingGroups(existingGroup).includes(group))) {
          actualStudentGroupConflicts++;
        }
        seenTeachers.add(tKey);
        if (activity.room) seenRooms.add(rKey);
        slotGroups.push(group);
      });
      slotGroups.forEach((group) => {
        if (seenGroups.has(group) || (group === 'Whole Division' && seenGroups.size > 0) ||
          (group !== 'Whole Division' && seenGroups.has('Whole Division'))) {
          actualStudentGroupConflicts++;
        }
        seenGroups.add(group);
      });
      seenGroups.clear();
    }));
    const placedTheoryPeriods = theorySubjects.reduce((sum, subject) => sum + (theoryPlaced.get(subject.id) || 0), 0);
    const placedLabPeriods = labSubjects.reduce((sum, subject) => sum + (labPlaced.get(subject.id) || 0), 0);
    const freeSlots = totalWeeklyTeachingSlots - filledSlots;
    const dailySummary = days.map((day) => `${day}: ${dailyLabStatus[day]}`).join('; ');
    const summary = `Requested theory periods: ${requestedTheoryPeriods}; placed: ${placedTheoryPeriods}; unplaced: ${requestedTheoryPeriods - placedTheoryPeriods}. ` +
      `Requested lab periods: ${requestedLabPeriods}; placed: ${placedLabPeriods}; unplaced: ${requestedLabPeriods - placedLabPeriods}. ` +
      `Teacher conflicts: ${actualTeacherConflicts}; room conflicts: ${actualRoomConflicts}; student-group conflicts: ${actualStudentGroupConflicts}; free teaching slots: ${freeSlots}. ` +
      `Daily labs: ${dailySummary}.`;
    warningMessages.push(`Validation summary: ${summary}`);
    if (teacherConflictAttempts > 0) warningMessages.push(`${teacherConflictAttempts} teacher-conflicting placements were rejected.`);
    if (roomConflictAttempts > 0) warningMessages.push(`${roomConflictAttempts} room-conflicting placements were rejected.`);
    if (studentGroupConflictAttempts > 0) warningMessages.push(`${studentGroupConflictAttempts} student-group-conflicting placements were rejected.`);
    const successMessage = actualTeacherConflicts === 0 && actualRoomConflicts === 0 &&
      actualStudentGroupConflicts === 0 &&
      requestedTheoryPeriods === placedTheoryPeriods && requestedLabPeriods === placedLabPeriods
      ? `Timetable generated successfully. ${summary}`
      : `Timetable generated with unsatisfied constraints. ${summary}`;
    const generationReport: GenerationReport = {
      totalRequestedPeriods: requestedTheoryPeriods + requestedLabPeriods,
      totalPlacedPeriods: filledSlots,
      clashesAvoided: teacherConflictAttempts + roomConflictAttempts + studentGroupConflictAttempts,
      clashDetails,
      unplacedSubjects,
      labAllocations,
      successMessage,
      warningMessages,
    };
  return {
      timetableKey: currentKey,
      department,
      year,
      division,
      settings,
      subjects,
      timeSlots,
      grid,
      generatedAt: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      totalPeriodsAllocated: filledSlots,
      stats: { totalWeeklySlots: totalWeeklyTeachingSlots, filledSlots, freeSlots },
      generationReport,
    };
}
