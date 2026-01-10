"use client";

import React from "react";
import { OJTEntry } from "@/lib/types";
import { formatDate, formatHours } from "@/lib/utils";

interface TaskTableProps {
  entries: OJTEntry[];
  onDeleteTask: (entryId: string, taskId: string) => void;
}

interface FlatTask {
  entryId: string;
  taskId: string;
  date: Date;
  taskName: string;
  timeIn: string;
  timeOut: string;
  hoursRendered: number;
  category: string;
  status: string;
  learningOutcome: string;
  isFirstOfDate: boolean;
}

export default function TaskTable({ entries, onDeleteTask }: TaskTableProps) {
  // Flatten all tasks and group by date
  const flatTasks: FlatTask[] = [];
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sortedEntries.forEach((entry) => {
    entry.tasks.forEach((task, index) => {
      flatTasks.push({
        entryId: entry.id,
        taskId: task.id,
        date: entry.date,
        taskName: task.taskName,
        timeIn: task.timeIn,
        timeOut: task.timeOut,
        hoursRendered: task.hoursRendered,
        category: task.category,
        status: task.status,
        learningOutcome: entry.notes || "-",
        isFirstOfDate: index === 0,
      });
    });
  });

  const handleDelete = (entryId: string, taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(entryId, taskId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Task
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Learning Outcome
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {flatTasks.map((task) => (
            <tr
              key={`${task.entryId}-${task.taskId}`}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Date - only show for first task of the day */}
              <td className="px-6 py-4 whitespace-nowrap">
                {task.isFirstOfDate ? (
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(new Date(task.date))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">↳</div>
                )}
              </td>

              {/* Task Name */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 font-medium">
                  {task.taskName}
                </div>
              </td>

              {/* Time Range */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                  {task.timeIn} - {task.timeOut}
                </div>
              </td>

              {/* Hours */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-blue-600">
                  {formatHours(task.hoursRendered)} hrs
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 text-blue-700">
                  {task.category}
                </span>
              </td>

              {/* Learning Outcome */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 max-w-xs truncate">
                  {task.learningOutcome}
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleDelete(task.entryId, task.taskId)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {flatTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
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
          <p className="text-gray-500 text-sm">No tasks recorded yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Click &quot;Add Task&quot; to get started
          </p>
        </div>
      )}
    </div>
  );
}
