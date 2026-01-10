"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface SettingsModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface SettingsFormData {
  requiredHours: number;
  studentName: string;
}

export default function SettingsModal({
  onSuccess,
  onCancel,
}: SettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const settings = await response.json();
          setValue("requiredHours", settings.requiredHours);
          setValue("studentName", settings.studentName);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        requiredHours: Number(data.requiredHours),
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save settings");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save settings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            OJT Settings
          </h2>

          <div className="space-y-4">
            {/* Required Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required OJT Hours *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("requiredHours", {
                  required: "Required hours is required",
                  min: { value: 1, message: "Must be at least 1 hour" },
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
              {errors.requiredHours && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.requiredHours.message}
                </p>
              )}
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                {...register("studentName", {
                  required: "Student name is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
              {errors.studentName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.studentName.message}
                </p>
              )}
            </div>

            {/* Date Range */}
            {/* <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                  className="w-full px-3 py-2 border border-gray-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div> */}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
