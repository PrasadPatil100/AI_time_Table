import { Subject, TimetableCell } from '../types';
import { isLabSubject } from './timetableGenerator';

export interface DivisionWorkload {
  individualRequiredPeriods: number;
  divisionRequiredPeriods: number;
  wholeDivisionPeriods: number;
  groupedBatchPeriods: number;
  ungroupedBatchPeriods: number;
  capacity: number;
  expectedFreeSlots: number;
  excessPeriods: number;
}

const durationFor = (subject: Subject) =>
  subject.durationPeriods || (isLabSubject(subject) ? 2 : 1);

const isWholeDivision = (subject: Subject) =>
  subject.studentGroup === 'Whole Division' || subject.activityMode === 'WHOLE_DIVISION';

export function getDivisionWorkload(subjects: Subject[], capacity: number): DivisionWorkload {
  const individualRequiredPeriods = subjects.reduce(
    (total, subject) => total + Math.max(0, subject.periodsPerWeek || 0),
    0
  );
  const wholeDivisionPeriods = subjects
    .filter(isWholeDivision)
    .reduce((total, subject) => total + Math.max(0, subject.periodsPerWeek || 0), 0);
  const grouped = new Map<string, Subject[]>();
  const ungroupedBatchPeriods = subjects
    .filter((subject) => !isWholeDivision(subject) && !subject.activityGroupId)
    .reduce((total, subject) => total + Math.max(0, subject.periodsPerWeek || 0), 0);

  subjects
    .filter((subject) => !isWholeDivision(subject) && subject.activityGroupId)
    .forEach((subject) => {
      const activities = grouped.get(subject.activityGroupId!) || [];
      grouped.set(subject.activityGroupId!, [...activities, subject]);
    });

  const groupedBatchPeriods = [...grouped.values()].reduce((total, activities) => {
    const duration = Math.max(...activities.map(durationFor));
    const sessions = Math.max(...activities.map((subject) =>
      Math.ceil(Math.max(0, subject.periodsPerWeek || 0) / durationFor(subject))
    ));
    return total + sessions * duration;
  }, 0);
  const divisionRequiredPeriods = wholeDivisionPeriods + ungroupedBatchPeriods + groupedBatchPeriods;

  return {
    individualRequiredPeriods,
    divisionRequiredPeriods,
    wholeDivisionPeriods,
    groupedBatchPeriods,
    ungroupedBatchPeriods,
    capacity,
    expectedFreeSlots: Math.max(0, capacity - divisionRequiredPeriods),
    excessPeriods: Math.max(0, divisionRequiredPeriods - capacity),
  };
}

export function getPlacedDivisionPeriods(
  grid: Record<string, (TimetableCell | null)[]>,
  days: string[]
): number {
  return days.reduce(
    (total, day) => total + (grid[day] || []).filter((cell) => Boolean(cell && !cell.isBreak)).length,
    0
  );
}
