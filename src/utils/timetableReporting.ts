import {
  GeneratedTimetable,
  StudentGroup,
  TimetableActivity,
  TimetableCell,
} from '../types';
import { normalizeCellActivities } from './timetableActivities';

export interface TimetableReportingMetrics {
  requiredPeriods: number;
  allocatedPeriods: number;
  unallocatedPeriods: number;
  requiredLabSessions: number;
  labSessions: number;
  unallocatedLabSessions: number;
  lecturePeriods: number;
  labOccupiedPeriods: number;
  batchAllocations: number;
  wholeDivisionActivities: number;
  freeSlots: number;
}

export interface DetailedLabAllocation {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  studentGroup: StudentGroup;
  teacherName: string;
  day: string;
  periodNumber: number;
  periodNumbers: number[];
  startTime: string;
  endTime: string;
  room: string;
  durationHours: number;
  isLab: true;
}

const isLabActivity = (activity: TimetableActivity) =>
  activity.isLab ?? activity.subject.isLab ?? activity.activityType === 'Lab';

const activityKey = (activity: TimetableActivity) => [
  activity.subject.id,
  activity.studentGroup,
  activity.teacher,
  activity.room,
].join('|');

const isSameActivity = (left: TimetableActivity, right: TimetableActivity) =>
  activityKey(left) === activityKey(right);

const isActivityStart = (
  cells: (TimetableCell | null)[],
  periodIndex: number,
  activity: TimetableActivity
) => {
  if (activity.durationPeriods !== 2 || periodIndex === 0) return true;
  const previousCell = cells[periodIndex - 1];
  if (!previousCell || previousCell.isBreak) return true;
  return !normalizeCellActivities(previousCell).some((previousActivity) =>
    isSameActivity(previousActivity, activity)
  );
};

export function getTimetableReportingMetrics(
  timetable: GeneratedTimetable
): TimetableReportingMetrics {
  const requiredPeriods = timetable.subjects.reduce(
    (total, subject) => total + Math.max(0, subject.periodsPerWeek || 0),
    0
  );
  const requiredLabSessions = timetable.subjects.reduce(
    (total, subject) => total + (
      subject.isLab || subject.roomType === 'lab' || subject.activityType === 'Lab'
        ? Math.ceil(Math.max(0, subject.periodsPerWeek || 0) / 2)
        : 0
    ),
    0
  );

  let lecturePeriods = 0;
  let labOccupiedPeriods = 0;
  let labSessions = 0;
  let batchAllocations = 0;
  let wholeDivisionActivities = 0;
  let occupiedSlots = 0;

  timetable.settings.days.forEach((day) => {
    const cells = timetable.grid[day] || [];
    cells.forEach((cell, periodIndex) => {
      if (!cell || cell.isBreak) return;
      const activities = normalizeCellActivities(cell);
      if (!activities.length) return;
      occupiedSlots += 1;

      activities.forEach((activity) => {
        const lab = isLabActivity(activity);
        if (lab) {
          labOccupiedPeriods += 1;
        } else {
          lecturePeriods += 1;
        }

        if (!isActivityStart(cells, periodIndex, activity)) return;
        if (lab) labSessions += 1;
        if (activity.activityMode === 'WHOLE_DIVISION' || activity.studentGroup === 'Whole Division') {
          wholeDivisionActivities += 1;
        } else {
          batchAllocations += 1;
        }
      });
    });
  });

  const allocatedPeriods = lecturePeriods + labOccupiedPeriods;
  const freeSlots = timetable.stats?.freeSlots ?? Math.max(
    0,
    timetable.stats?.totalWeeklySlots - occupiedSlots
  );

  return {
    requiredPeriods,
    allocatedPeriods,
    unallocatedPeriods: Math.max(0, requiredPeriods - allocatedPeriods),
    requiredLabSessions,
    labSessions,
    unallocatedLabSessions: Math.max(0, requiredLabSessions - labSessions),
    lecturePeriods,
    labOccupiedPeriods,
    batchAllocations,
    wholeDivisionActivities,
    freeSlots,
  };
}

export function getDetailedLabAllocations(
  timetable: GeneratedTimetable
): DetailedLabAllocation[] {
  const allocations: DetailedLabAllocation[] = [];

  timetable.settings.days.forEach((day) => {
    const cells = timetable.grid[day] || [];
    cells.forEach((cell, periodIndex) => {
      if (!cell || cell.isBreak) return;

      normalizeCellActivities(cell).forEach((activity) => {
        if (!isLabActivity(activity) || !isActivityStart(cells, periodIndex, activity)) return;

        const block = [periodIndex];
        if (activity.durationPeriods === 2) {
          const nextCell = cells[periodIndex + 1];
          if (
            nextCell &&
            !nextCell.isBreak &&
            normalizeCellActivities(nextCell).some((nextActivity) =>
              isSameActivity(nextActivity, activity)
            )
          ) {
            block.push(periodIndex + 1);
          }
        }

        const periodNumbers = block
          .map((index) => cells[index]?.timeSlot.periodNumber || 0)
          .filter((periodNumber) => periodNumber > 0);
        const firstCell = cells[block[0]];
        const lastCell = cells[block[block.length - 1]];

        allocations.push({
          subjectId: activity.subject.id,
          subjectName: activity.subject.name,
          subjectCode: activity.subject.code,
          studentGroup: activity.studentGroup,
          teacherName: activity.teacher,
          day,
          periodNumber: periodNumbers[0] || firstCell.timeSlot.periodNumber,
          periodNumbers,
          startTime: firstCell.timeSlot.startTime,
          endTime: lastCell.timeSlot.endTime,
          room: activity.room || firstCell.room || '',
          durationHours: block.length,
          isLab: true,
        });
      });
    });
  });

  return allocations;
}
