import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Clock,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Droplets,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { GeneratedTimetable, GenerationReport } from '../types';
import {
  getDetailedLabAllocations,
  getTimetableReportingMetrics,
} from '../utils/timetableReporting';

interface GenerationReportCardProps {
  report: GenerationReport;
  divisionName: string;
  timetable: GeneratedTimetable;
}

export const GenerationReportCard: React.FC<GenerationReportCardProps> = ({
  report,
  divisionName,
  timetable,
}) => {
  const [showClashDetails, setShowClashDetails] = useState(false);
  const [showLabDetails, setShowLabDetails] = useState(false);
  const metrics = getTimetableReportingMetrics(timetable);
  const detailedLabAllocations = getDetailedLabAllocations(timetable);

  const hasWarnings = report.warningMessages && report.warningMessages.length > 0;
  const hasClashesResolved = report.clashDetails && report.clashDetails.length > 0;
  const hasLabs = detailedLabAllocations.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden print:hidden transition-all">
      {/* Main Status Header */}
      <div
        className={`p-4 sm:p-5 border-b ${
          hasWarnings
            ? 'bg-amber-50/70 border-amber-200/80'
            : 'bg-emerald-50/60 border-emerald-200/70'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                hasWarnings
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {hasWarnings ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900">
                  {hasWarnings
                    ? 'Timetable Generated with Warnings'
                    : 'College Schedule Ready (09:30 AM – 05:00 PM)'}
                </h4>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    hasWarnings
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Div {divisionName}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{metrics.freeSlots} Free Slots</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                {report.successMessage}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Allocated {metrics.allocatedPeriods} of {metrics.requiredPeriods} required periods;
                {' '}{metrics.unallocatedPeriods} periods unallocated.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Division occupancy {metrics.divisionPlacedPeriods} of {metrics.divisionCapacity};
                {' '}{metrics.divisionFreeSlots} free slots.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <div className="bg-white/90 border border-slate-200/80 rounded-xl px-3 py-1.5 text-center shadow-2xs">
              <span className="block text-xs text-slate-500 font-medium">Allocated Periods</span>
              <span className="text-sm font-extrabold text-slate-800">
                {metrics.allocatedPeriods} / {metrics.requiredPeriods}
              </span>
            </div>
            <div className="bg-white/90 border border-slate-200/80 rounded-xl px-3 py-1.5 text-center shadow-2xs">
              <span className="block text-xs text-slate-500 font-medium">Unallocated</span>
              <span className="text-sm font-extrabold text-amber-700">
                {metrics.unallocatedPeriods}
              </span>
            </div>
            <div className="bg-white/90 border border-slate-200/80 rounded-xl px-3 py-1.5 text-center shadow-2xs">
              <span className="block text-xs text-slate-500 font-medium">College Hours</span>
              <span className="text-sm font-bold text-indigo-700">09:30 – 05:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Constraints & Verifications Strip */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/60 border-b border-slate-100 text-xs">
        {/* Working Days */}
        <div className="flex items-center gap-2.5 text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <span className="font-semibold block text-slate-900">Monday to Saturday</span>
            <span className="text-[11px] text-slate-500">6 Continuous Working Days</span>
          </div>
        </div>

        {/* Fixed Lunch Break */}
        <div className="flex items-center gap-2.5 text-slate-700">
          <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-semibold block text-slate-900">Lunch Break (60 min)</span>
            <span className="text-[11px] text-amber-700 font-mono font-medium">12:45 PM – 01:45 PM</span>
          </div>
        </div>

        {/* Water Breaks */}
        <div className="flex items-center gap-2.5 text-slate-700">
          <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
          <div>
            <span className="font-semibold block text-slate-900">2 Water Breaks (15m each)</span>
            <span className="text-[11px] text-sky-700 font-mono font-medium">11:30 AM & 02:45 PM</span>
          </div>
        </div>

        {/* Practical Activity Rule */}
        <div className="flex items-center gap-2.5 text-slate-700">
          <FlaskConical className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <span className="font-semibold block text-slate-900">Requested practical blocks</span>
            <span className="text-[11px] text-slate-500">
              {metrics.labSessions}/{metrics.requiredLabSessions} sessions; {metrics.labOccupiedPeriods} occupied periods
            </span>
          </div>
        </div>
      </div>

      {/* Warning Box if any subject was unplaced */}
      {hasWarnings && (
        <div className="p-4 bg-amber-50/50 border-b border-amber-200/60 text-xs">
          <h5 className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Target Periods Distribution Notes</span>
          </h5>
          <ul className="space-y-1 text-amber-800 list-disc list-inside">
            {report.warningMessages.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable Clashes Avoided Section */}
      {hasClashesResolved && (
        <div className="border-b border-slate-100">
          <button
            type="button"
            onClick={() => setShowClashDetails(!showClashDetails)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>
                View {report.clashesAvoided} Cross-Division Faculty Conflict
                {report.clashesAvoided > 1 ? 's' : ''} Auto-Shifted
              </span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              {showClashDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {showClashDetails && (
            <div className="p-4 bg-indigo-50/40 space-y-2 border-t border-indigo-100 text-xs">
              <p className="text-[11px] text-slate-600 mb-2">
                The generator checked the global master timetable store across all departments &
                divisions. To avoid double-booking faculty, conflicting periods were automatically shifted
                to alternative clash-free slots:
              </p>
              <div className="space-y-2">
                {report.clashDetails.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white rounded-xl border border-indigo-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block sm:inline">
                        {c.teacherName}
                      </span>
                      <span className="text-slate-500 sm:ml-2">
                        Teaching <strong className="text-slate-700">{c.subjectName}</strong>
                      </span>
                      <div className="text-[11px] text-rose-600 mt-0.5">
                        Occupied in {c.conflictingDivision} on {c.conflictDay} (Period {c.conflictPeriod})
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium shrink-0 self-start sm:self-auto">
                      <span>Shifted to:</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <strong className="font-bold">
                        {c.shiftedToDay} (Period {c.shiftedToPeriod})
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expandable Lab Allocations (2-hour blocks & once per week guarantee) */}
      {hasLabs && (
        <div>
          <button
            type="button"
            onClick={() => setShowLabDetails(!showLabDetails)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-purple-700">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>
                Practical Labs ({detailedLabAllocations.length} Sessions) • {metrics.batchAllocations} batch allocations
              </span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              {showLabDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {showLabDetails && (
            <div className="p-4 bg-purple-50/40 space-y-2 border-t border-purple-100 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-purple-900 font-medium mb-2 bg-purple-100/60 p-2 rounded-lg">
                <Info className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>
                  Lab rules applied: labs use valid consecutive teaching periods, suitable laboratory rooms, and remain unplaced when resources are unavailable.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {detailedLabAllocations.map((lab) => (
                  <div
                    key={`${lab.day}-${lab.periodNumber}-${lab.studentGroup}-${lab.subjectId}-${lab.room}`}
                    className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-900">
                          {lab.subjectCode}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {lab.room}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-indigo-700 mb-1">
                        {lab.studentGroup}
                      </div>
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {lab.subjectName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Faculty: <span className="font-semibold text-slate-700">{lab.teacherName}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold">
                        {lab.day} • P{lab.periodNumbers.join(' + P')}
                      </span>
                      <span className="text-slate-600 font-mono font-semibold">
                        {lab.startTime} – {lab.endTime} ({lab.durationHours} hrs)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
