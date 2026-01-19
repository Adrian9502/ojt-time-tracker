"use client";

import { useState, useEffect } from "react";
import { Note } from "@/lib/types";
import { toast } from "react-toastify";
import NoteModal from "./NoteModal";
import ConfirmationModal from "./ConfirmationModal";

export default function OOOCalendarSidebar() {
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
    loadOOONotes();
  }, []);

  const loadOOONotes = async () => {
    try {
      const response = await fetch("/api/notes?type=ooo");
      if (!response.ok) throw new Error("Failed to fetch OOO notes");
      const data = await response.json();
      setOooNotes(data);
    } catch (error) {
      console.error("Failed to load OOO notes:", error);
      toast.error("Failed to load OOO notes");
    } finally {
      setLoading(false);
    }
  };

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

      if (!response.ok) throw new Error("Failed to delete OOO note");

      toast.success("OOO note deleted successfully!");
      await loadOOONotes();
    } catch (error) {
      console.error("Failed to delete OOO note:", error);
      toast.error("Failed to delete OOO note");
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

  // Map OOO notes to dates (placeholder - you can enhance this later)
  const oooByDate = oooNotes.reduce(
    (acc, note) => {
      const dateKey = new Date(note.createdAt).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(note);
      return acc;
    },
    {} as Record<string, Note[]>,
  );

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Out of Office
        </h2>
        <button
          onClick={handleAddOOO}
          className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          + Add OOO
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
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

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
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
            const hasOOO = oooByDate[dateKey] && oooByDate[dateKey].length > 0;
            const isToday = dateKey === new Date().toDateString();

            return (
              <button
                key={day}
                className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                  isToday
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                    : hasOOO
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* OOO List */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Upcoming OOO
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin"></div>
          </div>
        ) : oooNotes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No OOO scheduled
          </p>
        ) : (
          <div className="space-y-2">
            {oooNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 group hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
                    {note.title}
                  </h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-3 h-3"
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
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-3 h-3"
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
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {note.content}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
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
        title="Delete OOO"
        message={`Are you sure you want to delete "${deleteModal.noteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteModal({ isOpen: false, noteId: "", noteTitle: "" })
        }
        type="danger"
      />
    </div>
  );
}
