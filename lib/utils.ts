import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateHours(timeIn: string, timeOut: string): number {
  if (!timeIn || !timeOut) return 0;

  const [inHour, inMinute] = timeIn.split(":").map(Number);
  const [outHour, outMinute] = timeOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMinute;
  const outMinutes = outHour * 60 + outMinute;

  const diffMinutes = outMinutes - inMinutes;
  return Math.max(0, diffMinutes / 60);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatHours(hours: number): string {
  return hours.toFixed(2);
}

// NEW: Convert decimal hours to hours and minutes format
export function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hrs === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
  } else {
    return `${hrs} hr${hrs !== 1 ? "s" : ""} ${mins} min`;
  }
}

// NEW: Convert hours to days, hours, minutes for large values
export function formatHoursToDaysHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const hrs = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hrs > 0) parts.push(`${hrs} hr${hrs !== 1 ? "s" : ""}`);
  if (mins > 0) parts.push(`${mins} min`);

  return parts.length > 0 ? parts.join(" ") : "0 min";
}

export function calculateTotalHours(
  tasks: Array<{ hoursRendered: number }>,
): number {
  return tasks.reduce((total, task) => total + task.hoursRendered, 0);
}

export function calculateHoursFromTime(
  timeIn: string,
  timeOut: string,
): number {
  const [inHour, inMinute] = timeIn.split(":").map(Number);
  const [outHour, outMinute] = timeOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMinute;
  const outMinutes = outHour * 60 + outMinute;

  const diffMinutes = outMinutes - inMinutes;
  return Number((diffMinutes / 60).toFixed(2));
}
