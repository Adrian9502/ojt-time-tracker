import * as XLSX from "xlsx";
import { OJTEntry } from "./types";

interface ExportTask {
  Date: string;
  Day: string;
  Task: string;
  "Time In": string;
  "Time Out": string;
  "Hours Rendered": number;
  Category: string;
  "Learning Outcome": string;
  "Created At": string;
}

interface DateSummary {
  Date: string;
  Day: string;
  Task: string;
  "Time In": string;
  "Time Out": string;
  "Hours Rendered": string;
  Category: string;
  "Learning Outcome": string;
  "Created At": string;
}

export function exportToExcel(
  entries: OJTEntry[],
  filename: string = "OJT_Time_Logs",
) {
  // Prepare data with proper grouping
  const exportData: (ExportTask | DateSummary)[] = [];

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  sortedEntries.forEach((entry) => {
    const dateObj = new Date(entry.date);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const dayStr = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // Sort tasks by createdAt (newest first) within each entry
    const sortedTasks = [...entry.tasks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Add each task as a row
    sortedTasks.forEach((task) => {
      const createdAtDate = new Date(task.createdAt);
      const createdAtStr = createdAtDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      exportData.push({
        Date: dateStr,
        Day: dayStr,
        Task: task.taskName,
        "Time In": task.timeIn,
        "Time Out": task.timeOut,
        "Hours Rendered": Number(task.hoursRendered.toFixed(2)),
        Category: task.category,
        "Learning Outcome": entry.notes || "-",
        "Created At": createdAtStr,
      });
    });

    // Add total row for the date
    exportData.push({
      Date: "",
      Day: "",
      Task: "TOTAL FOR " + dateStr,
      "Time In": "",
      "Time Out": "",
      "Hours Rendered": `${entry.totalHours.toFixed(2)} hrs`,
      Category: "",
      "Learning Outcome": "",
      "Created At": "",
    });

    // Add empty row for spacing
    exportData.push({
      Date: "",
      Day: "",
      Task: "",
      "Time In": "",
      "Time Out": "",
      "Hours Rendered": "",
      Category: "",
      "Learning Outcome": "",
      "Created At": "",
    });
  });

  // Calculate grand total
  const grandTotal = entries.reduce((sum, entry) => sum + entry.totalHours, 0);

  // Add grand total row
  exportData.push({
    Date: "",
    Day: "",
    Task: "GRAND TOTAL",
    "Time In": "",
    "Time Out": "",
    "Hours Rendered": `${grandTotal.toFixed(2)} hrs`,
    Category: "",
    "Learning Outcome": "",
    "Created At": "",
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, // Date
    { wch: 12 }, // Day
    { wch: 35 }, // Task
    { wch: 10 }, // Time In
    { wch: 10 }, // Time Out
    { wch: 15 }, // Hours Rendered
    { wch: 20 }, // Category
    { wch: 40 }, // Learning Outcome
    { wch: 20 }, // Created At
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Time Logs");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, finalFilename);
}

export function exportToCSV(
  entries: OJTEntry[],
  filename: string = "OJT_Time_Logs",
) {
  // Prepare CSV data
  const csvRows: string[] = [];

  // Add header
  csvRows.push(
    "Date,Day,Task,Time In,Time Out,Hours Rendered,Category,Learning Outcome,Created At",
  );

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  sortedEntries.forEach((entry) => {
    const dateObj = new Date(entry.date);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const dayStr = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // Sort tasks by createdAt (newest first)
    const sortedTasks = [...entry.tasks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Add each task
    sortedTasks.forEach((task) => {
      const createdAtDate = new Date(task.createdAt);
      const createdAtStr = createdAtDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const learningOutcome = (entry.notes || "-").replace(/,/g, ";"); // Replace commas to avoid CSV issues

      csvRows.push(
        `"${dateStr}","${dayStr}","${task.taskName}","${task.timeIn}","${task.timeOut}",${task.hoursRendered.toFixed(2)},"${task.category}","${learningOutcome}","${createdAtStr}"`,
      );
    });

    // Add total row
    csvRows.push(
      `"","","TOTAL FOR ${dateStr}","","",${entry.totalHours.toFixed(2)} hrs,"","",""`,
    );

    // Add empty row
    csvRows.push("");
  });

  // Add grand total
  const grandTotal = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  csvRows.push(
    `"","","GRAND TOTAL","","",${grandTotal.toFixed(2)} hrs,"","",""`,
  );

  // Create blob and download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  const timestamp = new Date().toISOString().split("T")[0];
  const finalFilename = `${filename}_${timestamp}.csv`;

  link.href = URL.createObjectURL(blob);
  link.download = finalFilename;
  link.click();

  URL.revokeObjectURL(link.href);
}
