export type Session = {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm (24-hour)
  durationMinutes: number;
};