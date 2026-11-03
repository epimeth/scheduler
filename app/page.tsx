"use client";

import { useState, useEffect } from "react";
import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import Timeline from "@/components/Timeline";

export default function SchedulerApp() {
  const [sessions, setSessions] = useState<Session[]>([]);
  // Use a stable initial date to avoid Next.js hydration warnings during prerender
  const [currentDate, setCurrentDate] = useState(new Date("2024-01-01T00:00:00"));
  const [showWeekends, setShowWeekends] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setTodayStr(toISODate(now));
    setIsMounted(true);
  }, []);

  // Prevent rendering until the client has mounted to avoid hydration mismatches
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans text-zinc-900 dark:text-zinc-100">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Conflict-Aware Scheduler</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your weekly sessions and easily identify overlapping bookings.</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate} 
          sessions={sessions} 
        />
        <Timeline 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          sessions={sessions}
          showWeekends={showWeekends}
          setShowWeekends={setShowWeekends}
          todayStr={todayStr}
        />
      </main>
    </div>
  );
}
