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
  TimetableCell,
  TimetableSettings,
  UnplacedSubject,
} from '../types';
import {
  DEFAULT_TIMETABLE_SETTINGS,
  DEFAULT_DAYS,
  generateTimeSlots,
  isLabSubject,
} from './timetableGenerator';

const GROUPS: StudentGroup[] = ['Whole Division', 'TB1', 'TB2', 'TB3'];

interface Allocation {
  subject: Subject;
  group: StudentGroup;
}

interface ActivityGroup {
  key: string;
  logicalKey?: string;
  name: string;
  allocations: Allocation[];
  requestedPeriods: number;
  durationPeriods: 1 | 2;
  isBatch: boolean;
  isLab: boolean;
  isSequentialBatch: boolean;
}

interface BusySlot {
  teacher: string;
  room: string;
  group: StudentGroup;
}

const normalized = (value: string) => value.trim().toLowerCase();

const groupFor = (subject: Subject): StudentGroup => subject.studentGroup || 'Whole Division';

const activityTypeFor = (subject: Subject): ActivityType =>
  subject.activityType || (isLabSubject(subject) ? 'Lab' : 'Theory');

const durationFor = (subject: Subject): 1 | 2 =>
  subject.durationPeriods || (isLabSubject(subject) ? 2 : 1);

const roomTypeFor = (subject: Subject): 'lecture' | 'lab' | 'any' =>
  subject.roomType || (isLabSubject(subject) ? 'lab' : 'lecture');

const conflictsWith = (left: StudentGroup, right: StudentGroup) =>
  left === 'Whole Division' || right === 'Whole Division' || left === right;

const batchKeyFor = (subject: Subject) => {
  const codeKey = subject.code.replace(/[-_\s]?TB[1-3]$/i, '').trim();
  const nameKey = subject.name.replace(/\s*[-_]?(TB[1-3])\s*$/i, '').trim();
  return normalized(codeKey || nameKey || subject.id);
};

const isBatchSubject = (subject: Subject) => groupFor(subject) !== 'Whole Division';

const activityFor = (subject: Subject, room: string): TimetableActivity => ({
  subject,
  studentGroup: groupFor(subject),
  teacher: subject.teacherName,
  room,
  durationPeriods: durationFor(subject),
  activityType: activityTypeFor(subject),
});

const roomNameFor = (subject: Subject) => {
  const type = roomTypeFor(subject);
  if (subject.classroomNumber) {
    return type === 'lab' ? `Lab ${subject.classroomNumber}` : `Room ${subject.classroomNumber}`;
  }
  return '';
};

