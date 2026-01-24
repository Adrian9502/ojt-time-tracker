"use client";

import { OJTEntry } from "@/lib/types";
import { formatHoursMinutes } from "@/lib/utils";

interface DateDetailsModalProps {
  isOpen: boolean;
  date: Date;
  entries: OJTEntry[];
  onClose: () => void;
}

export default function DateDetailsModal({
  isOpen,
  date,
  entries,
  onClose,
}: DateDetailsModalProps) {
  if (!isOpen) return null;

  // Get all tasks for this date
  const tasksForDate = entries.flatMap((entry) =>
    entry.tasks.map((task) => ({
      ...task,
      learningOutcome: entry.notes || "-",
      entryDate: entry.date,
    })),
  );

  // Sort tasks by time (earliest first)
  const sortedTasks = tasksForDate.sort((a, b) => {
    const timeA = a.timeIn.split(":").map(Number);
    const timeB = b.timeIn.split(":").map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const totalHours = sortedTasks.reduce(
    (sum, task) => sum + task.hoursRendered,
    0,
  );

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {dateStr}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {sortedTasks.length}{" "}
                {sortedTasks.length === 1 ? "task" : "tasks"} •{" "}
                {formatHoursMinutes(totalHours)} hours total
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tasks List - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tasks for this date
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              {sortedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg sm:rounded-xl border border-blue-100 dark:border-gray-600 p-3 sm:p-5 hover:shadow-md transition-all"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                          {task.taskName}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 truncate">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Details Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-3">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
                        Time In
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {task.timeIn}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
                        Time Out
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {task.timeOut}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
                        Duration
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatHoursMinutes(task.hoursRendered)} hrs
                      </p>
                    </div>
                  </div>

                  {/* Learning Outcome */}
                  {task.learningOutcome !== "-" && (
                    <div className="pt-2 sm:pt-3 border-t border-blue-200 dark:border-gray-600">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
                        Learning Outcome
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {task.learningOutcome}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Hours for This Day
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                {formatHoursMinutes(totalHours)} hours
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
