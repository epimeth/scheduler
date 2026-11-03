"use client";

import { useState, useMemo } from "react";

export type Session = {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm (24-hour)
  durationMinutes: number;
};

// Lightweight helper to format Date objects consistently to YYYY-MM-DD
function toISODate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SchedulerApp() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWeekends, setShowWeekends] = useState(false);

  // --- Computed Date Data ---

  // Always start our timeline on the Monday of the selected week
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  // Generate the columns for our timeline (5 or 7 days)
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

  // Check if the current week has weekend sessions to highlight the toggle
  const hasWeekendSessions = useMemo(() => {
    const saturday = new Date(startOfWeek);
    saturday.setDate(startOfWeek.getDate() + 5);
    const sunday = new Date(startOfWeek);
    sunday.setDate(startOfWeek.getDate() + 6);
    
    const satStr = toISODate(saturday);
    const sunStr = toISODate(sunday);
    
    return sessions.some((s) => s.date === satStr || s.date === sunStr);
  }, [startOfWeek, sessions]);

  // Generate the days for the mini-calendar (Month View aligned to Monday)
  const miniCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = startPadding; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    const remainder = days.length % 7;
    if (remainder !== 0) {
      for (let i = 1; i <= 7 - remainder; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }
    return days;
  }, [currentDate]);

  // --- Navigation Handlers ---
  
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

  const todayStr = toISODate(new Date());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans text-zinc-900 dark:text-zinc-100">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Conflict-Aware Scheduler</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your weekly sessions and easily identify overlapping bookings.</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar / Form Area */}
        <div className="lg:col-span-1 space-y-6">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
            + Add Session
          </button>
          
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Mini Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">&larr;</button>
              <span className="font-semibold text-sm">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">&rarr;</button>
            </div>
            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-zinc-500 font-medium">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {miniCalendarDays.map((day, i) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const dateStr = toISODate(day);
                const hasSession = sessions.some(s => s.date === dateStr);
                const isSelected = dateStr === toISODate(currentDate);
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentDate(day)}
                    className={`p-1.5 rounded-md transition-colors ${!isCurrentMonth ? 'text-zinc-400 dark:text-zinc-600' : ''} ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'} ${hasSession && !isSelected ? 'underline decoration-blue-500 decoration-2 underline-offset-4' : ''}`}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Timeline / Schedule View */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden min-h-[700px]">
          
          {/* Timeline Header Controls */}
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

          {/* Timeline Days Grid Placeholder */}
          <div className="flex flex-1 overflow-x-auto">
            {weekDays.map((day) => {
              const isToday = toISODate(day) === todayStr;
              return (
                <div key={day.toISOString()} className="flex-1 min-w-[150px] border-r border-zinc-200 dark:border-zinc-800 last:border-r-0">
                  <div className="p-3 text-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className={`mt-1 text-xl ${isToday ? 'bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold shadow-sm' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="h-[800px] relative bg-zinc-50/30 dark:bg-zinc-950/30">
                    <p className="text-xs text-center mt-8 text-zinc-400">Timeline coming soon...</p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
