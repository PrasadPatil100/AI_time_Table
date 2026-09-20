import {
  AcademicYear,
  ActivityType,
  ClashDetail,
  DayOfWeek,
  Department,
  Division,
  GeneratedTimetable,
  GenerationReport,
  LabAllocation,
  StudentGroup,
  Subject,
  TimetableActivity,
  TimetableActivityType,
  TimetableCell,
  TimetableSettings,
  UnplacedSubject,
} from '../types';
import {
  DEFAULT_DAYS,
  DEFAULT_TIMETABLE_SETTINGS,
  generateTimeSlots,
  isLabSubject,
} from './timetableGenerator';
import {
  getDivisionWorkload,
  getPlacedDivisionPeriods,
} from './timetableOccupancy';

type Allocation = { subject: Subject; group: StudentGroup };
type Task = {
  key: string;
  allocations: Allocation[];
  duration: 1 | 2;
  lab: boolean;
  requiredPeriods: number;
};
type Assignment = { allocation: Allocation; room: string; slot: number };

const TEACHING_SLOTS = [0, 1, 3, 4, 6, 7];
const normalize = (value: string) => value.trim().toLowerCase();
const groupFor = (subject: Subject): StudentGroup => subject.studentGroup || 'Whole Division';
const labFor = (subject: Subject) => isLabSubject(subject);
const durationFor = (subject: Subject): 1 | 2 => subject.durationPeriods || (labFor(subject) ? 2 : 1);
const roomTypeFor = (subject: Subject): 'lecture' | 'lab' | 'any' =>
  subject.roomType || (labFor(subject) ? 'lab' : 'lecture');
const modeFor = (subject: Subject): TimetableActivityType =>
  subject.activityMode || (groupFor(subject) === 'Whole Division' ? 'WHOLE_DIVISION' : 'ROTATIONAL_BATCH');
const activityTypeFor = (subject: Subject): ActivityType =>
  subject.activityType || (labFor(subject) ? 'Lab' : 'Theory');
const batchKeyFor = (subject: Subject) => {
  const code = subject.code.replace(/[-_\s]?TB[1-3]$/i, '').trim();
  const name = subject.name.replace(/\s*[-_]?(TB[1-3])\s*$/i, '').trim();
  return normalize(code || name || subject.id);
};
const activityFor = (subject: Subject, room: string): TimetableActivity => ({
  subject,
  studentGroup: groupFor(subject),
  teacher: subject.teacherName,
  room,
  durationPeriods: durationFor(subject),
  activityType: activityTypeFor(subject),
  activityMode: modeFor(subject),
  activityGroupId: subject.activityGroupId,
  isLab: labFor(subject),
});
const divisionKey = (department: Department, year: AcademicYear, division: Division) =>
  `${department.id}::y${year}::${division.id}`;
const batchKey = (division: string, group: StudentGroup) => `${division}::${group}`;
const resourceKey = (value: string, day: DayOfWeek, slot: number) =>
  `${normalize(value)}::${day}::${slot}`;

