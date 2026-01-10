import { OJTEntry, OJTStats } from "./types";

export function calculateStats(
  entries: OJTEntry[],
  requiredHours: number
): OJTStats {
  const completedHours = entries.reduce(
    (sum, entry) => sum + entry.totalHours,
    0
  );
  const remainingHours = Math.max(0, requiredHours - completedHours);
  const progressPercentage = Math.min(
    100,
    (completedHours / requiredHours) * 100
  );

  return {
    totalHours: requiredHours,
    completedHours,
    remainingHours,
    progressPercentage,
    entriesCount: entries.length,
  };
}
