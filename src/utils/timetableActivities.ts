import {
  ActivityType,
  StudentGroup,
  TimetableActivity,
  TimetableActivityType,
  TimetableCell,
} from '../types';
import { isLabSubject } from './timetableGenerator';

const activityModeFor = (
  studentGroup: StudentGroup,
  activityMode?: TimetableActivityType
): TimetableActivityType => activityMode || (
  studentGroup === 'Whole Division' ? 'WHOLE_DIVISION' : 'ROTATIONAL_BATCH'
);

const courseActivityTypeFor = (cell: TimetableCell): ActivityType =>
  cell.subject?.activityType || (isLabSubject(cell.subject!) ? 'Lab' : 'Theory');

/**
 * Returns the detailed activities represented by a cell without counting its
 * compatibility subject field as a second activity.
 */
export function normalizeCellActivities(cell: TimetableCell): TimetableActivity[] {
  if (cell.activities?.length) {
    return cell.activities.map((activity) => ({
      ...activity,
      activityMode: activityModeFor(activity.studentGroup, activity.activityMode),
      isLab: activity.isLab ?? activity.subject.isLab ?? activity.activityType === 'Lab',
    }));
  }

  if (!cell.subject || cell.isBreak) return [];

  const studentGroup = cell.subject.studentGroup || 'Whole Division';
  return [{
    subject: cell.subject,
    studentGroup,
    teacher: cell.subject.teacherName,
    room: cell.room || '',
    durationPeriods: cell.subject.durationPeriods || (isLabSubject(cell.subject) ? 2 : 1),
    activityType: courseActivityTypeFor(cell),
    activityMode: activityModeFor(studentGroup, cell.subject.activityMode),
    isLab: cell.subject.isLab ?? isLabSubject(cell.subject),
  }];
}
