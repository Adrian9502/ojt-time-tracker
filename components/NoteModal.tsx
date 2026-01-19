"use client";

import { useState } from "react";
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
}

export default function NoteModal({
  note,
  type,
  onSuccess,
  onCancel,
}: NoteModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: note
      ? {
          title: note.title,
          content: note.content,
        }
      : {
          title: "",
          content: "",
        },
  });

  const onSubmit = async (data: FormData) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {note ? "Edit" : "Add"} {type === "regular" ? "Note" : "OOO Note"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {type === "regular"
                ? "Record important notes or reminders"
                : "Track out-of-office time and reasons"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={
                  type === "regular"
                    ? "e.g., Important Meeting Notes"
                    : "e.g., Vacation Leave"
                }
              />
              {errors.title && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Content *
              </label>
              <textarea
                {...register("content", { required: "Content is required" })}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-slate-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder={
                  type === "regular"
                    ? "Write your notes here..."
                    : "Reason for out-of-office, dates, coverage details..."
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
                {loading ? "Saving..." : note ? "Update Note" : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
