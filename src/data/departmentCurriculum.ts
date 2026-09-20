import { AcademicYear, Subject } from '../types';
import { COLOR_PALETTES } from './colorPalettes';

// Helper to assemble subjects with alternating aesthetic palettes
function createSubjectList(
  deptPrefix: string,
  year: AcademicYear,
  items: { name: string; teacher: string; periods?: number; codeSuffix?: string; isLab?: boolean }[]
): Subject[] {
  return items.map((item, idx) => {
    const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];
    const codeNum = `${year}0${idx + 1}`;
    const isLab =
      item.isLab ??
      /lab|practicum|cad|modeling|workshop|practical/i.test(item.name);
    // Numbering start from 1 to 100
    const classroomNumber = isLab
      ? (((idx * 4 + 6) % 100) || 1)
      : (((idx * 5 + 15) % 100) || 1);

    return {
      id: `${deptPrefix.toLowerCase()}-y${year}-${idx + 1}`,
      name: item.name,
      code: `${deptPrefix}${item.codeSuffix || codeNum}`,
      teacherName: item.teacher,
      periodsPerWeek: isLab ? 2 : (item.periods || 4), // 2 hours for practical lab session
      color: palette.color,
      bgLight: palette.bgLight,
      borderClass: palette.borderClass,
      textClass: palette.textClass,
      isLab,
      roomType: isLab ? 'lab' : 'lecture',
      classroomNumber,
    };
  });
}

// 1st Year (FE) Common / Foundational Engineering Courses - Max 8 Subjects (4 Theory + 4 Labs)
function getFirstYearCourses(deptCode: string): Subject[] {
  return createSubjectList(deptCode, 1, [
    { name: 'Engineering Mathematics - I', teacher: 'Dr. Kavita Verma', periods: 6 },
    { name: 'Engineering Physics & Optics', teacher: 'Dr. Suresh Joshi', periods: 6 },
    { name: 'Basic Electrical & Electronics (BEEE)', teacher: 'Prof. Anjali Saxena', periods: 6 },
    { name: 'Problem Solving & Programming (Python)', teacher: 'Prof. David Miller', periods: 6 },
    { name: 'Engineering Physics Practical Lab', teacher: 'Dr. Suresh Joshi', periods: 2, isLab: true },
    { name: 'Basic Electrical & Electronics Lab', teacher: 'Prof. Anjali Saxena', periods: 2, isLab: true },
    { name: 'Python Programming Practical Lab', teacher: 'Prof. David Miller', periods: 2, isLab: true },
    { name: 'Engineering Graphics & CAD Modeling Lab', teacher: 'Prof. Thomas Wright', periods: 2, isLab: true },
  ]);
}

