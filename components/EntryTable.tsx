"use client";

import React, { useState } from "react";
import { OJTEntry } from "@/lib/types";
import { formatDate, formatHours } from "@/lib/utils";

interface EntryTableProps {
  entries: OJTEntry[];
  onEdit: (entry: OJTEntry) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Pending Review": "bg-yellow-100 text-yellow-800",
  Approved: "bg-purple-100 text-purple-800",
};

export default function EntryTable({
  entries,
  onEdit,
  onDelete,
}: EntryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    onDelete(id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supervisor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <React.Fragment key={entry.id}>
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(new Date(entry.date))}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <button
                    onClick={() => toggleRow(entry.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {expandedRows.has(entry.id) ? "▼" : "▶"}{" "}
                    {entry.tasks.length}{" "}
                    {entry.tasks.length === 1 ? "task" : "tasks"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {formatHours(entry.totalHours)} hrs
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.supervisor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(entry)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              {expandedRows.has(entry.id) && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-3">
                      {entry.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-4 rounded border border-gray-200"
                        >
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-gray-500">
                                Time
                              </span>
                              <p className="text-sm font-medium">
                                {task.timeIn} - {task.timeOut}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Hours
                              </span>
                              <p className="text-sm font-bold text-blue-600">
                                {formatHours(task.hoursRendered)} hrs
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Category
                              </span>
                              <p className="text-sm">{task.category}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Status
                              </span>
                              <div>
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    statusColors[
                                      task.status as keyof typeof statusColors
                                    ]
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Task</span>
                            <p className="text-sm mt-1">{task.taskName}</p>
                          </div>
                        </div>
                      ))}
                      {entry.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                          <span className="text-xs text-gray-600 font-medium">
                            Daily Notes:
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No entries found</p>
        </div>
      )}
    </div>
  );
}
