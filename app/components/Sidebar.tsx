"use client";

import { Session } from "@/lib/types";
import MiniCalendar from "./MiniCalendar";

interface SidebarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  sessions: Session[];
  onAddClick: () => void;
}

export default function Sidebar({ currentDate, setCurrentDate, sessions, onAddClick }: SidebarProps) {
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
    </div>
  );
}