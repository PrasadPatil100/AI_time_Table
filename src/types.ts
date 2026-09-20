export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type AcademicYear = 1 | 2 | 3 | 4;

export interface YearOption {
  year: AcademicYear;
  title: string;
  label: string;
  shortCode: string;
  semesters: string;
  badge: string;
  focus: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  iconName: string;
  accentColor: string; // e.g. 'emerald', 'blue', 'purple', 'amber', 'rose', 'cyan', 'indigo'
  description: string;
  isCustom?: boolean;
}

export type ActivityType =
  | 'Theory'
  | 'Lab'
  | 'Tutorial'
  | 'Project'
  | 'Presentation'
  | 'Skill'
  | 'Elective'
  | 'Other';

export type StudentGroup = 'Whole Division' | 'TB1' | 'TB2' | 'TB3';

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  /** Total individual teaching periods required per week. */
  periodsPerWeek: number;
  color: string; // hex or Tailwind color token
  bgLight: string;
  borderClass: string;
  textClass: string;
  /** Optional metadata for richer activities; omitted values keep current behavior. */
  activityType?: ActivityType;
  studentGroup?: StudentGroup;
  durationPeriods?: 1 | 2;
  isLab?: boolean;
  classroomNumber?: number; // Classroom numbering 1 to 100
  roomType?: 'lecture' | 'lab' | 'any';
  suitableRooms?: string[];
  buildingWing?: string;
  roomCapacity?: number;
}

export interface Division {
  id: string;
  name: string;
  roomNumber?: string;
  isCustom?: boolean;
}

export interface TimeSlot {
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  breakType?: 'recess' | 'lunch' | 'water';
  breakTitle?: string;
}

export interface TimetableActivity {
  subject: Subject;
  studentGroup: StudentGroup;
  teacher: string;
  room: string;
  durationPeriods: 1 | 2;
  activityType: ActivityType;
}

export interface TimetableCell {
  id: string;
  day: DayOfWeek;
  periodIndex: number;
  timeSlot: TimeSlot;
  subject?: Subject;
  activities?: TimetableActivity[];
  room?: string;
  isBreak?: boolean;
  breakTitle?: string;
  isLabSession?: boolean;
  labBlockPart?: 1 | 2;
  labBlockTitle?: string;
  isDoubleLabDay?: boolean;
}

export interface TimetableSettings {
  days: DayOfWeek[];
  periodsPerDay: number; // 6 academic periods per day (P1 to P6)
  includeSaturday: boolean;
  startTime: string; // "09:30"
  endTime?: string; // "17:00"
  periodDurationMinutes: number; // 60
  includeMorningRecess?: boolean;
  recessAfterPeriod?: number;
  recessDurationMinutes?: number;
  waterBreakDurationMinutes: number; // 15
  lunchAfterPeriod?: number;
  lunchDurationMinutes: number; // 60
  defaultRoom: string;
}

export interface ClashDetail {
  teacherName: string;
  subjectName: string;
  conflictDay: DayOfWeek;
  conflictPeriod: number;
  conflictingDivision: string;
  shiftedToDay: DayOfWeek;
  shiftedToPeriod: number;
  resolutionNote: string;
}

export interface UnplacedSubject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  requestedPeriods: number;
  placedPeriods: number;
  reason: string;
}

export interface LabAllocation {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  day: DayOfWeek;
  periodNumber: number; // primary starting period (e.g. 1 or 5)
  periodNumbers: number[]; // e.g. [1, 2] or [5, 6] (2 hours continuous)
  startTime: string;
  endTime: string;
  room: string;
  durationHours: number; // 2 hours
  frequency: string;
  isDoubleLabDay?: boolean;
}

export interface GenerationReport {
  totalRequestedPeriods: number;
  totalPlacedPeriods: number;
  clashesAvoided: number;
  clashDetails: ClashDetail[];
  unplacedSubjects: UnplacedSubject[];
  labAllocations: LabAllocation[];
  successMessage: string;
  warningMessages: string[];
}

export interface GeneratedTimetable {
  timetableKey?: string; // e.g. "dept-cse-y2-div-a"
  department: Department;
  year: AcademicYear;
  division: Division;
  settings: TimetableSettings;
  subjects: Subject[];
  timeSlots: TimeSlot[];
  grid: Record<DayOfWeek, (TimetableCell | null)[]>;
  generatedAt: string;
  totalPeriodsAllocated: number;
  stats: {
    totalWeeklySlots: number;
    filledSlots: number;
    freeSlots: number;
  };
  generationReport?: GenerationReport;
}
