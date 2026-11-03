"use client";

import { useMemo } from "react";
import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";

interface MiniCalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  sessions: Session[];
}

export default function MiniCalendar({ currentDate, setCurrentDate, sessions }: MiniCalendarProps) {
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

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">&larr;</button>
        <span className="font-semibold text-sm">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">&rarr;</button>
      </div>
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
            <button key={i} onClick={() => setCurrentDate(day)} className={`p-1.5 rounded-md transition-colors ${!isCurrentMonth ? 'text-zinc-400 dark:text-zinc-600' : ''} ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'} ${hasSession && !isSelected ? 'underline decoration-blue-500 decoration-2 underline-offset-4' : ''}`}>
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  );
}