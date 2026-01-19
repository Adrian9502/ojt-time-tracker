"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Note } from "@/lib/types";
import { toast } from "react-toastify";

interface NoteModalProps {
  note?: Note;
  type: "regular" | "ooo";
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  content: string;
  oooDate?: string;
  oooTimeStart?: string;
  oooTimeEnd?: string;
  isOneDay?: boolean;
}

export default function NoteModal({
  note,
  type,
  onSuccess,
  onCancel,
}: NoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [isOneDay, setIsOneDay] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: note
      ? {
          title: note.title,
          content: note.content,
          oooDate: note.oooDate
            ? new Date(note.oooDate).toISOString().split("T")[0]
            : undefined,
          oooTimeStart: note.oooTimeStart || undefined,
          oooTimeEnd: note.oooTimeEnd || undefined,
          isOneDay: note.isOneDay || false,
        }
      : {
          title: "",
          content: "",
          oooDate: undefined,
          oooTimeStart: undefined,
          oooTimeEnd: undefined,
          isOneDay: false,
        },
  });

  // Watch the isOneDay checkbox
  const watchIsOneDay = watch("isOneDay");

  // Update local state and set default times when checkbox changes
  useEffect(() => {
    if (watchIsOneDay) {
      setIsOneDay(true);
      // Set full day times (8:00 AM to 5:00 PM or your preferred work hours)
      setValue("oooTimeStart", "08:00");
      setValue("oooTimeEnd", "17:00");
    } else {
      setIsOneDay(false);
    }
  }, [watchIsOneDay, setValue]);

  const onSubmit = async (data: FormData) => {
    // Validate that oooDate is set for OOO type
    if (type === "ooo" && !data.oooDate) {
      toast.error("Please select a date for the out-of-office");
      return;
    }

    setLoading(true);
    try {
      const url = note ? `/api/notes/${note.id}` : "/api/notes";
      const method = note ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type,
          isOneDay: data.isOneDay || false,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      toast.success(
        note ? "Note updated successfully!" : "Note added successfully!",
      );
      onSuccess();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {note ? "Edit" : "Add"}{" "}
              {type === "regular" ? "Note" : "Out of Office"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {type === "regular"
                ? "Record important notes or reminders"
                : "Track your out-of-office time and details"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {type === "regular" ? "Title" : "Title of Out of Office"} *
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={
                  type === "regular"
                    ? "e.g., Important Meeting Notes"
                    : "e.g., Annual Leave, Sick Leave, Personal Day"
                }
              />
              {errors.title && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* OOO-specific fields */}
            {type === "ooo" && (
              <>
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    {...register("oooDate", {
                      required: type === "ooo" ? "Date is required" : false,
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.oooDate && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      {errors.oooDate.message}
                    </p>
                  )}

                  {/* One Day Checkbox */}
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      id="isOneDay"
                      {...register("isOneDay")}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="isOneDay"
                      className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      1 Day OOO (Full work day)
                    </label>
                  </div>
                  {/* {isOneDay && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ℹ️ Time will be set to full work day (8:00 AM - 5:00 PM)
                    </p>
                  )} */}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      {...register("oooTimeStart", {
                        required:
                          type === "ooo" ? "Start time is required" : false,
                      })}
                      disabled={isOneDay}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.oooTimeStart && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                        {errors.oooTimeStart.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      End Time *
                    </label>
                    <input
                      type="time"
                      {...register("oooTimeEnd", {
                        required:
                          type === "ooo" ? "End time is required" : false,
                      })}
                      disabled={isOneDay}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.oooTimeEnd && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                        {errors.oooTimeEnd.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Content/Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {type === "regular" ? "Content" : "Reason"} *
              </label>
              <textarea
                {...register("content", { required: "This field is required" })}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder={
                  type === "regular"
                    ? "Write your notes here..."
                    : "e.g., Family vacation, Medical appointment, Personal matters..."
                }
              />
              {errors.content && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {errors.content.message}
                </p>
              )}
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
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
              >
                {loading
                  ? "Saving..."
                  : note
                    ? `Update ${type === "regular" ? "Note" : "OOO"}`
                    : `Save ${type === "regular" ? "Note" : "OOO"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
