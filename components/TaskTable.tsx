"use client";

import React, { useState } from "react";
import { OJTEntry } from "@/lib/types";
import { formatDate, formatHours } from "@/lib/utils";
import ConfirmationModal from "./ConfirmationModal";
import { toast } from "react-toastify";

interface TaskTableProps {
  entries: OJTEntry[];
  onDeleteTask: (entryId: string, taskId: string) => void;
  onEditTask: (entry: OJTEntry, taskId: string) => void;
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
  supervisor: string;
  createdAt: Date;
}

export default function TaskTable({
  entries,
  onDeleteTask,
  onEditTask,
}: TaskTableProps) {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    entryId: string;
    taskId: string;
    taskName: string;
  }>({
    isOpen: false,
    entryId: "",
    taskId: "",
    taskName: "",
  });

  // FIXED: Flatten all tasks first, then sort globally by createdAt
  const allTasks: Omit<FlatTask, "isFirstOfDate">[] = [];

  entries.forEach((entry) => {
    entry.tasks.forEach((task) => {
      allTasks.push({
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
        supervisor: entry.supervisor,
        createdAt: task.createdAt,
      });
    });
  });

  // Sort all tasks globally by createdAt (newest first)
  const sortedTasks = allTasks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Mark first occurrence of each date
  const seenDates = new Set<string>();
  const flatTasks: FlatTask[] = sortedTasks.map((task) => {
    const dateKey = new Date(task.date).toDateString();
    const isFirstOfDate = !seenDates.has(dateKey);
    if (isFirstOfDate) {
      seenDates.add(dateKey);
    }
    return {
      ...task,
      isFirstOfDate,
    };
  });

  const handleDeleteClick = (
    entryId: string,
    taskId: string,
    taskName: string,
  ) => {
    setConfirmModal({
      isOpen: true,
      entryId,
      taskId,
      taskName,
    });
  };

  const handleEditClick = (entryId: string, taskId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      onEditTask(entry, taskId);
    }
  };

  const handleConfirmDelete = () => {
    onDeleteTask(confirmModal.entryId, confirmModal.taskId);
    toast.success("Task deleted successfully!");
    setConfirmModal({ isOpen: false, entryId: "", taskId: "", taskName: "" });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, entryId: "", taskId: "", taskName: "" });
  };

  return (
    <>
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200  dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky z-10 top-0 ">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Learning Outcome
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {flatTasks.map((task) => (
              <tr
                key={`${task.entryId}-${task.taskId}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.isFirstOfDate ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(new Date(task.date))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 dark:text-gray-600">
                      ↳
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {task.taskName}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {task.timeIn} - {task.timeOut}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatHours(task.hoursRendered)} hrs
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {task.category}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {task.learningOutcome}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditClick(task.entryId, task.taskId)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteClick(
                          task.entryId,
                          task.taskId,
                          task.taskName,
                        )
                      }
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {flatTasks.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-900">
            <div className="text-gray-400 dark:text-gray-600 mb-2">
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
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No tasks recorded yet
            </p>
            <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
              Click &quot;Add Task&quot; to get started
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${confirmModal.taskName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </>
  );
}
