import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicYear,
  DayOfWeek,
  Department,
  Division,
  GeneratedTimetable,
} from '../types';
import { normalizeCellActivities } from '../utils/timetableActivities';

export interface TeacherSlotAssignment {
  teacherName: string;
  day: DayOfWeek;
  periodIndex: number;
  periodNumber: number;
  departmentId: string;
  departmentName: string;
  year: AcademicYear;
  divisionId: string;
  divisionName: string;
  subjectName: string;
  subjectCode: string;
  room?: string;
}

export interface TimetableContextType {
  allTimetables: GeneratedTimetable[];
  saveTimetable: (timetable: GeneratedTimetable) => void;
  getTimetable: (
    deptId: string,
    year: AcademicYear,
    divId: string
  ) => GeneratedTimetable | undefined;
  deleteTimetable: (timetableKey: string) => void;
  clearAllTimetables: () => void;
  getAllTeacherAssignments: () => TeacherSlotAssignment[];
  getTeacherAssignmentsForSlot: (
    day: DayOfWeek,
    periodIndex: number
  ) => TeacherSlotAssignment[];
  totalDivisionsCount: number;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'college_timetables_global_store_v1';

export function getTimetableStorageKey(
  deptId: string,
  year: AcademicYear,
  divId: string
): string {
  return `${deptId}-y${year}-${divId}`;
}

export const TimetableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allTimetables, setAllTimetables] = useState<GeneratedTimetable[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved timetables from localStorage:', e);
    }
    return [];
  });

  // Sync with localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTimetables));
    } catch (e) {
      console.error('Error saving timetables to localStorage:', e);
    }
  }, [allTimetables]);

  const saveTimetable = (timetable: GeneratedTimetable) => {
    const key =
      timetable.timetableKey ||
      getTimetableStorageKey(
        timetable.department.id,
        timetable.year,
        timetable.division.id
      );

    const fullTimetable: GeneratedTimetable = {
      ...timetable,
      timetableKey: key,
    };

    setAllTimetables((prev) => {
      const filtered = prev.filter((t) => {
        const tKey =
          t.timetableKey ||
          getTimetableStorageKey(t.department.id, t.year, t.division.id);
        return tKey !== key;
      });
      return [...filtered, fullTimetable];
    });
  };

  const getTimetable = (
    deptId: string,
    year: AcademicYear,
    divId: string
  ): GeneratedTimetable | undefined => {
    const targetKey = getTimetableStorageKey(deptId, year, divId);
    return allTimetables.find((t) => {
      const tKey =
        t.timetableKey ||
        getTimetableStorageKey(t.department.id, t.year, t.division.id);
      return tKey === targetKey;
    });
  };

  const deleteTimetable = (timetableKey: string) => {
    setAllTimetables((prev) =>
      prev.filter((t) => {
        const tKey =
          t.timetableKey ||
          getTimetableStorageKey(t.department.id, t.year, t.division.id);
        return tKey !== timetableKey;
      })
    );
  };

  const clearAllTimetables = () => {
    setAllTimetables([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  };

  // Collect all teacher assignments across all divisions and departments
  const getAllTeacherAssignments = (): TeacherSlotAssignment[] => {
    const assignments: TeacherSlotAssignment[] = [];

    allTimetables.forEach((tt) => {
      const days = tt.settings?.days || Object.keys(tt.grid) as DayOfWeek[];
      days.forEach((day) => {
        const slots = tt.grid[day] || [];
        slots.forEach((cell, pIdx) => {
          if (!cell || cell.isBreak) return;
          normalizeCellActivities(cell).forEach((activity) => {
            if (!activity.teacher) return;
            assignments.push({
              teacherName: activity.teacher,
              day,
              periodIndex: pIdx,
              periodNumber: cell.timeSlot?.periodNumber || pIdx + 1,
              departmentId: tt.department.id,
              departmentName: tt.department.name,
              year: tt.year,
              divisionId: tt.division.id,
              divisionName: tt.division.name,
              subjectName: activity.subject.name,
              subjectCode: activity.subject.code,
              room: activity.room || cell.room,
            });
          });
        });
      });
    });

    return assignments;
  };

  const getTeacherAssignmentsForSlot = (
    day: DayOfWeek,
    periodIndex: number
  ): TeacherSlotAssignment[] => {
    return getAllTeacherAssignments().filter(
      (a) => a.day === day && a.periodIndex === periodIndex
    );
  };

  return (
    <TimetableContext.Provider
      value={{
        allTimetables,
        saveTimetable,
        getTimetable,
        deleteTimetable,
        clearAllTimetables,
        getAllTeacherAssignments,
        getTeacherAssignmentsForSlot,
        totalDivisionsCount: allTimetables.length,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

export function useTimetables(): TimetableContextType {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetables must be used within a TimetableProvider');
  }
  return context;
}
