"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types";
import DashboardLayout from "@/components/DashboardLayout";
import NoteModal from "@/components/NoteModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "react-toastify";

export default function OOOPage() {
  const { status } = useSession();
  const router = useRouter();
  const [oooNotes, setOooNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteId: string;
    noteTitle: string;
  }>({ isOpen: false, noteId: "", noteTitle: "" });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const loadOOONotes = async () => {
    try {
      const response = await fetch("/api/notes?type=ooo");
      if (!response.ok) throw new Error("Failed to fetch OOO notes");
      const data = await response.json();
      setOooNotes(data);
    } catch (error) {
      console.error("Failed to load OOO notes:", error);
      toast.error("Failed to load out-of-office records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadOOONotes();
    }
  }, [status]);

  const handleAddOOO = () => {
    setEditingNote(undefined);
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDeleteClick = (noteId: string, noteTitle: string) => {
    setDeleteModal({ isOpen: true, noteId, noteTitle });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${deleteModal.noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete OOO record");

      toast.success("Out-of-office record deleted successfully!");
      await loadOOONotes();
    } catch (error) {
      console.error("Failed to delete OOO record:", error);
      toast.error("Failed to delete out-of-office record");
    } finally {
      setDeleteModal({ isOpen: false, noteId: "", noteTitle: "" });
    }
  };

  const handleModalSuccess = async () => {
    setShowModal(false);
    setEditingNote(undefined);
    await loadOOONotes();
  };

  // Calendar logic
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

  // Map OOO notes to dates - FIXED: Use oooDate instead of createdAt
  const oooByDate = oooNotes.reduce(
    (acc, note) => {
      if (note.oooDate) {
        const dateKey = new Date(note.oooDate).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(note);
      }
      return acc;
    },
    {} as Record<string, Note[]>,
  );

  // Format time display
  const formatTimeRange = (note: Note) => {
    if (note.isOneDay) {
      return "Full Day";
    }
    if (note.oooTimeStart && note.oooTimeEnd) {
      return `${note.oooTimeStart} - ${note.oooTimeEnd}`;
    }
    return "";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Out of Office
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your out-of-office time, vacations, and leave records
          </p>
        </div>

        {/* Add OOO Button */}
        <div className="mb-6">
          <button
            onClick={handleAddOOO}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Add Out of Office
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
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
              <div className="p-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
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
                    const hasOOO =
                      oooByDate[dateKey] && oooByDate[dateKey].length > 0;
                    const isToday = dateKey === new Date().toDateString();

                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 rounded-lg border transition-colors ${
                          isToday
                            ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : hasOOO
                              ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {day}
                        </div>
                        {hasOOO && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400"></div>
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                              OOO
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"></div>
                <span className="text-gray-600 dark:text-gray-400">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/30"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Out of Office
                </span>
              </div>
            </div>
          </div>

          {/* OOO List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              OOO Records
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin"></div>
              </div>
            ) : oooNotes.length === 0 ? (
              <div className="text-center py-8">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No OOO records yet
                </p>
                <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
                  Click &quot;Add Out of Office&quot; to start
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {oooNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 group hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
                        {note.title}
                      </h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(note.id, note.title)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
                      {note.content}
                    </p>

                    {/* Date and Time Display */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <svg
                          className="w-3 h-3 text-orange-600 dark:text-orange-400"
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
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {note.oooDate
                            ? new Date(note.oooDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "No date set"}
                        </span>
                      </div>

                      {/* Time Range */}
                      {(note.isOneDay || note.oooTimeStart) && (
                        <div className="flex items-center gap-2 text-xs">
                          <svg
                            className="w-3 h-3 text-orange-600 dark:text-orange-400"
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
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            {formatTimeRange(note)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <NoteModal
          note={editingNote}
          type="ooo"
          onSuccess={handleModalSuccess}
          onCancel={() => {
            setShowModal(false);
            setEditingNote(undefined);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Out of Office Record"
        message={`Are you sure you want to delete "${deleteModal.noteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteModal({ isOpen: false, noteId: "", noteTitle: "" })
        }
        type="danger"
      />
    </DashboardLayout>
  );
}
