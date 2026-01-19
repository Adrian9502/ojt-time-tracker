"use client";

import { useState, useEffect } from "react";
import { Note } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "react-toastify";
import NoteModal from "./NoteModal";
import ConfirmationModal from "./ConfirmationModal";

export default function NotesSection() {
  const [activeTab, setActiveTab] = useState<"regular" | "ooo">("regular");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteId: string;
    noteTitle: string;
  }>({ isOpen: false, noteId: "", noteTitle: "" });

  useEffect(() => {
    loadNotes();
  }, [activeTab]);

  const loadNotes = async () => {
    try {
      const response = await fetch(`/api/notes?type=${activeTab}`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
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

      if (!response.ok) throw new Error("Failed to delete note");

      toast.success("Note deleted successfully!");
      await loadNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleteModal({ isOpen: false, noteId: "", noteTitle: "" });
    }
  };

  const handleModalSuccess = async () => {
    setShowModal(false);
    setEditingNote(undefined);
    await loadNotes();
  };

  const getDayOfWeek = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 mb-6">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 rounded-lg">
          <button
            onClick={() => setActiveTab("regular")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "regular"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-slate-100 dark:bg-gray-700"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("ooo")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "ooo"
                ? "shadow-sm bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-slate-100 dark:bg-gray-700"
            }`}
          >
            OOO Notes
          </button>
        </div>

        <button
          onClick={handleAddNote}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add {activeTab === "regular" ? "Note" : "OOO Note"}
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No {activeTab === "regular" ? "notes" : "OOO notes"} yet
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
            Click &quot;Add {activeTab === "regular" ? "Note" : "OOO Note"}
            &quot; to get started
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex gap-4" style={{ minWidth: "min-content" }}>
            {notes.map((note) => (
              <div
                key={note.id}
                className="shrink-0 w-72 bg-blue-50 dark:bg-gray-700 rounded-xl border-2 border-blue-100 dark:border-gray-600 p-5 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">
                        {formatDate(new Date(note.createdAt))}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">
                        •
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        {getDayOfWeek(new Date(note.createdAt))}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                      {note.title}
                    </h3>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit note"
                    >
                      <svg
                        className="w-4 h-4"
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
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <svg
                        className="w-4 h-4"
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

                {/* Content */}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <NoteModal
          note={editingNote}
          type={activeTab}
          onSuccess={handleModalSuccess}
          onCancel={() => {
            setShowModal(false);
            setEditingNote(undefined);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Note"
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
