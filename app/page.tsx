"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OJTEntry, OJTStats } from "@/lib/types";
import { calculateStats } from "@/lib/store";
import { formatHours } from "@/lib/utils";
import EntryForm from "@/components/EntryForm";
import TaskTable from "@/components/TaskTable";
import Header from "@/components/Header";
import { toast } from "react-toastify";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<OJTStats>({
    totalHours: 0,
    completedHours: 0,
    remainingHours: 0,
    progressPercentage: 0,
    entriesCount: 0,
  });
  const [entries, setEntries] = useState<OJTEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<OJTEntry | undefined>();
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();

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
        settings.requiredHours
      );

      setEntries(loadedEntries);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  const handleAddEntry = () => {
    setEditingEntry(undefined);
    setEditingTaskId(undefined);
    setShowForm(true);
  };

  const handleEditTask = (entry: OJTEntry, taskId: string) => {
    setEditingEntry(entry);
    setEditingTaskId(taskId);
    setShowForm(true);
  };

  const handleDeleteTask = async (entryId: string, taskId: string) => {
    try {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) return;

      // If only one task, delete the entire entry
      if (entry.tasks.length === 1) {
        const response = await fetch(`/api/entries/${entryId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete entry");
        }
      } else {
        // Remove the task and update the entry
        const updatedTasks = entry.tasks.filter((t) => t.id !== taskId);
        const response = await fetch(`/api/entries/${entryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: entry.date,
            supervisor: entry.supervisor,
            notes: entry.notes,
            tasks: updatedTasks.map((t) => ({
              timeIn: t.timeIn,
              timeOut: t.timeOut,
              hoursRendered: t.hoursRendered,
              taskName: t.taskName,
              category: t.category,
              status: t.status,
            })),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update entry");
        }
      }

      await loadData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete task. Please try again."
      );
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingEntry(undefined);
    setEditingTaskId(undefined);
    await loadData();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {session?.user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-sm text-gray-600">
              Track your on-the-job training hours
            </p>
          </div>

          {/* Stats Cards - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Completed Hours
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatHours(stats.completedHours)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Required Hours
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalHours}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Remaining
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatHours(stats.remainingHours)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Progress
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.progressPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Progress Bar - Compact */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">
                Overall Progress
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {formatHours(stats.completedHours)} / {stats.totalHours} hours
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddEntry}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add Task
            </button>
            <button className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
              📊 Export
            </button>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <TaskTable
              entries={entries}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          </div>
        </div>

        {/* Modals */}
        {showForm && (
          <EntryForm
            entry={editingEntry}
            taskId={editingTaskId}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(undefined);
              setEditingTaskId(undefined);
            }}
          />
        )}
      </div>
    </>
  );
}
