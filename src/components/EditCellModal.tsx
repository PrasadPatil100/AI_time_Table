import React, { useState } from 'react';
import { Subject, TimetableCell } from '../types';
import { X, ArrowLeftRight, Check, MapPin, User, BookOpen } from 'lucide-react';

interface EditCellModalProps {
  cell: TimetableCell | null;
  availableSubjects: Subject[];
  onClose: () => void;
  onSave: (updatedCell: TimetableCell) => void;
  onClear: () => void;
}

export const EditCellModal: React.FC<EditCellModalProps> = ({
  cell,
  availableSubjects,
  onClose,
  onSave,
  onClear,
}) => {
  if (!cell) return null;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    cell.subject?.id || availableSubjects[0]?.id || ''
  );
  const [customTeacher, setCustomTeacher] = useState<string>(
    cell.subject?.teacherName || ''
  );
  const [room, setRoom] = useState<string>(cell.room || 'Room 301');

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedSubjectId(sId);
    const found = availableSubjects.find((s) => s.id === sId);
    if (found) {
      setCustomTeacher(found.teacherName);
      if (found.classroomNumber) {
        setRoom(found.isLab ? `Lab ${found.classroomNumber}` : `Room ${found.classroomNumber}`);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const baseSubj = availableSubjects.find((s) => s.id === selectedSubjectId);
    if (!baseSubj) return;

    const updatedCell: TimetableCell = {
      ...cell,
      room: room.trim() || 'Room 301',
      subject: {
        ...baseSubj,
        teacherName: customTeacher.trim() || baseSubj.teacherName,
      },
    };

    onSave(updatedCell);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Edit Timetable Slot
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {cell.day} • {cell.timeSlot.startTime} - {cell.timeSlot.endTime}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={handleSubjectChange}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.teacherName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teacher / Instructor for this Slot
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={customTeacher}
                onChange={(e) => setCustomTeacher(e.target.value)}
                placeholder="Teacher Name"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Classroom / Lecture Hall
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Hall 301, Lab B"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition"
            >
              Make Free Slot
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
