"use client";

import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";
import SessionBlock from "./SessionBlock";

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

  // 1. Gather all sessions that visually appear on this day
  const todaysSessionsRaw = sessions.filter(s => s.date === currentDayStr).map(s => {
    const [h, m] = s.startTime.split(':').map(Number);
    return { ...s, startMin: h * 60 + m, endMin: h * 60 + m + s.durationMinutes, isOverflow: false, originalSession: s };
  });

  const overflowingFromYesterday = sessions.filter(s => {
    if (s.date !== prevDayStr) return false;
    const [h, m] = s.startTime.split(':').map(Number);
    return (h * 60 + m) + s.durationMinutes > 1440; // Crosses midnight
  }).map(s => {
    const [h, m] = s.startTime.split(':').map(Number);
    const overflowHeight = (h * 60 + m) + s.durationMinutes - 1440;
    return { ...s, id: `${s.id}-overflow`, startMin: 0, endMin: overflowHeight, isOverflow: true, originalSession: s };
  });

  const combinedSessions = [...todaysSessionsRaw, ...overflowingFromYesterday]
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  // 2. Group overlapping sessions
  const groups: (typeof combinedSessions)[] = [];
  let currentGroup: typeof combinedSessions = [];
  let groupEnd = 0;

  combinedSessions.forEach(s => {
    if (s.startMin < groupEnd) {
      currentGroup.push(s);
      groupEnd = Math.max(groupEnd, s.endMin);
    } else {
      if (currentGroup.length > 0) groups.push(currentGroup);
      currentGroup = [s];
      groupEnd = s.endMin;
    }
  });
  if (currentGroup.length > 0) groups.push(currentGroup);

  // 3. Assign columns and flags
  const layoutSessions: (typeof combinedSessions[0] & { column: number, totalColumns: number, isConflicting: boolean })[] = [];
  
  groups.forEach(group => {
    const isConflicting = group.length > 1; // Any group with >1 item has overlapping conflicts
    const columns: typeof currentGroup[] = [];
    const groupLayouts: any[] = [];

    group.forEach(s => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        // Using <= safely allows back-to-back sessions in the same column without flagging as conflict
        if (lastInCol.endMin <= s.startMin) {
          columns[i].push(s);
          groupLayouts.push({ ...s, column: i, isConflicting });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([s]);
        groupLayouts.push({ ...s, column: columns.length - 1, isConflicting });
      }
    });

    groupLayouts.forEach(s => {
      s.totalColumns = columns.length;
      layoutSessions.push(s);
    });
  });

  return (
    <>
      {layoutSessions.map(session => {
        const isOverflowing = session.endMin > 1440 && !session.isOverflow;
        const height = session.isOverflow ? session.endMin : Math.min(session.durationMinutes, 1440 - session.startMin);
        const top = session.startMin;
        
        const widthPercent = 100 / session.totalColumns;
        const leftPercent = session.column * widthPercent;

        return (
          <SessionBlock
            key={session.id}
            session={session.originalSession}
            top={top}
            height={height}
            widthPercent={widthPercent}
            leftPercent={leftPercent}
            isConflicting={session.isConflicting}
            isOverflowing={isOverflowing}
            isOverflow={session.isOverflow}
            onClick={() => onSessionClick(session.originalSession)}
          />
        );
      })}
    </>
  );
}