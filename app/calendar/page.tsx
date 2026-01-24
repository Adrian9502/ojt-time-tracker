"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OJTEntry } from "@/lib/types";
import DashboardLayout from "@/components/DashboardLayout";
import DateDetailsModal from "@/components/DateDetailsModal";
import { formatHoursMinutes } from "@/lib/utils";
import { toast } from "react-toastify";

export default function CalendarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<OJTEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      const response = await fetch("/api/entries");
      if (!response.ok) throw new Error("Failed to fetch entries");

      const loadedEntries = await response.json();
      setEntries(loadedEntries);
    } catch (error) {
      console.error("Failed to load entries:", error);
      toast.error("Failed to load calendar. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  // Get days in current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Map entries to dates - FIXED: Now combines multiple entries for the same date
  const entriesByDate = entries.reduce(
    (acc, entry) => {
      const dateKey = new Date(entry.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = { totalHours: 0, count: 0, entries: [] };
      }
      acc[dateKey].totalHours += entry.totalHours;
      acc[dateKey].count += 1;
      acc[dateKey].entries.push(entry);
      return acc;
    },
    {} as Record<
      string,
      { totalHours: number; count: number; entries: OJTEntry[] }
    >,
  );

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const dateKey = date.toDateString();
    const dayData = entriesByDate[dateKey];

    if (dayData && dayData.entries.length > 0) {
      setSelectedDate(date);
      setShowDetailsModal(true);
    }
  };

  const getEntriesForDate = (date: Date): OJTEntry[] => {
    const dateKey = date.toDateString();
    return entriesByDate[dateKey]?.entries || [];
  };

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
            Calendar View
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Visual timeline of your training activities • Click on a date with
            entries to view details
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={previousMonth}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3 sm:p-4 md:p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 py-1 sm:py-2"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day,
                );
                const dateKey = date.toDateString();
                const dayData = entriesByDate[dateKey];
                const isToday = dateKey === new Date().toDateString();
                const hasEntries = dayData && dayData.entries.length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={!hasEntries}
                    className={`aspect-square p-1 sm:p-2 rounded-md sm:rounded-lg border transition-all ${
                      isToday
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : dayData
                          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:shadow-md cursor-pointer"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-default"
                    } ${hasEntries ? "group" : ""}`}
                  >
                    <div className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                      {day}
                    </div>
                    {dayData && (
                      <>
                        {/* UPDATED: Show hrs-min format */}
                        <div className="text-[9px] sm:text-xs font-semibold text-green-600 dark:text-green-400">
                          {formatHoursMinutes(dayData.totalHours)}
                        </div>
                        {hasEntries && (
                          <div className="hidden sm:block text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {dayData.count}{" "}
                            {dayData.count === 1 ? "entry" : "entries"}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"></div>
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Has entries (click to view)
            </span>
          </div>
        </div>
      </div>

      {/* Date Details Modal */}
      {showDetailsModal && selectedDate && (
        <DateDetailsModal
          isOpen={showDetailsModal}
          date={selectedDate}
          entries={getEntriesForDate(selectedDate)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDate(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
