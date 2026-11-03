"use client";

import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";

interface DaySessionsProps {
  day: Date;
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

export default function DaySessions({ day, sessions, onSessionClick }: DaySessionsProps) {
  const currentDayStr = toISODate(day);
  const prevDay = new Date(day);
  prevDay.setDate(prevDay.getDate() - 1);
  const prevDayStr = toISODate(prevDay);

  const todaysSessions = sessions.filter(s => s.date === currentDayStr);
  const overflowingFromYesterday = sessions.filter(s => {
    if (s.date !== prevDayStr) return false;
    const [h, m] = s.startTime.split(':').map(Number);
    return (h * 60 + m) + s.durationMinutes > 1440; // Crosses midnight
  });

  return (
    <>
      {todaysSessions.map(session => {
        const [hours, minutes] = session.startTime.split(':').map(Number);
        const top = hours * 60 + minutes;
        const isOverflowing = top + session.durationMinutes > 1440;
        const height = Math.min(session.durationMinutes, 1440 - top); // Cap at 24:00
        
        return (
          <div
            key={session.id}
            onClick={() => onSessionClick(session)}
            className={`absolute left-1 right-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-700 p-1.5 sm:p-2 overflow-hidden z-10 hover:z-20 hover:shadow-md transition-all cursor-pointer ${isOverflowing ? 'rounded-t-md rounded-b-none border-b-dashed border-b-2' : 'rounded-md'}`}
            style={{ top: `${top}px`, height: `${height}px` }}
          >
            <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 leading-tight">{session.title}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 opacity-90 mt-0.5">{session.startTime}</div>
          </div>
        );
      })}
      {overflowingFromYesterday.map(session => {
        const [hours, minutes] = session.startTime.split(':').map(Number);
        const top = hours * 60 + minutes;
        const overflowHeight = (top + session.durationMinutes) - 1440;
        
        return (
          <div
            key={`${session.id}-overflow`}
            onClick={() => onSessionClick(session)}
            className="absolute left-1 right-1 top-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-700 rounded-b-md rounded-t-none border-t-dashed border-t-2 p-1.5 sm:p-2 overflow-hidden z-10 hover:z-20 hover:shadow-md transition-all cursor-pointer"
            style={{ height: `${overflowHeight}px` }}
          >
            <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 leading-tight">{session.title} <span className="opacity-75">(cont.)</span></div>
          </div>
        );
      })}
    </>
  );
}