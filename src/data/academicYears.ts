import { YearOption } from '../types';

export const ACADEMIC_YEARS: YearOption[] = [
  {
    year: 1,
    title: '1st Year',
    label: 'First Year (FE)',
    shortCode: 'FE',
    semesters: 'Semesters I & II',
    badge: 'Freshman',
    focus: 'Foundational Sciences, Engineering Mathematics & Basic Computing Principles',
  },
  {
    year: 2,
    title: '2nd Year',
    label: 'Second Year (SE)',
    shortCode: 'SE',
    semesters: 'Semesters III & IV',
    badge: 'Sophomore',
    focus: 'Core Departmental Fundamentals, Data Structures & Applied Laboratory Work',
  },
  {
    year: 3,
    title: '3rd Year',
    label: 'Third Year (TE)',
    shortCode: 'TE',
    semesters: 'Semesters V & VI',
    badge: 'Junior',
    focus: 'Advanced Specialization, Distributed Systems & Core Industry Electives',
  },
  {
    year: 4,
    title: '4th Year',
    label: 'Final Year (BE)',
    shortCode: 'BE',
    semesters: 'Semesters VII & VIII',
    badge: 'Senior',
    focus: 'Capstone Major Project, Emerging Technologies & Professional Practicum',
  },
];