// Year 2, 3, 4 Curriculums for all Departments - Max 7 to 8 Subjects (4 Theory + 3/4 Labs)
const DEPARTMENT_YEAR_CURRICULUM: Record<string, Record<AcademicYear, Subject[]>> = {
  'dept-cse': {
    1: getFirstYearCourses('CS'),
    2: createSubjectList('CS', 2, [
      { name: 'Data Structures & Algorithms', teacher: 'Dr. Rajesh Sharma', periods: 6 },
      { name: 'Object Oriented Programming (Java/C++)', teacher: 'Prof. David Miller', periods: 6 },
      { name: 'Database Management Systems (DBMS)', teacher: 'Dr. Ananya Iyer', periods: 6 },
      { name: 'Computer Organization & Architecture', teacher: 'Prof. Elena Rostova', periods: 6 },
      { name: 'Data Structures Practical Lab', teacher: 'Dr. Rajesh Sharma', periods: 2, isLab: true },
      { name: 'Java Programming Practical Lab', teacher: 'Prof. David Miller', periods: 2, isLab: true },
      { name: 'DBMS & SQL Practical Lab', teacher: 'Dr. Ananya Iyer', periods: 2, isLab: true },
      { name: 'Web Development & Scripting Lab', teacher: 'Prof. Elena Rostova', periods: 2, isLab: true },
    ]),
    3: [
      {
        id: 'cse-y3-daa', name: 'DAA', code: 'DAA', teacherName: 'PBP', periodsPerWeek: 3,
        color: 'indigo', bgLight: COLOR_PALETTES[0].bgLight, borderClass: COLOR_PALETTES[0].borderClass,
        textClass: COLOR_PALETTES[0].textClass, activityType: 'Theory', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-ade', name: 'ADE', code: 'ADE', teacherName: 'BAP', periodsPerWeek: 3,
        color: 'emerald', bgLight: COLOR_PALETTES[1].bgLight, borderClass: COLOR_PALETTES[1].borderClass,
        textClass: COLOR_PALETTES[1].textClass, activityType: 'Theory', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-mdm', name: 'MDM', code: 'MDM', teacherName: 'MTN', periodsPerWeek: 3,
        color: 'sky', bgLight: COLOR_PALETTES[4].bgLight, borderClass: COLOR_PALETTES[4].borderClass,
        textClass: COLOR_PALETTES[4].textClass, activityType: 'Theory', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-ajp', name: 'AJP', code: 'AJP', teacherName: 'OSHA', periodsPerWeek: 3,
        color: 'purple', bgLight: COLOR_PALETTES[5].bgLight, borderClass: COLOR_PALETTES[5].borderClass,
        textClass: COLOR_PALETTES[5].textClass, activityType: 'Theory', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-open-elective', name: 'T.Y. Open Elective I', code: 'OPEN-ELECTIVE-I', teacherName: 'TBD', periodsPerWeek: 3,
        color: 'amber', bgLight: COLOR_PALETTES[2].bgLight, borderClass: COLOR_PALETTES[2].borderClass,
        textClass: COLOR_PALETTES[2].textClass, activityType: 'Elective', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-elective-i', name: 'Elective-I', code: 'ELECTIVE-I', teacherName: 'TBD', periodsPerWeek: 3,
        color: 'teal', bgLight: COLOR_PALETTES[6].bgLight, borderClass: COLOR_PALETTES[6].borderClass,
        textClass: COLOR_PALETTES[6].textClass, activityType: 'Elective', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-aptitude', name: 'Aptitude Skills-V', code: 'APTITUDE-V', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'rose', bgLight: COLOR_PALETTES[3].bgLight, borderClass: COLOR_PALETTES[3].borderClass,
        textClass: COLOR_PALETTES[3].textClass, activityType: 'Skill', studentGroup: 'Whole Division',
        durationPeriods: 1, isLab: false, roomType: 'lecture',
      },
      {
        id: 'cse-y3-language', name: 'Language Skills-III', code: 'LANGUAGE-III', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'indigo', bgLight: COLOR_PALETTES[0].bgLight, borderClass: COLOR_PALETTES[0].borderClass,
        textClass: COLOR_PALETTES[0].textClass, activityType: 'Skill', studentGroup: 'Whole Division',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-mini-project', name: 'Mini Project', code: 'MINI-PROJECT', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'emerald', bgLight: COLOR_PALETTES[1].bgLight, borderClass: COLOR_PALETTES[1].borderClass,
        textClass: COLOR_PALETTES[1].textClass, activityType: 'Project', studentGroup: 'Whole Division',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-gate-tb1', name: 'GATE', code: 'GATE-TB1', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'sky', bgLight: COLOR_PALETTES[4].bgLight, borderClass: COLOR_PALETTES[4].borderClass,
        textClass: COLOR_PALETTES[4].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-3', studentGroup: 'TB1',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-gate-tb2', name: 'GATE', code: 'GATE-TB2', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'purple', bgLight: COLOR_PALETTES[5].bgLight, borderClass: COLOR_PALETTES[5].borderClass,
        textClass: COLOR_PALETTES[5].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-2', studentGroup: 'TB2',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-gate-tb3', name: 'GATE', code: 'GATE-TB3', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'amber', bgLight: COLOR_PALETTES[2].bgLight, borderClass: COLOR_PALETTES[2].borderClass,
        textClass: COLOR_PALETTES[2].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-1', studentGroup: 'TB3',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-npr-tb1', name: 'NPR / Newspaper', code: 'NPR-TB1', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'teal', bgLight: COLOR_PALETTES[6].bgLight, borderClass: COLOR_PALETTES[6].borderClass,
        textClass: COLOR_PALETTES[6].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-1', studentGroup: 'TB1',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-npr-tb2', name: 'NPR / Newspaper', code: 'NPR-TB2', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'rose', bgLight: COLOR_PALETTES[3].bgLight, borderClass: COLOR_PALETTES[3].borderClass,
        textClass: COLOR_PALETTES[3].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-3', studentGroup: 'TB2',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-npr-tb3', name: 'NPR / Newspaper', code: 'NPR-TB3', teacherName: 'TBD', periodsPerWeek: 2,
        color: 'indigo', bgLight: COLOR_PALETTES[0].bgLight, borderClass: COLOR_PALETTES[0].borderClass,
        textClass: COLOR_PALETTES[0].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-2', studentGroup: 'TB3',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-presentation-tb1', name: 'Presentation', code: 'PRESENTATION-TB1', teacherName: 'OSHA', periodsPerWeek: 1,
        color: 'emerald', bgLight: COLOR_PALETTES[1].bgLight, borderClass: COLOR_PALETTES[1].borderClass,
        textClass: COLOR_PALETTES[1].textClass, activityType: 'Presentation', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-2', studentGroup: 'TB1',
        durationPeriods: 1, isLab: false, roomType: 'any',
      },
      {
        id: 'cse-y3-presentation-tb2', name: 'Presentation', code: 'PRESENTATION-TB2', teacherName: 'OSHA', periodsPerWeek: 1,
        color: 'sky', bgLight: COLOR_PALETTES[4].bgLight, borderClass: COLOR_PALETTES[4].borderClass,
        textClass: COLOR_PALETTES[4].textClass, activityType: 'Presentation', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-1', studentGroup: 'TB2',
        durationPeriods: 1, isLab: false, roomType: 'any',
      },
      {
        id: 'cse-y3-presentation-tb3', name: 'Presentation', code: 'PRESENTATION-TB3', teacherName: 'OSHA', periodsPerWeek: 1,
        color: 'purple', bgLight: COLOR_PALETTES[5].bgLight, borderClass: COLOR_PALETTES[5].borderClass,
        textClass: COLOR_PALETTES[5].textClass, activityType: 'Presentation', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-batch-rotation-3', studentGroup: 'TB3',
        durationPeriods: 1, isLab: false, roomType: 'any',
      },
      {
        id: 'cse-y3-daa-lab-tb1', name: 'DAA Lab', code: 'DAA-LAB-TB1', teacherName: 'PBP', periodsPerWeek: 2,
        color: 'amber', bgLight: COLOR_PALETTES[2].bgLight, borderClass: COLOR_PALETTES[2].borderClass,
        textClass: COLOR_PALETTES[2].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-1', studentGroup: 'TB1',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-daa-lab-tb2', name: 'DAA Lab', code: 'DAA-LAB-TB2', teacherName: 'PBP', periodsPerWeek: 2,
        color: 'teal', bgLight: COLOR_PALETTES[6].bgLight, borderClass: COLOR_PALETTES[6].borderClass,
        textClass: COLOR_PALETTES[6].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-3', studentGroup: 'TB2',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-daa-lab-tb3', name: 'DAA Lab', code: 'DAA-LAB-TB3', teacherName: 'PBP', periodsPerWeek: 2,
        color: 'rose', bgLight: COLOR_PALETTES[3].bgLight, borderClass: COLOR_PALETTES[3].borderClass,
        textClass: COLOR_PALETTES[3].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-2', studentGroup: 'TB3',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-ade-lab-tb1', name: 'ADE Lab', code: 'ADE-LAB-TB1', teacherName: 'BAP', periodsPerWeek: 2,
        color: 'indigo', bgLight: COLOR_PALETTES[0].bgLight, borderClass: COLOR_PALETTES[0].borderClass,
        textClass: COLOR_PALETTES[0].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-2', studentGroup: 'TB1',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-ade-lab-tb2', name: 'ADE Lab', code: 'ADE-LAB-TB2', teacherName: 'BAP', periodsPerWeek: 2,
        color: 'emerald', bgLight: COLOR_PALETTES[1].bgLight, borderClass: COLOR_PALETTES[1].borderClass,
        textClass: COLOR_PALETTES[1].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-1', studentGroup: 'TB2',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-ade-lab-tb3', name: 'ADE Lab', code: 'ADE-LAB-TB3', teacherName: 'BAP', periodsPerWeek: 2,
        color: 'sky', bgLight: COLOR_PALETTES[4].bgLight, borderClass: COLOR_PALETTES[4].borderClass,
        textClass: COLOR_PALETTES[4].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-3', studentGroup: 'TB3',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-ajp-lab-tb1', name: 'AJP Lab', code: 'AJP-LAB-TB1', teacherName: 'OSHA', periodsPerWeek: 2,
        color: 'purple', bgLight: COLOR_PALETTES[5].bgLight, borderClass: COLOR_PALETTES[5].borderClass,
        textClass: COLOR_PALETTES[5].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-3', studentGroup: 'TB1',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-ajp-lab-tb2', name: 'AJP Lab', code: 'AJP-LAB-TB2', teacherName: 'OSHA', periodsPerWeek: 2,
        color: 'amber', bgLight: COLOR_PALETTES[2].bgLight, borderClass: COLOR_PALETTES[2].borderClass,
        textClass: COLOR_PALETTES[2].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-2', studentGroup: 'TB2',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
      {
        id: 'cse-y3-ajp-lab-tb3', name: 'AJP Lab', code: 'AJP-LAB-TB3', teacherName: 'OSHA', periodsPerWeek: 2,
        color: 'teal', bgLight: COLOR_PALETTES[6].bgLight, borderClass: COLOR_PALETTES[6].borderClass,
        textClass: COLOR_PALETTES[6].textClass, activityType: 'Lab', activityMode: 'ROTATIONAL_BATCH', activityGroupId: 'ty-cse-b-lab-rotation-1', studentGroup: 'TB3',
        durationPeriods: 2, isLab: true, roomType: 'lab',
      },
    ],
    4: createSubjectList('CS', 4, [
      { name: 'Distributed Systems & Cloud Computing', teacher: 'Dr. Vikramaditya Rao', periods: 6 },
      { name: 'Deep Learning & Neural Networks', teacher: 'Dr. Sunita Patel', periods: 6 },
      { name: 'Cryptography & Network Security', teacher: 'Prof. Daniel Brooks', periods: 6 },
      { name: 'High Performance Computing', teacher: 'Prof. Michael Chang', periods: 6 },
      { name: 'Cloud Computing & Distributed Systems Lab', teacher: 'Dr. Vikramaditya Rao', periods: 2, isLab: true },
      { name: 'Deep Learning & PyTorch Lab', teacher: 'Dr. Sunita Patel', periods: 2, isLab: true },
      { name: 'Network Security & Penetration Testing Lab', teacher: 'Prof. Daniel Brooks', periods: 2, isLab: true },
      { name: 'Capstone Implementation & Viva Lab', teacher: 'Dr. Rajesh Sharma', periods: 2, isLab: true },
    ]),
  },

  'dept-it': {
    1: getFirstYearCourses('IT'),
    2: createSubjectList('IT', 2, [
      { name: 'Data Structures & Algorithmic Analysis', teacher: 'Prof. Alex Rivera', periods: 6 },
      { name: 'Object Oriented Software Design', teacher: 'Prof. Lisa Wong', periods: 6 },
      { name: 'Database Systems & SQL Optimization', teacher: 'Dr. Marcus Vance', periods: 6 },
      { name: 'Computer Networks & Internetworking', teacher: 'Prof. Sarah Jenkins', periods: 6 },
      { name: 'Data Structures Practical Lab', teacher: 'Prof. Alex Rivera', periods: 2, isLab: true },
      { name: 'Java & OOP Programming Lab', teacher: 'Prof. Lisa Wong', periods: 2, isLab: true },
      { name: 'Database Systems & SQL Lab', teacher: 'Dr. Marcus Vance', periods: 2, isLab: true },
      { name: 'Web Development & UI Architectures Lab', teacher: 'Prof. Alex Rivera', periods: 2, isLab: true },
    ]),
    3: createSubjectList('IT', 3, [
      { name: 'Web Technologies & Modern Frameworks', teacher: 'Prof. Alex Rivera', periods: 6 },
      { name: 'Cloud Computing & DevOps Pipelines', teacher: 'Dr. Priya Nair', periods: 6 },
      { name: 'Information & Cybersecurity Protocols', teacher: 'Prof. Daniel Brooks', periods: 6 },
      { name: 'Big Data Systems & Analytics', teacher: 'Prof. Ethan Vance', periods: 6 },
      { name: 'Full-Stack Web Tech Lab', teacher: 'Prof. Alex Rivera', periods: 2, isLab: true },
      { name: 'Cloud & DevOps Practical Lab', teacher: 'Dr. Priya Nair', periods: 2, isLab: true },
      { name: 'Big Data & Python Analytics Lab', teacher: 'Prof. Ethan Vance', periods: 2, isLab: true },
      { name: 'Cybersecurity Penetration Testing Lab', teacher: 'Prof. Daniel Brooks', periods: 2, isLab: true },
    ]),
    4: createSubjectList('IT', 4, [
      { name: 'Enterprise Cloud Solutions Architecture', teacher: 'Dr. Priya Nair', periods: 6 },
      { name: 'Blockchain Systems & Smart Contracts', teacher: 'Prof. Ethan Vance', periods: 6 },
      { name: 'AI in Cybersecurity & Threat Intel', teacher: 'Prof. Daniel Brooks', periods: 6 },
      { name: 'Microservices & Container Orchestration', teacher: 'Dr. Marcus Vance', periods: 6 },
      { name: 'Enterprise Cloud & DevOps Lab', teacher: 'Dr. Priya Nair', periods: 2, isLab: true },
      { name: 'Blockchain & Smart Contracts Lab', teacher: 'Prof. Ethan Vance', periods: 2, isLab: true },
      { name: 'Threat Intelligence Security Lab', teacher: 'Prof. Daniel Brooks', periods: 2, isLab: true },
      { name: 'Full-Stack Capstone Project Lab', teacher: 'Prof. Alex Rivera', periods: 2, isLab: true },
    ]),
  },

  'dept-ece': {
    1: getFirstYearCourses('EC'),
    2: createSubjectList('EC', 2, [
      { name: 'Analog Electronic Circuits', teacher: 'Prof. Thomas Wright', periods: 6 },
      { name: 'Signals & Systems Analysis', teacher: 'Dr. Arvind Swamy', periods: 6 },
      { name: 'Electronic Devices & Semiconductor Physics', teacher: 'Dr. Sanjay Kulkarni', periods: 6 },
      { name: 'Digital Logic & System Design', teacher: 'Prof. Elena Rostova', periods: 6 },
      { name: 'Analog Circuits Practical Lab', teacher: 'Prof. Thomas Wright', periods: 2, isLab: true },
      { name: 'Digital Logic & Hardware Lab', teacher: 'Prof. Elena Rostova', periods: 2, isLab: true },
      { name: 'Electronic Devices & SPICE Lab', teacher: 'Dr. Sanjay Kulkarni', periods: 2, isLab: true },
      { name: 'Signals & DSP Simulation Lab', teacher: 'Dr. Arvind Swamy', periods: 2, isLab: true },
    ]),
    3: createSubjectList('EC', 3, [
      { name: 'Digital Signal Processing (DSP)', teacher: 'Dr. Arvind Swamy', periods: 6 },
      { name: 'Microprocessors & Microcontrollers', teacher: 'Prof. Elena Rostova', periods: 6 },
      { name: 'VLSI Design & Architecture', teacher: 'Dr. Sanjay Kulkarni', periods: 6 },
      { name: 'Analog & Digital Communication', teacher: 'Dr. Nithya Menon', periods: 6 },
      { name: 'DSP Practical Software Lab', teacher: 'Dr. Arvind Swamy', periods: 2, isLab: true },
      { name: 'Microcontroller & Embedded Systems Lab', teacher: 'Prof. Elena Rostova', periods: 2, isLab: true },
      { name: 'VLSI Design & Cadence Lab', teacher: 'Dr. Sanjay Kulkarni', periods: 2, isLab: true },
      { name: 'Communication Engineering Lab', teacher: 'Dr. Nithya Menon', periods: 2, isLab: true },
    ]),
    4: createSubjectList('EC', 4, [
      { name: 'Wireless & 5G Cellular Networks', teacher: 'Dr. Nithya Menon', periods: 6 },
      { name: 'Optical Fiber Communication & Photonics', teacher: 'Prof. Kevin Cooper', periods: 6 },
      { name: 'IoT & Smart Sensor Networks', teacher: 'Prof. Elena Rostova', periods: 6 },
      { name: 'RF & Microwave Engineering', teacher: 'Dr. Arvind Swamy', periods: 6 },
      { name: 'Wireless & 5G Simulation Lab', teacher: 'Dr. Nithya Menon', periods: 2, isLab: true },
      { name: 'IoT & Smart Hardware Lab', teacher: 'Prof. Elena Rostova', periods: 2, isLab: true },
      { name: 'Microwave & Antenna Testing Lab', teacher: 'Dr. Arvind Swamy', periods: 2, isLab: true },
      { name: 'Major Capstone System Lab', teacher: 'Dr. Sanjay Kulkarni', periods: 2, isLab: true },
    ]),
  },

  'dept-mech': {
    1: getFirstYearCourses('ME'),
    2: createSubjectList('ME', 2, [
      { name: 'Thermodynamics & Thermal Power', teacher: 'Dr. Walter Hayes', periods: 6 },
      { name: 'Kinematics of Machinery', teacher: 'Prof. Claire Sterling', periods: 6 },
      { name: 'Fluid Mechanics & Hydraulic Machines', teacher: 'Dr. Harold Finch', periods: 6 },
      { name: 'Material Science & Metallurgy', teacher: 'Prof. Vikram Singhania', periods: 6 },
      { name: 'Fluid Mechanics & Hydraulics Lab', teacher: 'Dr. Harold Finch', periods: 2, isLab: true },
      { name: 'Material Testing & Metallurgy Lab', teacher: 'Prof. Vikram Singhania', periods: 2, isLab: true },
      { name: 'Kinematics & Dynamics Lab', teacher: 'Prof. Claire Sterling', periods: 2, isLab: true },
      { name: 'Machine Tools & Workshop Lab', teacher: 'Dr. Walter Hayes', periods: 2, isLab: true },
    ]),
    3: createSubjectList('ME', 3, [
      { name: 'Heat & Mass Transfer', teacher: 'Dr. Walter Hayes', periods: 6 },
      { name: 'Design of Machine Elements (DME)', teacher: 'Prof. Claire Sterling', periods: 6 },
      { name: 'Dynamics of Machinery & Vibrations', teacher: 'Dr. Harold Finch', periods: 6 },
      { name: 'CAD/CAM & Computer Integrated Mfg', teacher: 'Prof. Frank Castle', periods: 6 },
      { name: 'Heat Transfer Practical Lab', teacher: 'Dr. Walter Hayes', periods: 2, isLab: true },
      { name: 'CAD/CAM & CNC Machining Lab', teacher: 'Prof. Frank Castle', periods: 2, isLab: true },
      { name: 'Dynamics & Vibrations Testing Lab', teacher: 'Dr. Harold Finch', periods: 2, isLab: true },
      { name: 'Metrology & Quality Assurance Lab', teacher: 'Prof. Claire Sterling', periods: 2, isLab: true },
    ]),
    4: createSubjectList('ME', 4, [
      { name: 'Finite Element Analysis (FEA)', teacher: 'Prof. Claire Sterling', periods: 6 },
      { name: 'Computational Fluid Dynamics (CFD)', teacher: 'Dr. Harold Finch', periods: 6 },
      { name: 'Automobile Engineering & EV Tech', teacher: 'Prof. Vikram Singhania', periods: 6 },
      { name: 'Industrial Robotics & Mechatronics', teacher: 'Prof. Frank Castle', periods: 6 },
      { name: 'FEA Simulation Practical Lab', teacher: 'Prof. Claire Sterling', periods: 2, isLab: true },
      { name: 'CFD & Aerodynamics Simulation Lab', teacher: 'Dr. Harold Finch', periods: 2, isLab: true },
      { name: 'Automobile & EV Powertrain Lab', teacher: 'Prof. Vikram Singhania', periods: 2, isLab: true },
      { name: 'Mechatronics & Robotics Hardware Lab', teacher: 'Prof. Frank Castle', periods: 2, isLab: true },
    ]),
  },

  'dept-civil': {
    1: getFirstYearCourses('CE'),
    2: createSubjectList('CE', 2, [
      { name: 'Surveying & Advanced Geomatics', teacher: 'Prof. Martin Gomez', periods: 6 },
      { name: 'Mechanics of Solids & Structures', teacher: 'Dr. Brenda Vance', periods: 6 },
      { name: 'Fluid Mechanics in Open Channels', teacher: 'Dr. Harold Finch', periods: 6 },
      { name: 'Building Materials & Construction Tech', teacher: 'Prof. Diane Ross', periods: 6 },
      { name: 'Surveying & Geomatics Field Lab', teacher: 'Prof. Martin Gomez', periods: 2, isLab: true },
      { name: 'Strength of Materials Testing Lab', teacher: 'Dr. Brenda Vance', periods: 2, isLab: true },
      { name: 'Fluid Mechanics Hydraulics Lab', teacher: 'Dr. Harold Finch', periods: 2, isLab: true },
      { name: 'Concrete & Building Materials Lab', teacher: 'Prof. Diane Ross', periods: 2, isLab: true },
    ]),
    3: createSubjectList('CE', 3, [
      { name: 'Structural Analysis & Matrix Methods', teacher: 'Dr. Brenda Vance', periods: 6 },
      { name: 'Design of Reinforced Concrete Structures', teacher: 'Dr. Anita Desai', periods: 6 },
      { name: 'Geotechnical & Soil Mechanics', teacher: 'Prof. Martin Gomez', periods: 6 },
      { name: 'Transportation & Highway Engineering', teacher: 'Prof. Diane Ross', periods: 6 },
      { name: 'Concrete Structures Testing Lab', teacher: 'Dr. Anita Desai', periods: 2, isLab: true },
      { name: 'Geotechnical & Soil Testing Lab', teacher: 'Prof. Martin Gomez', periods: 2, isLab: true },
      { name: 'Highway Materials & Bitumen Lab', teacher: 'Prof. Diane Ross', periods: 2, isLab: true },
      { name: 'Structural CAD & Modeling Lab', teacher: 'Dr. Brenda Vance', periods: 2, isLab: true },
    ]),
    4: createSubjectList('CE', 4, [
      { name: 'Earthquake Resistant Structural Design', teacher: 'Dr. Anita Desai', periods: 6 },
      { name: 'Advanced Structural Steel Design', teacher: 'Dr. Brenda Vance', periods: 6 },
      { name: 'Construction Project Management & Primavera', teacher: 'Prof. Martin Gomez', periods: 6 },
      { name: 'GIS & Satellite Remote Sensing', teacher: 'Prof. Diane Ross', periods: 6 },
      { name: 'GIS & Remote Sensing Computing Lab', teacher: 'Prof. Diane Ross', periods: 2, isLab: true },
      { name: 'Structural Dynamics & Testing Lab', teacher: 'Dr. Anita Desai', periods: 2, isLab: true },
      { name: 'Project Scheduling & Software Lab', teacher: 'Prof. Martin Gomez', periods: 2, isLab: true },
      { name: 'Civil Engineering Capstone Lab', teacher: 'Dr. Brenda Vance', periods: 2, isLab: true },
    ]),
  },

  'dept-ee': {
    1: getFirstYearCourses('EE'),
    2: createSubjectList('EE', 2, [
      { name: 'Electrical Circuit Analysis & Synthesis', teacher: 'Prof. Arthur Pendelton', periods: 6 },
      { name: 'Electrical Machines - I (Transformers & DC)', teacher: 'Dr. Grace Hopper', periods: 6 },
      { name: 'Electromagnetic Field Theory', teacher: 'Prof. Kevin Cooper', periods: 6 },
      { name: 'Analog Electronic Circuits', teacher: 'Prof. Thomas Wright', periods: 6 },
      { name: 'Electrical Machines - I Practical Lab', teacher: 'Dr. Grace Hopper', periods: 2, isLab: true },
      { name: 'Electric Circuits & SPICE Simulation Lab', teacher: 'Prof. Arthur Pendelton', periods: 2, isLab: true },
      { name: 'Analog Electronics Hardware Lab', teacher: 'Prof. Thomas Wright', periods: 2, isLab: true },
      { name: 'Electrical Measurements & Sensors Lab', teacher: 'Prof. Kevin Cooper', periods: 2, isLab: true },
    ]),
    3: createSubjectList('EE', 3, [
      { name: 'Power Systems Analysis & Load Flow', teacher: 'Prof. Arthur Pendelton', periods: 6 },
      { name: 'Power Electronics & Converters', teacher: 'Dr. Grace Hopper', periods: 6 },
      { name: 'Control Systems Engineering', teacher: 'Dr. Arthur Day', periods: 6 },
      { name: 'Electrical Machines - II (Induction & Sync)', teacher: 'Prof. Arthur Pendelton', periods: 6 },
      { name: 'Power Systems Simulation Lab', teacher: 'Prof. Arthur Pendelton', periods: 2, isLab: true },
      { name: 'Power Electronics Inverter Lab', teacher: 'Dr. Grace Hopper', periods: 2, isLab: true },
      { name: 'Control Systems & MATLAB Lab', teacher: 'Dr. Arthur Day', periods: 2, isLab: true },
      { name: 'Electrical Machines - II Testing Lab', teacher: 'Prof. Arthur Pendelton', periods: 2, isLab: true },
    ]),
    4: createSubjectList('EE', 4, [
      { name: 'Smart Grids & Microgrid Architectures', teacher: 'Prof. Arthur Pendelton', periods: 6 },
      { name: 'High Voltage Engineering & Testing', teacher: 'Dr. Grace Hopper', periods: 6 },
      { name: 'Electric Vehicles & Battery Management', teacher: 'Dr. Arthur Day', periods: 6 },
      { name: 'Power System Protection & Switchgear', teacher: 'Prof. Arthur Pendelton', periods: 6 },
      { name: 'Smart Grid & Microgrid Simulation Lab', teacher: 'Prof. Arthur Pendelton', periods: 2, isLab: true },
      { name: 'High Voltage & Insulation Testing Lab', teacher: 'Dr. Grace Hopper', periods: 2, isLab: true },
      { name: 'EV Drives & Battery Testing Lab', teacher: 'Dr. Arthur Day', periods: 2, isLab: true },
      { name: 'Power System Protection & Relays Lab', teacher: 'Prof. Arthur Pendelton', periods: 2, isLab: true },
    ]),
  },

  'dept-robotics': {
    1: getFirstYearCourses('ROB'),
    2: createSubjectList('ROB', 2, [
      { name: 'Introduction to Robotics & ROS 2', teacher: 'Dr. Neil Armstrong', periods: 6 },
      { name: 'Linear Control Systems & Feedback', teacher: 'Prof. Natasha Roman', periods: 6 },
      { name: 'Sensors, Transducers & Signal Conditioning', teacher: 'Dr. Sanjay Kulkarni', periods: 6 },
      { name: 'Mechanisms & Kinematics of Machines', teacher: 'Prof. Claire Sterling', periods: 6 },
      { name: 'ROS 2 Robot Simulation Lab', teacher: 'Dr. Neil Armstrong', periods: 2, isLab: true },
      { name: 'Sensors & Signal Conditioning Lab', teacher: 'Dr. Sanjay Kulkarni', periods: 2, isLab: true },
      { name: 'Control Systems & MATLAB Lab', teacher: 'Prof. Natasha Roman', periods: 2, isLab: true },
      { name: 'Microcontrollers & Embedded Robotics Lab', teacher: 'Prof. Claire Sterling', periods: 2, isLab: true },
    ]),
    3: createSubjectList('ROB', 3, [
      { name: 'Robot Kinematics & Dynamic Modeling', teacher: 'Dr. Neil Armstrong', periods: 6 },
      { name: 'Robotic Vision & OpenCV Image Processing', teacher: 'Dr. Gaurav Bansal', periods: 6 },
      { name: 'Mobile Robotics, Navigation & SLAM', teacher: 'Prof. Natasha Roman', periods: 6 },
      { name: 'Industrial Automation & PLC/SCADA', teacher: 'Prof. Frank Castle', periods: 6 },
      { name: 'Robot Kinematics & Arm Control Lab', teacher: 'Dr. Neil Armstrong', periods: 2, isLab: true },
      { name: 'Robotic Vision & OpenCV Lab', teacher: 'Dr. Gaurav Bansal', periods: 2, isLab: true },
      { name: 'Mobile Robots & SLAM Practical Lab', teacher: 'Prof. Natasha Roman', periods: 2, isLab: true },
      { name: 'PLC & Industrial Automation Lab', teacher: 'Prof. Frank Castle', periods: 2, isLab: true },
    ]),
    4: createSubjectList('ROB', 4, [
      { name: 'Autonomous Navigation & Path Planning', teacher: 'Dr. Neil Armstrong', periods: 6 },
      { name: 'Deep Reinforcement Learning in Robotics', teacher: 'Dr. Gaurav Bansal', periods: 6 },
      { name: 'Swarm Robotics & Distributed Autonomy', teacher: 'Prof. Natasha Roman', periods: 6 },
      { name: 'Actuators, Motors & Power Drives', teacher: 'Dr. Arthur Day', periods: 6 },
      { name: 'Autonomous Navigation Simulation Lab', teacher: 'Dr. Neil Armstrong', periods: 2, isLab: true },
      { name: 'Deep Reinforcement Learning Lab', teacher: 'Dr. Gaurav Bansal', periods: 2, isLab: true },
      { name: 'Actuators & Motor Drives Lab', teacher: 'Dr. Arthur Day', periods: 2, isLab: true },
      { name: 'Robotics Capstone System Integration Lab', teacher: 'Prof. Natasha Roman', periods: 2, isLab: true },
    ]),
  },
};

export function getGenericYearSubjects(deptName: string, year: AcademicYear): Subject[] {
  const codePrefix = deptName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
  if (year === 1) {
    return getFirstYearCourses(codePrefix);
  }

  const yearTitles: Record<AcademicYear, { name: string; isLab?: boolean }[]> = {
    1: [], // handled above
    2: [
      { name: 'Core Analysis & System Theory', isLab: false },
      { name: 'Applied Engineering Fundamentals', isLab: false },
      { name: 'Computational Logic & Algorithms', isLab: false },
      { name: 'Systems Modeling & Dynamics', isLab: false },
      { name: 'Core Systems Practical Lab', isLab: true },
      { name: 'Computational Methods Software Lab', isLab: true },
      { name: 'Engineering Hardware & Prototyping Lab', isLab: true },
      { name: 'Design Modeling & CAD Lab', isLab: true },
    ],
    3: [
      { name: 'Advanced Systems Architecture', isLab: false },
      { name: 'Control & Optimization Theory', isLab: false },
      { name: 'Applied Core Specialization', isLab: false },
      { name: 'Software Design & Frameworks', isLab: false },
      { name: 'Advanced Systems Practical Lab', isLab: true },
      { name: 'Control Systems Simulation Lab', isLab: true },
      { name: 'Applied Specialized Hardware Lab', isLab: true },
      { name: 'Full-Stack Project Development Lab', isLab: true },
    ],
    4: [
      { name: 'Distributed Systems & Cloud Tech', isLab: false },
      { name: 'Advanced Machine Intelligence', isLab: false },
      { name: 'Security & Enterprise Architecture', isLab: false },
      { name: 'High-Performance Computing', isLab: false },
      { name: 'Cloud & Distributed Systems Lab', isLab: true },
      { name: 'Machine Intelligence Practical Lab', isLab: true },
      { name: 'Security & Network Analysis Lab', isLab: true },
      { name: 'Capstone Implementation & Viva Lab', isLab: true },
    ],
  };

  const titles = yearTitles[year] || yearTitles[2];
  const teachers = [
    'Dr. Alex Morgan',
    'Prof. Brenda Vance',
    'Dr. Christopher Lee',
    'Prof. Danielle Foster',
    'Dr. Edward Kim',
    'Prof. Fiona Gallagher',
    'Dr. Gaurav Bansal',
    'Prof. Kevin Cooper',
  ];

  return titles.map((item, i) => {
    const palette = COLOR_PALETTES[i % COLOR_PALETTES.length];
    const isLab = item.isLab ?? /lab|practicum|workshop|project/i.test(item.name);
    const classroomNumber = isLab
      ? (((i * 4 + 7) % 100) || 1)
      : (((i * 5 + 18) % 100) || 1);

    return {
      id: `custom-y${year}-${i + 1}`,
      name: item.name,
      code: `${codePrefix}${year}0${i + 1}`,
      teacherName: teachers[i % teachers.length],
      periodsPerWeek: isLab ? 2 : 6,
      color: palette.color,
      bgLight: palette.bgLight,
      borderClass: palette.borderClass,
      textClass: palette.textClass,
      isLab,
      roomType: isLab ? 'lab' : 'lecture',
      classroomNumber,
    };
  });
}

/**
 * Main curriculum lookup for any department and any year (1, 2, 3, 4)
 */
export function getDefaultSubjects(
  deptId: string,
  deptName: string,
  year: AcademicYear
): Subject[] {
  const deptCurriculum = DEPARTMENT_YEAR_CURRICULUM[deptId];
  if (deptCurriculum && deptCurriculum[year]) {
    // Return a clone to avoid mutating defaults
    return deptCurriculum[year].map((s) => ({ ...s }));
  }
  return getGenericYearSubjects(deptName, year);
}
