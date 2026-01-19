"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { OJTEntry } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { calculateHours } from "@/lib/utils";
import { toast } from "react-toastify";

interface EntryFormProps {
  entry?: OJTEntry;
  taskId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  date: string;
  timeIn: string;
  timeOut: string;
  taskName: string;
  category: string;
  notes?: string;
}

export default function EntryForm({
  entry,
  taskId,
  onSuccess,
  onCancel,
}: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [hoursRendered, setHoursRendered] = useState(0);

  const isEditMode = !!entry && !!taskId;
  const editingTask = isEditMode
    ? entry?.tasks.find((t) => t.id === taskId)
    : null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues:
      isEditMode && editingTask
        ? {
            date: new Date(entry.date).toISOString().split("T")[0],
            timeIn: editingTask.timeIn,
            timeOut: editingTask.timeOut,
            taskName: editingTask.taskName,
            category: editingTask.category,
            notes: entry.notes || "",
          }
        : {
            date: new Date().toISOString().split("T")[0],
            timeIn: "",
            timeOut: "",
            taskName: "",
            category: "",
            notes: "",
          },
  });

  const timeIn = watch("timeIn");
  const timeOut = watch("timeOut");

  useEffect(() => {
    if (timeIn && timeOut) {
      const hours = calculateHours(timeIn, timeOut);
      setHoursRendered(hours);
    }
  }, [timeIn, timeOut]);

  const onSubmit = async (data: FormData) => {
    if (hoursRendered <= 0) {
      toast.error("Please enter valid time in and time out");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && entry) {
        // Edit existing task
        const updatedTasks = entry.tasks.map((task) =>
          task.id === taskId
            ? {
                timeIn: data.timeIn,
                timeOut: data.timeOut,
                hoursRendered,
                taskName: data.taskName,
                category: data.category,
                status: "Completed",
              }
            : {
                timeIn: task.timeIn,
                timeOut: task.timeOut,
                hoursRendered: task.hoursRendered,
                taskName: task.taskName,
                category: task.category,
                status: task.status,
              },
        );

        const response = await fetch(`/api/entries/${entry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: data.date,
            supervisor: entry.supervisor,
            notes: data.notes,
            tasks: updatedTasks,
          }),
        });

        if (!response.ok) throw new Error("Failed to update task");
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        const response = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: data.date,
            supervisor: "N/A",
            notes: data.notes,
            tasks: [
              {
                timeIn: data.timeIn,
                timeOut: data.timeOut,
                hoursRendered,
                taskName: data.taskName,
                category: data.category,
                status: "Completed",
              },
            ],
          }),
        });

        if (!response.ok) throw new Error("Failed to save task");
        toast.success("Task added successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Task" : "Add New Task"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {isEditMode
                ? "Update your task details"
                : "Record your training activity"}
            </p>
          </div>

          <div className="space-y-5">
            {/* Row 1: Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {errors.date && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Time In */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Time In *
                </label>
                <input
                  type="time"
                  {...register("timeIn", { required: "Time in is required" })}
                  className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {errors.timeIn && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.timeIn.message}
                  </p>
                )}
              </div>

              {/* Time Out */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Time Out *
                </label>
                <input
                  type="time"
                  {...register("timeOut", {
                    required: "Time out is required",
                  })}
                  className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {errors.timeOut && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.timeOut.message}
                  </p>
                )}
              </div>
            </div>

            {/* Hours Display */}
            {hoursRendered > 0 && (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Hours
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {hoursRendered.toFixed(2)} hrs
                  </span>
                </div>
              </div>
            )}

            {/* Row 2: Task and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Task Description *
                </label>
                <input
                  type="text"
                  {...register("taskName", {
                    required: "Task description is required",
                  })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="What did you work on?"
                />
                {errors.taskName && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.taskName.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Learning Outcome - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Learning Outcome{" "}
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  (Optional)
                </span>
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                placeholder="What did you learn? Any insights or observations..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Task"
                    : "Save Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