export function generateNewTimetableGrid(
  department: Department,
  year: AcademicYear,
  division: Division,
  subjects: Subject[],
  customSettings?: Partial<TimetableSettings>,
  existingTimetables: GeneratedTimetable[] = []
): GeneratedTimetable {
  const timetableKey = `${department.id}-y${year}-${division.id}`;
  const settings: TimetableSettings = {
    ...DEFAULT_TIMETABLE_SETTINGS,
    ...customSettings,
    days: DEFAULT_DAYS,
    periodsPerDay: 6,
    includeSaturday: true,
  };
  const timeSlots = generateTimeSlots(settings);
  const days = settings.days;
  const divisionCapacity = days.length * TEACHING_SLOTS.length;
  const divisionWorkload = getDivisionWorkload(subjects, divisionCapacity);
  const divisionId = divisionKey(department, year, division);
  const grid: Record<DayOfWeek, (TimetableCell | null)[]> = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [],
  };
  days.forEach((day) => {
    grid[day] = timeSlots.map((slot, periodIndex) => slot.isBreak ? {
      id: `${day}-break-${periodIndex}`,
      day,
      periodIndex,
      timeSlot: slot,
      isBreak: true,
      breakTitle: slot.breakTitle || 'Break',
    } : null);
  });

  const teacherBusy = new Set<string>();
  const roomBusy = new Set<string>();
  const batchBusy = new Set<string>();
  const divisionBusy = new Set<string>();
  const batchGroups = new Set<StudentGroup>(subjects.filter((subject) => groupFor(subject) !== 'Whole Division').map(groupFor));
  const key = (value: string, day: DayOfWeek, slot: number) => resourceKey(value, day, slot);
  const markExternal = (timetable: GeneratedTimetable) => {
    const externalDivision = divisionKey(timetable.department, timetable.year, timetable.division);
    Object.entries(timetable.grid).forEach(([day, cells]) => (cells || []).forEach((cell, slot) => {
      if (!cell || cell.isBreak) return;
      const activities = cell.activities?.length
        ? cell.activities
        : cell.subject ? [activityFor(cell.subject, cell.room || '')] : [];
      activities.forEach((activity) => {
        if (activity.teacher && normalize(activity.teacher) !== 'tbd') {
          teacherBusy.add(key(activity.teacher, day as DayOfWeek, slot));
        }
        if (activity.room) roomBusy.add(key(activity.room, day as DayOfWeek, slot));
        const groups = activity.studentGroup === 'Whole Division'
          ? Array.from(batchGroups)
          : [activity.studentGroup];
        groups.forEach((group) => batchBusy.add(`${batchKey(externalDivision, group)}::${day}::${slot}`));
        if (activity.studentGroup === 'Whole Division') {
          divisionBusy.add(`${externalDivision}::${day}::${slot}`);
        }
      });
    }));
  };
  existingTimetables.forEach((timetable) => {
    const otherKey = timetable.timetableKey || `${timetable.department.id}-y${timetable.year}-${timetable.division.id}`;
    if (otherKey !== timetableKey) markExternal(timetable);
  });

  const localTeacherBusy = new Set<string>();
  const localRoomBusy = new Set<string>();
  const localBatchBusy = new Set<string>();
  const warnings: string[] = [];
  const clashes: ClashDetail[] = [];
  const labAllocations: LabAllocation[] = [];
  const unplaced: UnplacedSubject[] = [];
  let rejectedTeachers = 0;
  let rejectedRooms = 0;
  let rejectedBatches = 0;
  let breakViolations = 0;
  if (divisionWorkload.excessPeriods > 0) {
    warnings.push(
      `Required division occupancy is ${divisionWorkload.divisionRequiredPeriods}/${divisionCapacity} periods; ${divisionWorkload.excessPeriods} periods exceed weekly capacity. Backtracking was skipped.`
    );
  }

  const configuredLabRooms = Array.from(new Set(subjects.flatMap((subject) => [
    ...(subject.suitableRooms || []).filter((room) => /^lab\s/i.test(room)),
    ...(subject.classroomNumber && (subject.isLab || subject.roomType === 'lab')
      ? [`Lab ${subject.classroomNumber}`]
      : []),
  ])));
  const rooms = (subject: Subject) => {
    const type = roomTypeFor(subject);
    const compatible = type === 'lab'
      ? configuredLabRooms
      : Array.from(new Set(subjects.flatMap((candidate) => [
        ...(candidate.suitableRooms || []),
        candidate.classroomNumber
          ? `${roomTypeFor(candidate) === 'lab' ? 'Lab' : 'Room'} ${candidate.classroomNumber}`
          : '',
      ]).filter(Boolean))).filter((room) => !/^lab\s/i.test(room));
    const assigned = subject.classroomNumber
      ? `${type === 'lab' ? 'Lab' : 'Room'} ${subject.classroomNumber}`
      : '';
    const fallback = type === 'lab' ? [] : [settings.defaultRoom || 'Room 101'];
    return Array.from(new Set([
      ...(subject.suitableRooms || []).filter((room) => type === 'any' || (type === 'lab' ? /^lab\s/i.test(room) : !/^lab\s/i.test(room))),
      assigned,
      ...compatible,
      ...fallback,
    ].filter(Boolean)));
  };
  const blocksFor = (duration: 1 | 2) => duration === 1
    ? TEACHING_SLOTS.map((slot) => [slot])
    : [[0, 1], [3, 4], [6, 7]];
  const batchOccupied = (group: StudentGroup, day: DayOfWeek, slot: number) => {
    if (group === 'Whole Division') {
      return divisionBusy.has(`${divisionId}::${day}::${slot}`) || Array.from(batchGroups).some((batch) =>
        batchBusy.has(`${batchKey(divisionId, batch)}::${day}::${slot}`) ||
        localBatchBusy.has(`${batchKey(divisionId, batch)}::${day}::${slot}`)
      );
    }
    return divisionBusy.has(`${divisionId}::${day}::${slot}`) ||
      batchBusy.has(`${batchKey(divisionId, group)}::${day}::${slot}`) ||
      localBatchBusy.has(`${batchKey(divisionId, group)}::${day}::${slot}`) ||
      localBatchBusy.has(`${batchKey(divisionId, 'Whole Division')}::${day}::${slot}`);
  };

  const createTasks = (): Task[] => {
    const groups = new Map<string, Allocation[]>();
    subjects.forEach((subject) => {
      const group = groupFor(subject);
      const mode = modeFor(subject);
      const logical = group === 'Whole Division'
        ? `whole:${subject.id}`
        : subject.activityGroupId
          ? `${mode.toLowerCase()}:${subject.activityGroupId}`
          : `batch:${subject.id}`;
      if (!groups.has(logical)) groups.set(logical, []);
      groups.get(logical)!.push({ subject, group });
    });
    const tasks: Task[] = [];
    groups.forEach((allocations, logical) => {
      const teacherNames = allocations
        .map(({ subject }) => normalize(subject.teacherName))
        .filter((teacher) => teacher && teacher !== 'tbd');
      const hasTeacherCollision = new Set(teacherNames).size !== teacherNames.length;
      const taskGroups = hasTeacherCollision && modeFor(allocations[0].subject) !== 'WHOLE_DIVISION'
        ? allocations.map((allocation) => [allocation])
        : [allocations];
      taskGroups.forEach((taskAllocations, groupIndex) => {
        const sessionsFor = (subject: Subject) => {
          const requiredPeriods = Math.max(0, subject.periodsPerWeek);
          const duration = durationFor(subject);
          return duration === 2 ? Math.floor(requiredPeriods / 2) : requiredPeriods;
        };
        const rounds = Math.max(...taskAllocations.map(({ subject }) => sessionsFor(subject)));
        for (let round = 0; round < rounds; round++) {
          const active = taskAllocations.filter(({ subject }) =>
            round < sessionsFor(subject));
          if (!active.length) continue;
          tasks.push({
            key: `${logical}:${groupIndex}:${round}`,
            allocations: active,
            duration: Math.max(...active.map(({ subject }) => durationFor(subject))) as 1 | 2,
            lab: active.some(({ subject }) => labFor(subject)),
            requiredPeriods: Math.max(...active.map(({ subject }) => durationFor(subject))),
          });
        }
      });
    });
    return tasks.sort((left, right) =>
      Number(right.allocations.length > 1) - Number(left.allocations.length > 1) ||
      Number(right.lab) - Number(left.lab) ||
      right.allocations.length - left.allocations.length ||
      left.key.localeCompare(right.key)
    );
  };

  const tasks = createTasks();
  const placedPeriods = new Map<string, number>();
  const placedSubjectPeriods = new Map<string, number>();
  const taskCandidates = (task: Task) => days.flatMap((day) => blocksFor(task.duration).map((block) => ({ day, block })))
    .sort((left, right) =>
      Number(right.block[0] >= 3) - Number(left.block[0] >= 3) ||
      left.day.localeCompare(right.day) || left.block[0] - right.block[0]
    );

  const canPlace = (task: Task, day: DayOfWeek, block: number[]) => {
    if (task.duration === 2 && (block.length !== 2 || block[1] - block[0] !== 1)) {
      breakViolations++;
      return null;
    }
    const assignments: Assignment[] = [];
    for (const slot of block) {
      if (grid[day][slot]?.isBreak) return null;
      const usedTeachers = new Set<string>();
      const usedRooms = new Set<string>();
      for (const allocation of task.allocations) {
        if (batchOccupied(allocation.group, day, slot)) {
          rejectedBatches++;
          return null;
        }
        const teacher = normalize(allocation.subject.teacherName);
        if (teacher && teacher !== 'tbd' && (
          usedTeachers.has(teacher) ||
          teacherBusy.has(key(allocation.subject.teacherName, day, slot)) ||
          localTeacherBusy.has(key(allocation.subject.teacherName, day, slot))
        )) {
          rejectedTeachers++;
          return null;
        }
        const room = rooms(allocation.subject).find((candidate) => {
          const roomId = normalize(candidate);
          return !usedRooms.has(roomId) &&
            !roomBusy.has(key(candidate, day, slot)) &&
            !localRoomBusy.has(key(candidate, day, slot));
        });
        if (!room) {
          rejectedRooms++;
          return null;
        }
        usedTeachers.add(teacher);
        usedRooms.add(normalize(room));
        assignments.push({ allocation, room, slot });
      }
    }
    return assignments;
  };

  const apply = (task: Task, day: DayOfWeek, block: number[], assignments: Assignment[]) => {
    const previous = block.map((slot) => grid[day][slot]);
    block.forEach((slot) => {
      const slotAssignments = assignments.filter((entry) => entry.slot === slot);
      const isBatch = task.allocations.some(({ group }) => group !== 'Whole Division');
      const target = isBatch
        ? grid[day][slot] || { id: `${day}-p${slot}`, day, periodIndex: slot, timeSlot: timeSlots[slot], isBreak: false, activities: [] }
        : null;
      if (target) {
        target.activities = [...(target.activities || []), ...slotAssignments.map(({ allocation, room }) => activityFor(allocation.subject, room))];
        if (!target.subject) target.subject = task.allocations[0].subject;
        target.room = slotAssignments[0]?.room || '';
        grid[day][slot] = target;
      } else {
        grid[day][slot] = {
          id: `${day}-p${slot}`,
          day,
          periodIndex: slot,
          timeSlot: timeSlots[slot],
          subject: task.allocations[0].subject,
          room: slotAssignments[0]?.room || '',
          isBreak: false,
          isLabSession: task.lab,
          labBlockPart: task.lab ? (block.indexOf(slot) + 1) as 1 | 2 : undefined,
        };
      }
    });
    assignments.forEach(({ allocation, room }) => {
      if (allocation.subject.teacherName && normalize(allocation.subject.teacherName) !== 'tbd') {
        block.forEach((slot) => localTeacherBusy.add(key(allocation.subject.teacherName, day, slot)));
      }
      block.forEach((slot) => {
        localRoomBusy.add(key(room, day, slot));
        localBatchBusy.add(`${batchKey(divisionId, allocation.group)}::${day}::${slot}`);
        if (allocation.group === 'Whole Division') divisionBusy.add(`${divisionId}::${day}::${slot}`);
      });
      placedSubjectPeriods.set(allocation.subject.id, (placedSubjectPeriods.get(allocation.subject.id) || 0) + block.length);
    });
    placedPeriods.set(task.key, (placedPeriods.get(task.key) || 0) + task.duration);
    return previous;
  };

  type SchedulerSnapshot = {
    grid: Record<DayOfWeek, (TimetableCell | null)[]>;
    teachers: Set<string>;
    rooms: Set<string>;
    batches: Set<string>;
    divisions: Set<string>;
    taskPeriods: Map<string, number>;
    subjectPeriods: Map<string, number>;
  };
  const snapshot = (): SchedulerSnapshot => ({
    grid: Object.fromEntries(days.map((day) => [day, grid[day].map((cell) => cell ? {
      ...cell,
      activities: cell.activities?.map((activity) => ({ ...activity, subject: { ...activity.subject } })),
    } : null)])) as Record<DayOfWeek, (TimetableCell | null)[]>,
    teachers: new Set(localTeacherBusy),
    rooms: new Set(localRoomBusy),
    batches: new Set(localBatchBusy),
    divisions: new Set(divisionBusy),
    taskPeriods: new Map(placedPeriods),
    subjectPeriods: new Map(placedSubjectPeriods),
  });
  const restore = (state: SchedulerSnapshot) => {
    days.forEach((day) => { grid[day] = state.grid[day]; });
    localTeacherBusy.clear();
    state.teachers.forEach((value) => localTeacherBusy.add(value));
    localRoomBusy.clear();
    state.rooms.forEach((value) => localRoomBusy.add(value));
    localBatchBusy.clear();
    state.batches.forEach((value) => localBatchBusy.add(value));
    divisionBusy.clear();
    state.divisions.forEach((value) => divisionBusy.add(value));
    placedPeriods.clear();
    state.taskPeriods.forEach((value, taskKey) => placedPeriods.set(taskKey, value));
    placedSubjectPeriods.clear();
    state.subjectPeriods.forEach((value, subjectId) => placedSubjectPeriods.set(subjectId, value));
  };

  const search = (index: number): number => {
    if (index >= tasks.length) return 0;
    const task = tasks[index];
    const baseline = snapshot();
    const remainingRequired = tasks
      .slice(index)
      .reduce((total, remainingTask) => total + remainingTask.requiredPeriods, 0);
    let bestScore = 0;
    let bestState = baseline;
    for (const candidate of taskCandidates(task)) {
      const assignments = canPlace(task, candidate.day, candidate.block);
      if (!assignments) continue;
      apply(task, candidate.day, candidate.block, assignments);
      const score = task.duration + search(index + 1);
      if (score > bestScore) {
        bestScore = score;
        bestState = snapshot();
      }
      restore(baseline);
      if (bestScore >= remainingRequired) {
        restore(bestState);
        return bestScore;
      }
    }
    const skippedScore = search(index + 1);
    if (skippedScore > bestScore) {
      bestScore = skippedScore;
      bestState = snapshot();
    }
    restore(bestState);
    return bestScore;
  };
  if (divisionWorkload.excessPeriods === 0) search(0);
  placedSubjectPeriods.clear();
  days.forEach((day) => TEACHING_SLOTS.forEach((slot) => {
    const cell = grid[day][slot];
    if (!cell || cell.isBreak) return;
    const activities = cell.activities?.length
      ? cell.activities
      : cell.subject ? [activityFor(cell.subject, cell.room || '')] : [];
    activities.forEach((activity) => {
      placedSubjectPeriods.set(
        activity.subject.id,
        (placedSubjectPeriods.get(activity.subject.id) || 0) + 1
      );
    });
  }));
  subjects.forEach((subject) => {
    const required = Math.max(0, subject.periodsPerWeek);
    const allocated = Math.min(required, placedSubjectPeriods.get(subject.id) || 0);
    if (allocated >= required) return;
    unplaced.push({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      teacherName: subject.teacherName,
      requestedPeriods: required,
      placedPeriods: allocated,
      reason: divisionWorkload.excessPeriods > 0
        ? 'Required division occupancy exceeds the available weekly capacity.'
        : 'No valid deterministic block satisfied all teacher, room, batch, division, and break constraints.',
    });
    warnings.push(`${subject.name}: placed ${allocated}/${required} periods.`);
  });

  let filledSlots = 0;
  let lecturePeriods = 0;
  let labPeriods = 0;
  days.forEach((day) => TEACHING_SLOTS.forEach((slot) => {
    const cell = grid[day][slot];
    if (!cell?.subject && !cell?.activities?.length) return;
    filledSlots++;
    const activities = cell.activities?.length ? cell.activities : [activityFor(cell.subject!, cell.room || '')];
    activities.forEach((activity) => { if (activity.isLab) labPeriods++; else lecturePeriods++; });
  }));

  const totalRequestedPeriods = divisionWorkload.individualRequiredPeriods;
  const totalPlacedPeriods = subjects.reduce(
    (total, subject) => total + Math.min(
      Math.max(0, subject.periodsPerWeek),
      placedSubjectPeriods.get(subject.id) || 0
    ),
    0
  );
  const divisionPlacedPeriods = getPlacedDivisionPeriods(grid, days);
  const freeSlots = divisionCapacity - divisionPlacedPeriods;
  const labSeen = new Set<string>();
  days.forEach((day) => TEACHING_SLOTS.forEach((slot) => {
    const cell = grid[day][slot];
    if (!cell) return;
    const activities = cell.activities?.length ? cell.activities : cell.subject ? [activityFor(cell.subject, cell.room || '')] : [];
    activities.forEach((activity) => {
      if (!activity.isLab) return;
      const identity = `${day}:${slot}:${activity.subject.id}:${activity.studentGroup}:${activity.room}`;
      if (labSeen.has(identity)) return;
      if (activity.durationPeriods === 2 && slot !== 0) {
        const previous = grid[day][slot - 1];
        const previousActivities = previous?.activities?.length
          ? previous.activities
          : previous?.subject ? [activityFor(previous.subject, previous.room || '')] : [];
        const continues = previous && !previous.isBreak &&
          previousActivities.some((entry) =>
            entry.subject.id === activity.subject.id &&
            entry.studentGroup === activity.studentGroup &&
            entry.room === activity.room
          );
        if (continues) return;
      }
      const next = grid[day][slot + 1];
      const nextActivities = next?.activities?.length
        ? next.activities
        : next?.subject ? [activityFor(next.subject, next.room || '')] : [];
      const second = next && !next.isBreak && nextActivities.some((entry) =>
        entry.subject.id === activity.subject.id &&
        entry.studentGroup === activity.studentGroup &&
        entry.room === activity.room
      );
      labAllocations.push({
        subjectId: activity.subject.id,
        subjectName: activity.subject.name,
        subjectCode: activity.subject.code,
        teacherName: activity.teacher,
        day,
        periodNumber: cell.timeSlot.periodNumber,
        periodNumbers: second ? [cell.timeSlot.periodNumber, next!.timeSlot.periodNumber] : [cell.timeSlot.periodNumber],
        startTime: cell.timeSlot.startTime,
        endTime: second ? next!.timeSlot.endTime : cell.timeSlot.endTime,
        room: activity.room,
        durationHours: second ? 2 : 1,
        frequency: 'Weekly',
      });
    });
  }));

  const summary = `Allocated ${totalPlacedPeriods}/${totalRequestedPeriods} individual periods; division occupancy ${divisionPlacedPeriods}/${divisionCapacity}; unallocated ${Math.max(0, totalRequestedPeriods - totalPlacedPeriods)} individual periods; free slots ${freeSlots}; rejected teacher ${rejectedTeachers}, room ${rejectedRooms}, batch ${rejectedBatches}, break ${breakViolations}.`;
  warnings.push(summary);
  const generationReport: GenerationReport = {
    totalRequestedPeriods,
    totalPlacedPeriods,
    divisionRequiredPeriods: divisionWorkload.divisionRequiredPeriods,
    divisionPlacedPeriods,
    divisionCapacity,
    divisionFreeSlots: freeSlots,
    clashesAvoided: rejectedTeachers + rejectedRooms + rejectedBatches,
    clashDetails: clashes,
    unplacedSubjects: unplaced,
    labAllocations,
    successMessage: unplaced.length
      ? `Timetable generated with unsatisfied constraints. ${summary}`
      : `Timetable generated successfully. ${summary}`,
    warningMessages: warnings,
  };
  return {
    timetableKey,
    department,
    year,
    division,
    settings,
    subjects,
    timeSlots,
    grid,
    generatedAt: new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    totalPeriodsAllocated: filledSlots,
    stats: { totalWeeklySlots: days.length * TEACHING_SLOTS.length, filledSlots, freeSlots },
    generationReport,
  };
}
