"use client";

import { Session } from "@/lib/types";
import MiniCalendar from "./MiniCalendar";

interface SidebarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  sessions: Session[];
  onAddClick: () => void;
  onLoadSeed?: (type: 'normal' | 'busy' | 'conflicts') => void;
}

export default function Sidebar({ currentDate, setCurrentDate, sessions, onAddClick, onLoadSeed }: SidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <button 
        onClick={onAddClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
      >
        + Add Session
      </button>
      <MiniCalendar 
        currentDate={currentDate} 
        setCurrentDate={setCurrentDate} 
        sessions={sessions} 
      />

      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Seed</h3>
        <div className="space-y-2">
          <button 
            onClick={() => onLoadSeed?.('normal')}
            className="w-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium py-2 px-3 rounded-md transition-colors text-left border border-zinc-200 dark:border-zinc-700"
          >
            Normal Schedule
          </button>
          <button 
            onClick={() => onLoadSeed?.('busy')}
            className="w-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium py-2 px-3 rounded-md transition-colors text-left border border-zinc-200 dark:border-zinc-700"
          >
            Many Appointments
          </button>
          <button 
            onClick={() => onLoadSeed?.('conflicts')}
            className="w-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium py-2 px-3 rounded-md transition-colors text-left border border-zinc-200 dark:border-zinc-700"
          >
            Schedule with Conflicts
          </button>
        </div>
      </div>
    </div>
  );
}