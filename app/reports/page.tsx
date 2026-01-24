"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OJTEntry, OJTStats } from "@/lib/types";
import { calculateStats } from "@/lib/store";
import { formatHours, formatHoursMinutes } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "react-toastify";

export default function ReportsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<OJTEntry[]>([]);
  const [stats, setStats] = useState<OJTStats>({
    totalHours: 0,
    completedHours: 0,
    remainingHours: 0,
    progressPercentage: 0,
    entriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      const [entriesRes, settingsRes] = await Promise.all([
        fetch("/api/entries"),
        fetch("/api/settings"),
      ]);

      if (!entriesRes.ok || !settingsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const loadedEntries = await entriesRes.json();
      const settings = await settingsRes.json();

      const calculatedStats = calculateStats(
        loadedEntries,
        settings.requiredHours,
      );

      setEntries(loadedEntries);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load reports. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  // Calculate category breakdown
  const categoryBreakdown = entries.reduce(
    (acc, entry) => {
      entry.tasks.forEach((task) => {
        acc[task.category] = (acc[task.category] || 0) + task.hoursRendered;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  // Calculate monthly breakdown
  const monthlyBreakdown = entries.reduce(
    (acc, entry) => {
      const month = new Date(entry.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      acc[month] = (acc[month] || 0) + entry.totalHours;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <DashboardLayout onSettingsUpdate={loadData}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Detailed insights into your OJT progress
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Total Entries Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md sm:rounded-lg">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400"
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
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Entries
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.entriesCount}
            </div>
          </div>

          {/* Avg Hours/Day Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md sm:rounded-lg">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Avg Hours/Day
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.entriesCount > 0
                ? formatHours(stats.completedHours / stats.entriesCount)
                : "0.00"}
            </div>
          </div>

          {/* Days Remaining Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md sm:rounded-lg">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Days Remaining
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.remainingHours > 0
                ? Math.ceil(
                    stats.remainingHours /
                      (stats.completedHours / stats.entriesCount || 1),
                  )
                : 0}
            </div>
          </div>

          {/* Completion Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-md sm:rounded-lg">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Completion
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.progressPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Hours by Category
              </h2>
            </div>

            {Object.keys(categoryBreakdown).length === 0 ? (
              <div className="text-center py-8 sm:py-12">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No category data available
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, hours]) => {
                    const percentage = (hours / stats.completedHours) * 100;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
                            {category}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {formatHoursMinutes(hours)}
                            <span className="hidden sm:inline text-gray-500 dark:text-gray-400 ml-1">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Monthly Progress
              </h2>
            </div>

            {Object.keys(monthlyBreakdown).length === 0 ? (
              <div className="text-center py-8 sm:py-12">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No monthly data available
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Month
                        </th>
                        <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {Object.entries(monthlyBreakdown)
                        .sort(([a], [b]) => {
                          const dateA = new Date(a);
                          const dateB = new Date(b);
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map(([month, hours]) => (
                          <tr
                            key={month}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                              {month}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 text-right">
                              {formatHours(hours)} hrs
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
