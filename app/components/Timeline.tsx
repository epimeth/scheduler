"use client";

import { useMemo, useState, useEffect } from "react";
import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";
import DaySessions from "./DaySessions";

interface TimelineProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  sessions: Session[];
  showWeekends: boolean;
  setShowWeekends: (show: boolean) => void;
  todayStr: string;
  onSessionClick: (session: Session) => void;
  onUpdateSession: (session: Session) => void;
}

export default function Timeline({
  currentDate,
  setCurrentDate,
  sessions,
  showWeekends,
  setShowWeekends,
  todayStr,
  onSessionClick,
  onUpdateSession
}: TimelineProps) {
  // Track current time to position the red indicator line
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // At 1px per minute, 24 hours = 1440px height.
  const currentTimeTop = now.getHours() * 60 + now.getMinutes();

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const numDays = showWeekends ? 7 : 5;
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [startOfWeek, showWeekends]);

  const hasWeekendSessions = useMemo(() => {
    const saturday = new Date(startOfWeek);
    saturday.setDate(startOfWeek.getDate() + 5);
    const sunday = new Date(startOfWeek);
    sunday.setDate(startOfWeek.getDate() + 6);
    
    const satStr = toISODate(saturday);
    const sunStr = toISODate(sunday);
    
    return sessions.some((s) => s.date === satStr || s.date === sunStr);
  }, [startOfWeek, sessions]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  // Generate 24 hours (0-23) for the grid
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Handle drop to reschedule session
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetDay: Date) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData("text/plain");
    if (!sessionId) return;
    
    const offsetY = parseFloat(e.dataTransfer.getData("offsetY")) || 0;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top - offsetY;

    // Snap to 15 mins (15px) and clamp between 00:00 and the end of the day
    let totalMinutes = Math.round(y / 15) * 15;
    totalMinutes = Math.max(0, Math.min(totalMinutes, 1440 - session.durationMinutes));

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const newStartTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    
    onUpdateSession({ ...session, date: toISODate(targetDay), startTime: newStartTime });
  };

  return (
    <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden min-h-[700px]">
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevWeek} className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">&larr; Prev</button>
          <button onClick={handleToday} className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">Today</button>
          <button onClick={handleNextWeek} className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">Next &rarr;</button>
        </div>
        <label className={`flex items-center space-x-2 text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer border ${hasWeekendSessions ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/50 font-medium' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
          <input type="checkbox" checked={showWeekends} onChange={(e) => setShowWeekends(e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-700" />
          <span>Show Weekends {hasWeekendSessions && '(Action Required)'}</span>
        </label>
      </div>

      {/* Scrollable Timeline Area */}
      <div className="flex flex-1 overflow-auto relative">
        <div className="inline-flex min-w-full">
          
          {/* Left Column: Time Labels */}
          <div className="w-16 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky left-0 z-20">
            <div className="h-20 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-30"></div>
            <div className="relative h-[1440px]">
              {hours.map(hour => (
                <div key={hour} className="absolute w-full text-right pr-2 text-xs text-zinc-500 font-medium" style={{ top: `${hour * 60}px`, marginTop: '-8px' }}>
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>
          </div>

          {/* Days Columns */}
          {weekDays.map((day) => {
            const isToday = toISODate(day) === todayStr;
            return (
              <div key={day.toISOString()} className="flex-1 min-w-[150px] border-r border-zinc-200 dark:border-zinc-800 last:border-r-0">
                {/* Day Header (Sticky) */}
                <div className="h-20 p-3 text-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm sticky top-0 z-10">
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className={`mt-2 text-xl ${isToday ? 'bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center mx-auto font-bold shadow-sm' : ''}`}>{day.getDate()}</div>
                </div>
                
                {/* 24-Hour Day Timeline */}
                <div 
                  className="relative h-[1440px] bg-zinc-50/30 dark:bg-zinc-950/30"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  {/* Hourly Grid Lines */}
                  {hours.map(hour => (
                    <div key={hour} className="absolute w-full border-t border-zinc-200 dark:border-zinc-800 opacity-50 pointer-events-none" style={{ top: `${hour * 60}px` }} />
                  ))}
                  
                  {/* Current Time Indicator */}
                  {isToday && (
                    <div className="absolute w-full z-20 pointer-events-none" style={{ top: `${currentTimeTop}px` }}>
                      <div className="absolute left-0 w-full h-[2px] bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>
                      <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
                    </div>
                  )}

                  <DaySessions 
                    day={day} 
                    sessions={sessions} 
                    onSessionClick={onSessionClick} 
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}