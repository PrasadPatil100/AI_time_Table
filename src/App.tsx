import React, { useState } from 'react';

import {
  AcademicYear,
  Department,
  Division,
  GeneratedTimetable,
  Subject,
} from './types';

import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_DIVISIONS,
} from './data/defaultDepartments';

import { getDefaultSubjects } from './data/departmentCurriculum';
import { useTimetables } from './context/TimetableContext';

import { Navbar } from './components/Navbar';
import { Stepper } from './components/Stepper';
import { Step1Department } from './components/Step1Department';
import { Step2Year } from './components/Step2Year';
import { Step2Division } from './components/Step2Division';
import { Step3Subjects } from './components/Step3Subjects';
import { Step5Classrooms } from './components/Step5Classrooms';
import { Step4Timetable } from './components/Step4Timetable';

import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';

export default function App() {

  const { getTimetable } = useTimetables();

  // =========================================================
  // AUTHENTICATION STATES
  // =========================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  );

  // Landing page is shown first
  const [showLanding, setShowLanding] = useState(true);

  // Register page
  const [showRegister, setShowRegister] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  // =========================================================
  // TIMETABLE STATES
  // IMPORTANT: ALL HOOKS MUST COME BEFORE ANY RETURN
  // =========================================================

  // Navigation State
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [maxStepReached, setMaxStepReached] =
    useState<number>(1);


  // Departments State
  const [departments, setDepartments] =
    useState<Department[]>(DEFAULT_DEPARTMENTS);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(
      DEFAULT_DEPARTMENTS[0]
    );


  // Academic Year State
  const [selectedYear, setSelectedYear] =
    useState<AcademicYear>(1);


  // Divisions State
  const [divisions, setDivisions] =
    useState<Division[]>(DEFAULT_DIVISIONS);

  const [selectedDivision, setSelectedDivision] =
    useState<Division | null>(
      DEFAULT_DIVISIONS[0]
    );


  // Subjects State
  const [subjects, setSubjects] =
    useState<Subject[]>(
      getDefaultSubjects(
        DEFAULT_DEPARTMENTS[0].id,
        DEFAULT_DEPARTMENTS[0].name,
        1
      )
    );


  // Generated Timetable State
  const [timetable, setTimetable] =
    useState<GeneratedTimetable | null>(null);


  // =========================================================
  // DEPARTMENT SELECTION
  // =========================================================

  const handleSelectDepartment = (
    dept: Department
  ) => {

    setSelectedDepartment(dept);

    setSubjects(
      getDefaultSubjects(
        dept.id,
        dept.name,
        selectedYear
      )
    );

    const existing = selectedDivision
      ? getTimetable(
          dept.id,
          selectedYear,
          selectedDivision.id
        )
      : null;

    setTimetable(existing || null);
  };


  // =========================================================
  // YEAR SELECTION
  // =========================================================

  const handleSelectYear = (
    year: AcademicYear
  ) => {

    setSelectedYear(year);

    if (selectedDepartment) {

      setSubjects(
        getDefaultSubjects(
          selectedDepartment.id,
          selectedDepartment.name,
          year
        )
      );

      const existing = selectedDivision
        ? getTimetable(
            selectedDepartment.id,
            year,
            selectedDivision.id
          )
        : null;

      setTimetable(existing || null);
    }
  };


  // =========================================================
  // DIVISION SELECTION
  // =========================================================

  const handleSelectDivision = (
    div: Division
  ) => {

    setSelectedDivision(div);

    if (selectedDepartment) {

      const existing = getTimetable(
        selectedDepartment.id,
        selectedYear,
        div.id
      );

      setTimetable(existing || null);
    }
  };


  // =========================================================
  // SET GENERATED TIMETABLE
  // =========================================================

  const handleSetTimetable = (
    tt: GeneratedTimetable
  ) => {

    setTimetable(tt);

    setSelectedDepartment(tt.department);

    setSelectedYear(tt.year);

    setSelectedDivision(tt.division);

    setSubjects(tt.subjects);
  };


  // =========================================================
  // ADD CUSTOM DEPARTMENT
  // =========================================================

  const handleAddCustomDepartment = (
    newDept: Department
  ) => {

    setDepartments((prev) => [
      newDept,
      ...prev,
    ]);
  };


  // =========================================================
  // ADD CUSTOM DIVISION
  // =========================================================

  const handleAddCustomDivision = (
    newDiv: Division
  ) => {

    setDivisions((prev) => [
      ...prev,
      newDiv,
    ]);
  };


  // =========================================================
  // RESET SUBJECTS
  // =========================================================

  const handleResetToDepartmentDefaults = () => {

    if (!selectedDepartment) return;

    setSubjects(
      getDefaultSubjects(
        selectedDepartment.id,
        selectedDepartment.name,
        selectedYear
      )
    );

    setTimetable(null);
  };


  // =========================================================
  // STEP NAVIGATION
  // =========================================================

  const goToStep = (
    stepNumber: number
  ) => {

    setCurrentStep(stepNumber);

    if (stepNumber > maxStepReached) {

      setMaxStepReached(stepNumber);
    }
  };


  // =========================================================
  // RESET EVERYTHING
  // =========================================================

  const handleResetAll = () => {

    setCurrentStep(1);

    setMaxStepReached(1);

    setSelectedDepartment(
      DEFAULT_DEPARTMENTS[0]
    );

    setSelectedYear(1);

    setSelectedDivision(
      DEFAULT_DIVISIONS[0]
    );

    setSubjects(
      getDefaultSubjects(
        DEFAULT_DEPARTMENTS[0].id,
        DEFAULT_DEPARTMENTS[0].name,
        1
      )
    );

    setTimetable(null);
  };


  // =========================================================
  // AUTHENTICATION FLOW
  // =========================================================

  // 1. LANDING PAGE
  if (showLanding) {

    return (
      <LandingPage

        onLogin={() => {

          // Go to Login page
          setShowLanding(false);

          setShowRegister(false);

          // Make sure Login page is displayed
          setIsLoggedIn(false);
        }}

        onRegister={() => {

          // Go to Register page
          setShowLanding(false);

          setShowRegister(true);

          // Make sure user is treated as logged out
          setIsLoggedIn(false);
        }}

      />
    );
  }


  // 2. REGISTER PAGE
  if (!isLoggedIn && showRegister) {

    return (
      <Register

        onRegisterSuccess={() => {

          // After registration,
          // go to Login page
          setShowRegister(false);
        }}

        onBackToLogin={() => {

          setShowRegister(false);
        }}

      />
    );
  }


  // 3. LOGIN PAGE
  if (!isLoggedIn && showForgotPassword) {
  return (
    <ForgotPassword
      onBackToLogin={() => {
        setShowForgotPassword(false);
      }}
    />
  );
}
  if (!isLoggedIn) {

    return (
      <Login

        onLoginSuccess={() => {

          // Login successful
          setIsLoggedIn(true);
        }}

        onRegister={() => {

          // Open Register page
          setShowRegister(true);
        }}
        onForgotPassword={() => {
        setShowForgotPassword(true);
        }}

      />
    );
  }


  // =========================================================
  // MAIN TIMETABLE APPLICATION
  // =========================================================

  return (

    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 antialiased font-sans">


      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <Navbar
        currentStep={currentStep}
        onReset={handleResetAll}
        departmentName={
          selectedDepartment?.name
        }
        year={selectedYear}
        divisionName={
          selectedDivision?.name
        }
      />


      {/* =====================================================
          STEPPER & PROGRESS BAR
      ====================================================== */}

      <Stepper
        currentStep={currentStep}
        onStepClick={goToStep}
        maxStepReached={maxStepReached}
      />


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* =================================================
            STEP 1 - DEPARTMENT
        ================================================== */}

        {currentStep === 1 && (

          <Step1Department
            departments={departments}
            selectedDepartment={
              selectedDepartment
            }
            onSelectDepartment={
              handleSelectDepartment
            }
            onAddCustomDepartment={
              handleAddCustomDepartment
            }
            onNext={() => goToStep(2)}
          />

        )}


        {/* =================================================
            STEP 2 - ACADEMIC YEAR
        ================================================== */}

        {currentStep === 2 &&
          selectedDepartment && (

            <Step2Year
              department={
                selectedDepartment
              }
              selectedYear={
                selectedYear
              }
              onSelectYear={
                handleSelectYear
              }
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />

        )}


        {/* =================================================
            STEP 3 - DIVISION
        ================================================== */}

        {currentStep === 3 &&
          selectedDepartment && (

            <Step2Division
              department={
                selectedDepartment
              }
              year={selectedYear}
              divisions={divisions}
              selectedDivision={
                selectedDivision
              }
              onSelectDivision={
                handleSelectDivision
              }
              onAddCustomDivision={
                handleAddCustomDivision
              }
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />

        )}


        {/* =================================================
            STEP 4 - SUBJECTS & TEACHERS
        ================================================== */}

        {currentStep === 4 &&
          selectedDepartment &&
          selectedDivision && (

            <Step3Subjects
              department={
                selectedDepartment
              }
              year={selectedYear}
              division={
                selectedDivision
              }
              subjects={subjects}
              onChangeSubjects={
                setSubjects
              }
              onResetToDefaults={
                handleResetToDepartmentDefaults
              }
              onBack={() => goToStep(3)}
              onNext={() => goToStep(5)}
            />

        )}


        {/* =================================================
            STEP 5 - CLASSROOMS
        ================================================== */}

        {currentStep === 5 &&
          selectedDepartment &&
          selectedDivision && (

            <Step5Classrooms
              department={
                selectedDepartment
              }
              year={selectedYear}
              division={
                selectedDivision
              }
              subjects={subjects}
              onChangeSubjects={
                setSubjects
              }
              onBack={() => goToStep(4)}
              onNext={() => goToStep(6)}
            />

        )}


        {/* =================================================
            STEP 6 - GENERATED TIMETABLE
        ================================================== */}

        {currentStep === 6 &&
          selectedDepartment &&
          selectedDivision && (

            <Step4Timetable
              department={
                selectedDepartment
              }
              year={selectedYear}
              division={
                selectedDivision
              }
              subjects={subjects}
              timetable={timetable}
              onSetTimetable={
                handleSetTimetable
              }
              onBack={() => goToStep(5)}
            />

        )}

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-white border-t border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 print:hidden">

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">

          <p>
            Automatic Timetable Generator •
            Departmental Academic Planning System
          </p>

          <div className="flex items-center gap-4 text-slate-400">

            <span>
              Conflict-Free Scheduling
            </span>

            <span>•</span>

            <span>
              All Academic Years
              (1st, 2nd, 3rd, 4th Year)
            </span>

            <span>•</span>

            <span>
              Classroom & Lab Allocation
              (Rooms 1–100)
            </span>

            <span>•</span>

            <span>
              Teacher Workload Balancing
            </span>

            <span>•</span>

            <span>
              Print & Export Ready
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}