const roomMatchesType = (room: string, type: 'lecture' | 'lab' | 'any') => {
  const isLab = /^lab\s/i.test(room);
  return type === 'any' || (type === 'lab' ? isLab : !isLab);
};

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
  const teachingSlots = [0, 1, 3, 4, 6, 7];
  const totalWeeklySlots = days.length * teachingSlots.length;
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

  const teacherBusy = new Map<string, BusySlot>();
  const roomBusy = new Map<string, string>();
  const groupBusy = new Map<string, string>();
  const keyFor = (value: string, day: DayOfWeek, slot: number) => `${normalized(value)}__${day}__${slot}`;
  const groupKeyFor = (group: StudentGroup, day: DayOfWeek, slot: number) => `${group}__${day}__${slot}`;

  existingTimetables.forEach((timetable) => {
    const otherKey = timetable.timetableKey || `${timetable.department.id}-y${timetable.year}-${timetable.division.id}`;
    if (otherKey === timetableKey) return;
    Object.entries(timetable.grid).forEach(([day, cells]) => {
      (cells || []).forEach((cell, slot) => {
        if (!cell || cell.isBreak) return;
        const activities = cell.activities || (cell.subject ? [activityFor(cell.subject, cell.room || '')] : []);
        activities.forEach((activity) => {
          if (activity.teacher && normalized(activity.teacher) !== 'tbd') {
            teacherBusy.set(keyFor(activity.teacher, day as DayOfWeek, slot), {
              teacher: activity.teacher,
              room: activity.room,
              group: activity.studentGroup,
            });
          }
          if (activity.room) {
            roomBusy.set(keyFor(activity.room, day as DayOfWeek, slot),
              `${timetable.department.name} (Yr ${timetable.year} Div ${timetable.division.name})`);
          }
          groupBusy.set(groupKeyFor(activity.studentGroup, day as DayOfWeek, slot),
            `${timetable.department.name} (Yr ${timetable.year} Div ${timetable.division.name})`);
        });
      });
    });
  });

  const warnings: string[] = [];
  const clashes: ClashDetail[] = [];
  const unplaced: UnplacedSubject[] = [];
  const labAllocations: LabAllocation[] = [];
  let teacherConflictAttempts = 0;
  let roomConflictAttempts = 0;
  let groupConflictAttempts = 0;
  let breakViolations = 0;

  const localTeachers = new Map<string, Set<string>>();
  const localRooms = new Map<string, Set<string>>();
  const localGroups = new Map<StudentGroup, Set<string>>();
  const occupied = (map: Map<string, Set<string>>, value: string, day: DayOfWeek, slot: number) =>
    Boolean(map.get(normalized(value))?.has(`${day}__${slot}`));
  const mark = (map: Map<string, Set<string>>, value: string, day: DayOfWeek, slot: number) => {
    const key = normalized(value);
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(`${day}__${slot}`);
  };
  const groupOccupied = (group: StudentGroup, day: DayOfWeek, slot: number) =>
    GROUPS.some((other) => conflictsWith(group, other) && (
      groupBusy.has(groupKeyFor(other, day, slot)) ||
      Boolean(localGroups.get(other)?.has(`${day}__${slot}`))
    ));
  const markGroup = (group: StudentGroup, day: DayOfWeek, slot: number) => {
    if (!localGroups.has(group)) localGroups.set(group, new Set());
    localGroups.get(group)!.add(`${day}__${slot}`);
  };

  const lectureRooms = Array.from(new Set(subjects.flatMap((subject) => [
    ...(subject.suitableRooms || []),
    ...(roomNameFor(subject) ? [roomNameFor(subject)] : []),
  ]).filter((room) => roomMatchesType(room, 'lecture'))));
  const labRooms = Array.from(new Set(subjects.flatMap((subject) => [
    ...(subject.suitableRooms || []),
    ...(roomNameFor(subject) ? [roomNameFor(subject)] : []),
  ]).filter((room) => roomMatchesType(room, 'lab'))));

  const roomCandidates = (subject: Subject, day: DayOfWeek, slot: number) => {
    const type = roomTypeFor(subject);
    const supplied = (subject.suitableRooms || []).filter((room) => roomMatchesType(room, type));
    const assigned = roomNameFor(subject);
    const pool = type === 'lab' ? labRooms : type === 'lecture' ? lectureRooms : [...new Set([...lectureRooms, ...labRooms])];
    const previousSlot = teachingSlots[teachingSlots.indexOf(slot) - 1];
    const previousRoom = previousSlot === undefined ? '' : grid[day][previousSlot]?.room || '';
    const fallback = type === 'lab' ? '' : settings.defaultRoom || 'Room 101';
    return [previousRoom, ...supplied, assigned, ...pool, fallback]
      .filter((room, index, rooms) => room && rooms.indexOf(room) === index);
  };

  const blockCandidates = (duration: 1 | 2) => {
    if (duration === 1) return teachingSlots.map((slot) => [slot]);
    const blocks = teachingSlots
      .slice(0, teachingSlots.length - duration + 1)
      .map((_, index) => teachingSlots.slice(index, index + duration))
      .filter((block) => block[block.length - 1] - block[0] === duration - 1);
    return blocks.sort((left, right) => {
      const leftPostBreak = left[0] >= 3 ? 0 : 1;
      const rightPostBreak = right[0] >= 3 ? 0 : 1;
      return leftPostBreak - rightPostBreak;
    });
  };

  const activityGroups = new Map<string, ActivityGroup>();
  subjects.forEach((subject) => {
    const group = groupFor(subject);
    const key = isBatchSubject(subject) ? `batch:${batchKeyFor(subject)}` : `whole:${subject.id}`;
    const existing = activityGroups.get(key);
    if (existing) {
      existing.allocations.push({ subject, group });
      existing.requestedPeriods = Math.max(existing.requestedPeriods, Math.max(0, subject.periodsPerWeek));
      existing.durationPeriods = Math.max(existing.durationPeriods, durationFor(subject)) as 1 | 2;
      existing.isLab = existing.isLab || isLabSubject(subject);
    } else {
      activityGroups.set(key, {
        key,
        name: subject.name,
        allocations: [{ subject, group }],
        requestedPeriods: Math.max(0, subject.periodsPerWeek),
        durationPeriods: durationFor(subject),
        isBatch: isBatchSubject(subject),
        isLab: isLabSubject(subject),
        isSequentialBatch: false,
      });
    }
  });

  activityGroups.forEach((activity) => {
    const distinctGroups = new Set(activity.allocations.map((allocation) => allocation.group));
    if (distinctGroups.size !== activity.allocations.length) {
      warnings.push(`${activity.name}: duplicate student-group allocation detected; only one allocation per batch can be scheduled.`);
      activity.allocations = activity.allocations.filter((allocation, index, allocations) =>
        allocations.findIndex((candidate) => candidate.group === allocation.group) === index
      );
    }
    const requestedValues = new Set(activity.allocations.map((allocation) => allocation.subject.periodsPerWeek));
    if (requestedValues.size > 1) {
      warnings.push(`${activity.name}: batch period counts differ; using ${activity.requestedPeriods} shared periods.`);
    }
    const teachers = new Set(activity.allocations
      .map((allocation) => normalized(allocation.subject.teacherName))
      .filter((teacher) => teacher && teacher !== 'tbd'));
    activity.isSequentialBatch = activity.isBatch && teachers.size === 1;
  });

  const orderedGroups = [...activityGroups.values()].sort((left, right) =>
    Number(right.durationPeriods > 1) - Number(left.durationPeriods > 1) ||
    Number(right.isBatch) - Number(left.isBatch) ||
    right.requestedPeriods - left.requestedPeriods
  );
  const scheduledGroups = orderedGroups.flatMap((activity) => {
    if (!activity.isSequentialBatch) return [activity];
    return activity.allocations.map((allocation) => ({
      ...activity,
      key: `${activity.key}:${allocation.group}`,
      logicalKey: activity.key,
      allocations: [allocation],
      requestedPeriods: Math.max(0, allocation.subject.periodsPerWeek),
      isSequentialBatch: false,
    }));
  });
  const placedPeriods = new Map<string, number>();
  const logicalPlacedPeriods = new Map<string, number>();

  const rotationCandidates = scheduledGroups.filter((activity) =>
    Boolean(activity.logicalKey) && activity.isBatch
  );
  const rotationDurationOptions: (1 | 2)[] = [2, 1];

  const conflictingDivision = (teacher: string, day: DayOfWeek, slot: number) => {
    const conflict = teacherBusy.get(keyFor(teacher, day, slot));
    return conflict ? conflict.teacher : 'Current timetable';
  };

  const canPlace = (activity: ActivityGroup, day: DayOfWeek, block: number[]) => {
    if (activity.durationPeriods === 2 && block[1] - block[0] !== 1) {
      breakViolations++;
      return null;
    }
    const roomsByGroup = new Map<StudentGroup, string>();
    const assignments: { allocation: Allocation; room: string; slot: number }[] = [];
    for (const slot of block) {
      const cell = grid[day][slot];
      const cellActivities = cell?.activities || (cell?.subject ? [activityFor(cell.subject, cell.room || '')] : []);
      const hasWholeActivity = cellActivities.some((existing) => existing.studentGroup === 'Whole Division');
      const usedRooms = new Set<string>();
      const teachersInSlot = new Set<string>();
      for (const allocation of activity.allocations) {
        if (hasWholeActivity || (allocation.group === 'Whole Division' && cell)) return null;
        if (groupOccupied(allocation.group, day, slot)) {
          groupConflictAttempts++;
          return null;
        }
        const teacher = normalized(allocation.subject.teacherName);
        if (teacher && teacher !== 'tbd' && (teachersInSlot.has(teacher) ||
          teacherBusy.has(keyFor(allocation.subject.teacherName, day, slot)) ||
          occupied(localTeachers, allocation.subject.teacherName, day, slot))) {
          teacherConflictAttempts++;
          clashes.push({
            teacherName: allocation.subject.teacherName,
            subjectName: activity.name,
            conflictDay: day,
            conflictPeriod: timeSlots[slot].periodNumber,
            conflictingDivision: conflictingDivision(allocation.subject.teacherName, day, slot),
            shiftedToDay: day,
            shiftedToPeriod: 0,
            resolutionNote: 'Teacher conflict prevented atomic activity placement.',
          });
          return null;
        }
        const previousRoom = roomsByGroup.get(allocation.group);
        const room = (previousRoom ? [previousRoom, ...roomCandidates(allocation.subject, day, slot)] :
          roomCandidates(allocation.subject, day, slot)).find((candidate) =>
            !usedRooms.has(normalized(candidate)) &&
            !roomBusy.has(keyFor(candidate, day, slot)) &&
            !occupied(localRooms, candidate, day, slot)
          );
        if (!room) {
          roomConflictAttempts++;
          return null;
        }
        usedRooms.add(normalized(room));
        roomsByGroup.set(allocation.group, room);
        if (teacher && teacher !== 'tbd') teachersInSlot.add(teacher);
        assignments.push({ allocation, room, slot });
      }
    }
    return assignments;
  };

  const commit = (activity: ActivityGroup, day: DayOfWeek, block: number[], assignments: { allocation: Allocation; room: string; slot: number }[]) => {
    const representative = activity.allocations[0].subject;
    for (const slot of block) {
      const cell = grid[day][slot];
      const slotAssignments = assignments.filter((assignment) => assignment.slot === slot);
      const firstRoom = slotAssignments[0]?.room || '';
      if (activity.isBatch) {
        const target = cell || {
          id: `${day}-p${slot}`,
          day,
          periodIndex: slot,
          timeSlot: timeSlots[slot],
          isBreak: false,
          activities: [],
        };
        target.activities = [...(target.activities || []), ...slotAssignments.map(({ allocation, room }) => activityFor(allocation.subject, room))];
        if (!target.subject) target.subject = representative;
        target.room = firstRoom;
        grid[day][slot] = target;
      } else {
        grid[day][slot] = {
          id: `${day}-p${slot}`,
          day,
          periodIndex: slot,
          timeSlot: timeSlots[slot],
          subject: representative,
          room: firstRoom,
          isBreak: false,
          isLabSession: activity.isLab,
          labBlockPart: activity.isLab ? (block.indexOf(slot) + 1) as 1 | 2 : undefined,
        };
      }
      slotAssignments.forEach(({ allocation, room }) => {
        if (allocation.subject.teacherName && normalized(allocation.subject.teacherName) !== 'tbd') mark(localTeachers, allocation.subject.teacherName, day, slot);
        mark(localRooms, room, day, slot);
        markGroup(allocation.group, day, slot);
      });
    }
    placedPeriods.set(activity.key, (placedPeriods.get(activity.key) || 0) + block.length);
    if (!activity.logicalKey) {
      logicalPlacedPeriods.set(activity.key, placedPeriods.get(activity.key) || 0);
    }
    if (activity.isLab) {
      labAllocations.push({
        subjectId: representative.id,
        subjectName: activity.name,
        subjectCode: representative.code,
        teacherName: representative.teacherName,
        day,
        periodNumber: timeSlots[block[0]].periodNumber,
        periodNumbers: block.map((slot) => timeSlots[slot].periodNumber),
        startTime: timeSlots[block[0]].startTime,
        endTime: timeSlots[block[block.length - 1]].endTime,
        room: assignments[0]?.room || '',
        durationHours: block.length,
        frequency: 'Weekly',
      });
    }
  };

  // Coordinate different activities across TB1/TB2/TB3 before placing any
  // remaining batch activity independently. This is the college rotation model.
  rotationDurationOptions.forEach((duration) => {
    let progress = true;
    while (progress) {
      progress = false;
      const candidatesByBatch = GROUPS.slice(1).map((batch) =>
        rotationCandidates.filter((activity) =>
          activity.durationPeriods === duration &&
          activity.allocations[0].group === batch &&
          (placedPeriods.get(activity.key) || 0) + duration <= activity.requestedPeriods
        )
      );
      if (candidatesByBatch.some((candidates) => candidates.length === 0)) break;

      const combinations: ActivityGroup[][] = [];
      const buildCombinations = (index: number, current: ActivityGroup[]) => {
        if (index === candidatesByBatch.length) {
          combinations.push([...current]);
          return;
        }
        candidatesByBatch[index].forEach((candidate) => {
          current.push(candidate);
          buildCombinations(index + 1, current);
          current.pop();
        });
      };
      buildCombinations(0, []);

      const rotationPlaced = combinations.some((combination) => {
        const rotation: ActivityGroup = {
          key: `rotation:${combination.map((activity) => activity.key).join('|')}`,
          name: combination.map((activity) => activity.name).join(' / '),
          allocations: combination.flatMap((activity) => activity.allocations),
          requestedPeriods: duration,
          durationPeriods: duration,
          isBatch: true,
          isLab: combination.some((activity) => activity.isLab),
          isSequentialBatch: false,
        };
        return blockCandidates(duration).some((block) => days.some((day) => {
          const assignments = canPlace(rotation, day, block);
          if (!assignments) return false;
          commit(rotation, day, block, assignments);
          combination.forEach((activity) => {
            placedPeriods.set(activity.key, (placedPeriods.get(activity.key) || 0) + duration);
          });
          return true;
        }));
      });
      progress = rotationPlaced;
    }
  });

  scheduledGroups.forEach((activity) => {
    const blocks = blockCandidates(activity.durationPeriods);
    while ((placedPeriods.get(activity.key) || 0) + activity.durationPeriods <= activity.requestedPeriods) {
      const candidates = days.flatMap((day) => blocks.map((block) => ({
        day,
        block,
        existingBatchActivities: block.reduce((count, slot) => count +
          (grid[day][slot]?.activities?.filter((entry) => entry.studentGroup !== 'Whole Division').length || 0), 0),
        dailyCount: activity.allocations.reduce((count, allocation) => count +
          (grid[day].filter((cell) => cell?.subject?.id === allocation.subject.id || cell?.activities?.some((entry) => entry.subject.id === allocation.subject.id)).length), 0),
        free: teachingSlots.filter((slot) => grid[day][slot] === null).length,
      }))).sort((left, right) => right.existingBatchActivities - left.existingBatchActivities ||
        left.dailyCount - right.dailyCount || right.free - left.free);
      const candidate = candidates.find(({ day, block }) => {
        const assignments = canPlace(activity, day, block);
        if (!assignments) return false;
        commit(activity, day, block, assignments);
        return true;
      });
      if (!candidate) break;
    }
  });

  orderedGroups.forEach((activity) => {
    const batchPlacements = scheduledGroups
      .filter((scheduled) => scheduled.logicalKey === activity.key)
      .map((scheduled) => placedPeriods.get(scheduled.key) || 0);
    const placed = activity.isSequentialBatch
      ? Math.min(...batchPlacements, activity.requestedPeriods)
      : logicalPlacedPeriods.get(activity.key) || 0;
    logicalPlacedPeriods.set(activity.key, placed);
    if (placed < activity.requestedPeriods) {
      const representative = activity.allocations[0].subject;
      unplaced.push({
        subjectId: representative.id,
        subjectName: activity.name,
        subjectCode: representative.code,
        teacherName: representative.teacherName,
        requestedPeriods: activity.requestedPeriods,
        placedPeriods: placed,
        reason: activity.isBatch
          ? 'Parallel batch placement could not find one shared block with available teachers, groups, and distinct suitable rooms.'
          : 'No valid teaching block satisfied the teacher, room, group, and break constraints.',
      });
      warnings.push(`${activity.name}: placed ${placed}/${activity.requestedPeriods} periods.`);
    }
  });

  let filledSlots = 0;
  let teacherConflicts = 0;
  let roomConflicts = 0;
  let batchConflicts = 0;
  const seenTeachers = new Set<string>();
  const seenRooms = new Set<string>();
  const seenGroups = new Set<StudentGroup>();
  days.forEach((day) => teachingSlots.forEach((slot) => {
    const cell = grid[day][slot];
    if (!cell?.subject && !cell?.activities?.length) return;
    filledSlots++;
    const activities = cell.activities?.length
      ? cell.activities
      : [activityFor(cell.subject!, cell.room || '')];
    activities.forEach((activity) => {
      const teacherKey = keyFor(activity.teacher, day, slot);
      const roomKey = keyFor(activity.room, day, slot);
      if (activity.teacher && seenTeachers.has(teacherKey)) teacherConflicts++;
      if (activity.room && seenRooms.has(roomKey)) roomConflicts++;
      if ([...seenGroups].some((group) => conflictsWith(group, activity.studentGroup))) batchConflicts++;
      seenTeachers.add(teacherKey);
      seenRooms.add(roomKey);
      seenGroups.add(activity.studentGroup);
    });
    seenGroups.clear();
  }));

  const totalRequestedPeriods = orderedGroups.reduce((sum, activity) => sum + activity.requestedPeriods, 0);
  const placedTotal = orderedGroups.reduce((sum, activity) => sum + (logicalPlacedPeriods.get(activity.key) || 0), 0);
  const freeSlots = totalWeeklySlots - filledSlots;
  const subjectSummary = orderedGroups.map((activity) =>
    activity.isSequentialBatch
      ? `${activity.name}: ${scheduledGroups.filter((scheduled) => scheduled.logicalKey === activity.key &&
        (placedPeriods.get(scheduled.key) || 0) >= scheduled.requestedPeriods).length}/${activity.allocations.length} batch allocations completed`
      : `${activity.name}: ${logicalPlacedPeriods.get(activity.key) || 0}/${activity.requestedPeriods}`
  ).join('; ');
  const summary = `${subjectSummary}. Free slots: ${freeSlots}; Teacher conflicts: ${teacherConflicts}; Room conflicts: ${roomConflicts}; Batch conflicts: ${batchConflicts}; Break violations: ${breakViolations}.`;
  warnings.push(`Validation summary: ${summary}`);
  const success = unplaced.length === 0 && teacherConflicts === 0 && roomConflicts === 0 &&
    batchConflicts === 0 && breakViolations === 0;
  const generationReport: GenerationReport = {
    totalRequestedPeriods,
    totalPlacedPeriods: placedTotal,
    clashesAvoided: teacherConflictAttempts + roomConflictAttempts + groupConflictAttempts,
    clashDetails: clashes,
    unplacedSubjects: unplaced,
    labAllocations,
    successMessage: success
      ? `Timetable generated successfully. ${summary}`
      : `Timetable generated with unsatisfied constraints. ${summary}`,
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
    stats: { totalWeeklySlots, filledSlots, freeSlots },
    generationReport,
  };
}