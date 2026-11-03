import { Session } from "@/lib/types";
import { toISODate } from "@/lib/utils";

export function getSeedData(type: 'normal' | 'busy' | 'conflicts', baseDate: Date = new Date()): Session[] {
  // Find Monday of the week for the provided baseDate
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  
  // Generate date strings for Monday through Friday
  const days = Array.from({length: 5}, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return toISODate(d);
  });

  if (type === 'normal') {
    return [
      { id: 'seed-n1', title: 'Morning Standup', date: days[0], startTime: '09:00', durationMinutes: 30 },
      { id: 'seed-n2', title: 'Team Sync', date: days[0], startTime: '11:00', durationMinutes: 60 },
      { id: 'seed-n3', title: 'Lunch', date: days[0], startTime: '12:00', durationMinutes: 60 },
      { id: 'seed-n4', title: 'Project Review', date: days[1], startTime: '14:00', durationMinutes: 90 },
      { id: 'seed-n5', title: '1:1 with Manager', date: days[2], startTime: '10:00', durationMinutes: 45 },
      { id: 'seed-n6', title: 'Design Sync', date: days[3], startTime: '13:00', durationMinutes: 60 },
      { id: 'seed-n7', title: 'Weekly Wrap-up', date: days[4], startTime: '16:00', durationMinutes: 30 },
    ];
  }

  if (type === 'busy') {
    const sessions: Session[] = [];
    let idCounter = 1;
    days.forEach(date => {
      // Create 8 sessions a day!
      for (let hour = 9; hour <= 16; hour++) {
        sessions.push({
          id: `seed-b${idCounter++}`,
          title: `Meeting ${idCounter}`,
          date,
          startTime: `${String(hour).padStart(2, '0')}:00`,
          durationMinutes: 45
        });
      }
    });
    return sessions;
  }

  if (type === 'conflicts') {
    return [
      { id: 'seed-c1', title: 'Project A Kickoff', date: days[0], startTime: '09:00', durationMinutes: 120 },
      { id: 'seed-c2', title: 'Urgent Client Call', date: days[0], startTime: '10:00', durationMinutes: 60 },
      { id: 'seed-c3', title: 'Team Sync', date: days[0], startTime: '10:30', durationMinutes: 30 },
      
      { id: 'seed-c4', title: 'Lunch', date: days[1], startTime: '12:00', durationMinutes: 60 },
      { id: 'seed-c5', title: 'Interview Candidate', date: days[1], startTime: '12:30', durationMinutes: 45 },
      
      { id: 'seed-c6', title: 'Workshop Part 1', date: days[2], startTime: '13:00', durationMinutes: 180 },
      { id: 'seed-c7', title: 'Workshop Part 2', date: days[2], startTime: '14:00', durationMinutes: 60 },
      { id: 'seed-c8', title: 'Doctor Appointment', date: days[2], startTime: '15:30', durationMinutes: 60 },
    ];
  }

  return [];
}