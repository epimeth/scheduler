// Lightweight helper to format Date objects consistently to YYYY-MM-DD
export function toISODate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function addMinutesToTime(timeStr: string, deltaMins: number): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  const padHours = match[1].length === 2;

  if (period) {
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  let totalMins = hours * 60 + mins + deltaMins;
  totalMins = ((totalMins % 1440) + 1440) % 1440;

  let newHours = Math.floor(totalMins / 60);
  const newMins = totalMins % 60;

  if (period) {
    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    let displayHours = newHours % 12;
    if (displayHours === 0) displayHours = 12;
    const hoursStr = padHours ? displayHours.toString().padStart(2, '0') : displayHours.toString();
    return `${hoursStr}:${newMins.toString().padStart(2, '0')} ${newPeriod}`;
  } else {
    const hoursStr = padHours ? newHours.toString().padStart(2, '0') : newHours.toString();
    return `${hoursStr}:${newMins.toString().padStart(2, '0')}`;
  }
}