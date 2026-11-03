"use client";

import { DragEvent, useState, PointerEvent } from "react";
import { Session } from "@/lib/types";
import { addMinutesToTime } from "@/lib/utils";

interface SessionBlockProps {
  session: Session;
  top: number;
  height: number;
  widthPercent: number;
  leftPercent: number;
  isConflicting: boolean;
  isOverflowing: boolean;
  isOverflow: boolean;
  maxDuration: number;
  minStart: number;
  onClick: () => void;
  onUpdateSession: (session: Session) => void;
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
  maxDuration,
  minStart,
  onClick,
  onUpdateSession
}: SessionBlockProps) {
  const [dragState, setDragState] = useState<{startY: number, startHeight: number, type: 'top' | 'bottom', startTop: number} | null>(null);
  const [localHeight, setLocalHeight] = useState<number | null>(null);
  const [localTop, setLocalTop] = useState<number | null>(null);

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
    if (dragState) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", session.id);
    
    // Calculate how far down the block the user clicked so it doesn't snap to the mouse awkwardly
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData("offsetY", offsetY.toString());
  };

  // HTML5 Pointer API for smooth, lock-on edge resizing
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>, type: 'top' | 'bottom') => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragState({ startY: e.clientY, startHeight: height, type, startTop: top });
    setLocalHeight(height);
    setLocalTop(top);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;
    e.stopPropagation(); // prevent interfering with drag-and-drop
    const delta = e.clientY - dragState.startY;
    
    if (dragState.type === 'bottom') {
      let newHeight = dragState.startHeight + delta;
      newHeight = Math.round(newHeight / 15) * 15; // Snap to 15 mins
      newHeight = Math.max(15, newHeight); // Enforce min 15 minutes
      newHeight = Math.min(newHeight, maxDuration); // Prevent crossing into the next session
      setLocalHeight(newHeight);
    } else {
      let newDelta = Math.round(delta / 15) * 15;
      
      if (dragState.startHeight - newDelta < 15) {
        newDelta = dragState.startHeight - 15;
      }
      
      if (dragState.startTop + newDelta < minStart) {
        newDelta = minStart - dragState.startTop;
      }
      
      setLocalTop(dragState.startTop + newDelta);
      setLocalHeight(dragState.startHeight - newDelta);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (localHeight !== null && localHeight !== height) {
      if (dragState.type === 'top' && localTop !== null && localTop !== top) {
        const deltaMins = localTop - top;
        const newStartTime = addMinutesToTime(session.startTime, deltaMins);
        onUpdateSession({ ...session, durationMinutes: localHeight, startTime: newStartTime });
      } else {
        onUpdateSession({ ...session, durationMinutes: localHeight });
      }
    }
    
    setDragState(null);
    setLocalHeight(null);
    setLocalTop(null);
  };

  const displayHeight = localHeight !== null ? localHeight : height;
  const displayTop = localTop !== null ? localTop : top;
  
  let displayStartTime = session.startTime;
  if (dragState?.type === 'top' && localTop !== null && localTop !== top) {
    displayStartTime = addMinutesToTime(session.startTime, localTop - top);
  }

  return (
    <div
      onClick={onClick}
      draggable={!dragState} // Disable native dragging when the user is trying to resize
      onDragStart={handleDragStart}
      className={`group absolute ${baseBg} border ${baseBorder} overflow-hidden z-10 hover:z-30 hover:shadow-md transition-shadow ${dragState ? 'cursor-ns-resize z-40' : 'cursor-grab active:cursor-grabbing'} ${radiusClass}`}
      style={{ 
        top: `${displayTop}px`, 
        height: `${displayHeight}px`,
        width: `calc(${widthPercent}% - 4px)`,
        left: `calc(${leftPercent}% + 2px)`
      }}
    >
      {/* Wrap content to prevent pointer events from interfering with the handle */}
      <div className="p-1.5 sm:p-2 h-full pointer-events-none">
        <div className={`text-xs font-semibold ${baseText} leading-tight`}>
          {isConflicting && <span className="mr-1">⚠️</span>}
          {session.title} {isOverflow && <span className="opacity-75">(cont.)</span>}
        </div>
        <div className={`text-[10px] ${subText} opacity-90 mt-0.5`}>
          {displayStartTime} {isConflicting && '- Conflict!'}
          {dragState && ` (${displayHeight}m)`}
        </div>
      </div>

      {/* Invisible resize handles that expand visually slightly on hover */}
      {!isOverflowing && !isOverflow && (
        <>
          <div 
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-black/0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            onPointerDown={(e) => handlePointerDown(e, 'top')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={(e) => e.stopPropagation()}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-black/0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            onPointerDown={(e) => handlePointerDown(e, 'bottom')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={(e) => e.stopPropagation()} // Prevent opening modal when clicking handle
          />
        </>
      )}
    </div>
  );
}