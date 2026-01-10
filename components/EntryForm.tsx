"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { OJTEntry } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { calculateHours } from "@/lib/utils";

interface EntryFormProps {
  entry?: OJTEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TaskFormData {
  timeIn: string;
  timeOut: string;
  hoursRendered: number;
  taskName: string;
  category: string;
  status: string;
}

interface FormData {
  date: string;
  supervisor: string;
  notes?: string;
  tasks: TaskFormData[];
}

export default function EntryForm({
  entry,
  onSuccess,
  onCancel,
}: EntryFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: entry
      ? {
          date: new Date(entry.date).toISOString().split("T")[0],
          supervisor: entry.supervisor,
          notes: entry.notes || "",
          tasks: entry.tasks.map((task) => ({
            timeIn: task.timeIn,
            timeOut: task.timeOut,
            hoursRendered: task.hoursRendered,
            taskName: task.taskName,
            category: task.category,
            status: "Completed",
          })),
        }
      : {
          date: new Date().toISOString().split("T")[0],
          supervisor: "",
          notes: "",
          tasks: [
            {
              timeIn: "",
              timeOut: "",
              hoursRendered: 0,
              taskName: "",
              category: "",
              status: "Completed",
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const tasks = watch("tasks");

  const handleTimeChange = (index: number) => {
    const task = tasks[index];
    if (task.timeIn && task.timeOut) {
      const hours = calculateHours(task.timeIn, task.timeOut);
      setValue(`tasks.${index}.hoursRendered`, hours);
    }
  };

  const totalHours = tasks.reduce(
    (sum, task) => sum + (task.hoursRendered || 0),
    0
  );

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = entry ? `/api/entries/${entry.id}` : "/api/entries";
      const method = entry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save entry");

      onSuccess();
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {entry ? "Edit Tasks" : "Add New Tasks"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date & Supervisor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  className="w-full px-3 py-2 border border-gray-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor/Mentor *
                </label>
                <input
                  type="text"
                  {...register("supervisor", {
                    required: "Supervisor is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Supervisor name"
                />
                {errors.supervisor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.supervisor.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      timeIn: "",
                      timeOut: "",
                      hoursRendered: 0,
                      taskName: "",
                      category: "",
                      status: "Completed",
                    })
                  }
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                >
                  + Add Task
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">
                        Task #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Time In/Out */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Time In *
                          </label>
                          <input
                            type="time"
                            {...register(`tasks.${index}.timeIn`, {
                              required: "Required",
                              onChange: () => handleTimeChange(index),
                            })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 text-slate-900 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Time Out *
                          </label>
                          <input
                            type="time"
                            {...register(`tasks.${index}.timeOut`, {
                              required: "Required",
                              onChange: () => handleTimeChange(index),
                            })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 text-slate-900 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Hours */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Hours
                        </label>
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded font-semibold text-sm">
                          {tasks[index].hoursRendered.toFixed(2)} hrs
                        </div>
                      </div>

                      {/* Task Name */}
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Task Description *
                        </label>
                        <input
                          type="text"
                          {...register(`tasks.${index}.taskName`, {
                            required: "Required",
                          })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 text-slate-900 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="What did you work on?"
                        />
                      </div>

                      {/* Category */}
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Category *
                        </label>
                        <select
                          {...register(`tasks.${index}.category`, {
                            required: "Required",
                          })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 text-slate-900 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Hours */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Total Hours:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {totalHours.toFixed(2)} hrs
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Outcome / Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-3 py-2 border text-slate-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What did you learn? Any insights or observations..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : entry ? "Update Tasks" : "Save Tasks"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
