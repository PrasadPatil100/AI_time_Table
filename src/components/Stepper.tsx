import React from 'react';
import {
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  DoorClosed,
  CalendarCheck2,
  Check,
} from 'lucide-react';

interface StepperProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  maxStepReached: number;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepClick,
  maxStepReached,
}) => {
  const steps = [
    {
      number: 1,
      title: 'Department',
      subtitle: 'Field of study',
      icon: Building2,
    },
    {
      number: 2,
      title: 'Year (1-4)',
      subtitle: 'Academic year',
      icon: GraduationCap,
    },
    {
      number: 3,
      title: 'Division',
      subtitle: 'Class section',
      icon: Users,
    },
    {
      number: 4,
      title: 'Subjects',
      subtitle: 'Staff & periods',
      icon: BookOpen,
    },
    {
      number: 5,
      title: 'Classrooms',
      subtitle: 'Rooms & labs 1–100',
      icon: DoorClosed,
    },
    {
      number: 6,
      title: 'Timetable',
      subtitle: 'Generate schedule',
      icon: CalendarCheck2,
    },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full bg-white border-b border-slate-200/80 shadow-xs py-3 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Step Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 relative">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isClickable = step.number <= maxStepReached;
            const IconComponent = step.icon;

            return (
              <button
                key={step.number}
                type="button"
                id={`stepper-step-${step.number}`}
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.number)}
                className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl text-left transition-all relative ${
                  isCurrent
                    ? 'bg-indigo-50/90 border border-indigo-200 shadow-xs ring-1 ring-indigo-400/30'
                    : isCompleted
                    ? 'bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 cursor-pointer'
                    : 'opacity-50 bg-transparent border border-transparent cursor-not-allowed'
                }`}
              >
                {/* Step Circle / Badge */}
                <div
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <IconComponent className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Step Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-indigo-600'
                          : isCompleted
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      Step {step.number}
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isCurrent ? 'text-indigo-950 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continuous Progress Bar Line */}
        <div className="mt-3 relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
