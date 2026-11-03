"use client";

import { DragEvent } from "react";
import { Session } from "@/lib/types";

interface SessionBlockProps {
  session: Session;
  top: number;
  height: number;
  widthPercent: number;
  leftPercent: number;
  isConflicting: boolean;
  isOverflowing: boolean;
  isOverflow: boolean;
  onClick: () => void;
}

export default function SessionBlock({
  session,
  top,
  height,
  widthPercent,
  leftPercent,
  isConflicting,
  isOverflowing,
  isOverflow,
  onClick
}: SessionBlockProps) {
  // Conditional styling for conflicts
  const baseBg = isConflicting ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20';
  const baseBorder = isConflicting ? 'border-red-400 dark:border-red-700' : 'border-blue-400 dark:border-blue-700';
  const baseText = isConflicting ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200';
  const subText = isConflicting ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';
  
  let radiusClass = 'rounded-md';
  if (isOverflowing) radiusClass = 'rounded-t-md rounded-b-none border-b-dashed border-b-2';
  if (isOverflow) radiusClass = 'rounded-b-md rounded-t-none border-t-dashed border-t-2';

  // Setup HTML5 Drag and Drop payload
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", session.id);
    
    // Calculate how far down the block the user clicked so it doesn't snap to the mouse awkwardly
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData("offsetY", offsetY.toString());
  };

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      className={`absolute ${baseBg} border ${baseBorder} p-1.5 sm:p-2 overflow-hidden z-10 hover:z-30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${radiusClass}`}
      style={{ 
        top: `${top}px`, 
        height: `${height}px`,
        width: `calc(${widthPercent}% - 4px)`,
        left: `calc(${leftPercent}% + 2px)`
      }}
    >
      <div className={`text-xs font-semibold ${baseText} leading-tight`}>
        {isConflicting && <span className="mr-1">⚠️</span>}
        {session.title} {isOverflow && <span className="opacity-75">(cont.)</span>}
      </div>
      <div className={`text-[10px] ${subText} opacity-90 mt-0.5`}>
        {session.startTime} {isConflicting && '- Conflict!'}
      </div>
    </div>
  );
}