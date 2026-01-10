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
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatHours(hours: number): string {
  return hours.toFixed(2);
}
