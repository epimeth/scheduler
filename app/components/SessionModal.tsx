"use client";

import { useState, useEffect, FormEvent } from "react";
import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<Session, "id">, id?: string) => void;
  onDelete?: (id: string) => void;
  initialDate: Date;
  editingSession?: Session | null;
  sessions: Session[];
}

export default function SessionModal({ isOpen, onClose, onSave, onDelete, initialDate, editingSession, sessions }: SessionModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  // Reset form with default values when opened
  useEffect(() => {
    if (isOpen) {
      if (editingSession) {
        setTitle(editingSession.title);
        setDate(editingSession.date);
        setStartTime(editingSession.startTime);
        setDuration(editingSession.durationMinutes);
      } else {
        setTitle("");
        setDate(toISODate(initialDate));
        setStartTime("09:00");
        setDuration(60);
      }
      setShowDeleteConfirm(false);
      setShowConflictWarning(false);
    }
  }, [isOpen, initialDate, editingSession]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!showConflictWarning) {
      // Check for conflicts before saving
      const proposedStartMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const proposedEndMin = proposedStartMin + Number(duration);
      
      const hasConflict = sessions.some(s => {
        if (s.id === editingSession?.id) return false;
        if (s.date !== date) return false;
        const sStartMin = parseInt(s.startTime.split(':')[0]) * 60 + parseInt(s.startTime.split(':')[1]);
        const sEndMin = sStartMin + s.durationMinutes;
        // Using strict inequalities (so back-to-back sessions are fine)
        return sStartMin < proposedEndMin && sEndMin > proposedStartMin;
      });

      if (hasConflict) {
        setShowConflictWarning(true);
        return; // Stop submission and show warning
      }
    }

    onSave({
      title,
      date,
      startTime,
      durationMinutes: Number(duration),
    }, editingSession?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">{editingSession ? "Edit Session" : "Add New Session"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {showConflictWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
              <strong>Warning:</strong> This session conflicts with an existing one. Do you still want to save it?
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Team Sync"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setShowConflictWarning(false);
              }}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setShowConflictWarning(false);
                }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Duration (mins)</label>
              <input
                type="number"
                required
                min="15"
                step="15"
                value={duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  setShowConflictWarning(false);
                }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div>
              {editingSession && onDelete && (
                showDeleteConfirm ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                    <button type="button" onClick={() => { onDelete(editingSession.id); onClose(); }} className="px-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors">Yes, delete</button>
                    <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">Delete</button>
                )
              )}
            </div>
            <div className="flex space-x-3 w-full sm:w-auto justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">Cancel</button>
              <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-sm ${showConflictWarning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{showConflictWarning ? 'Save Anyway' : 'Save Session'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
