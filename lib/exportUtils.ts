import * as XLSX from "xlsx";
import { OJTEntry } from "./types";
import { formatHoursMinutes } from "./utils";

interface ExportTask {
  Date: string;
  Day: string;
  Task: string;
  "Time In": string;
  "Time Out": string;
  "Hours Rendered": string; // Changed from number to string
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
  // Group entries by date
  const entriesByDate: { [key: string]: OJTEntry[] } = {};

  entries.forEach((entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (!entriesByDate[dateKey]) {
      entriesByDate[dateKey] = [];
    }
    entriesByDate[dateKey].push(entry);
  });

  // Sort dates (newest first)
  const sortedDates = Object.keys(entriesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const exportData: (ExportTask | DateSummary)[] = [];

  // Process each date
  sortedDates.forEach((dateKey) => {
    const dateEntries = entriesByDate[dateKey];
    const dateObj = new Date(dateKey);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const dayStr = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // Collect all tasks for this date
    const allTasks: Array<{
      taskName: string;
      timeIn: string;
      timeOut: string;
      hoursRendered: number;
      category: string;
      learningOutcome: string;
      createdAt: Date;
    }> = [];

    dateEntries.forEach((entry) => {
      entry.tasks.forEach((task) => {
        allTasks.push({
          taskName: task.taskName,
          timeIn: task.timeIn,
          timeOut: task.timeOut,
          hoursRendered: task.hoursRendered,
          category: task.category,
          learningOutcome: entry.notes || "-",
          createdAt: task.createdAt,
        });
      });
    });

    // Sort tasks by createdAt (newest first)
    allTasks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Add each task as a row
    allTasks.forEach((task) => {
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
        "Hours Rendered": formatHoursMinutes(task.hoursRendered), // UPDATED
        Category: task.category,
        "Learning Outcome": task.learningOutcome,
        "Created At": createdAtStr,
      });
    });

    // Calculate total hours for this date
    const totalHours = allTasks.reduce(
      (sum, task) => sum + task.hoursRendered,
      0,
    );

    // Add total row for the date
    exportData.push({
      Date: "",
      Day: "",
      Task: `TOTAL FOR ${dateStr}`,
      "Time In": "",
      "Time Out": "",
      "Hours Rendered": formatHoursMinutes(totalHours), // UPDATED
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
    "Hours Rendered": formatHoursMinutes(grandTotal), // UPDATED
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
    { wch: 40 }, // Task
    { wch: 10 }, // Time In
    { wch: 10 }, // Time Out
    { wch: 15 }, // Hours Rendered
    { wch: 20 }, // Category
    { wch: 50 }, // Learning Outcome
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
  const csvRows: string[] = [];

  // Add header
  csvRows.push(
    "Date,Day,Task,Time In,Time Out,Hours Rendered,Category,Learning Outcome,Created At",
  );

  // Group entries by date
  const entriesByDate: { [key: string]: OJTEntry[] } = {};

  entries.forEach((entry) => {
    const dateKey = new Date(entry.date).toDateString();
    if (!entriesByDate[dateKey]) {
      entriesByDate[dateKey] = [];
    }
    entriesByDate[dateKey].push(entry);
  });

  // Sort dates (newest first)
  const sortedDates = Object.keys(entriesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  // Process each date
  sortedDates.forEach((dateKey) => {
    const dateEntries = entriesByDate[dateKey];
    const dateObj = new Date(dateKey);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const dayStr = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // Collect all tasks for this date
    const allTasks: Array<{
      taskName: string;
      timeIn: string;
      timeOut: string;
      hoursRendered: number;
      category: string;
      learningOutcome: string;
      createdAt: Date;
    }> = [];

    dateEntries.forEach((entry) => {
      entry.tasks.forEach((task) => {
        allTasks.push({
          taskName: task.taskName,
          timeIn: task.timeIn,
          timeOut: task.timeOut,
          hoursRendered: task.hoursRendered,
          category: task.category,
          learningOutcome: entry.notes || "-",
          createdAt: task.createdAt,
        });
      });
    });

    // Sort tasks by createdAt (newest first)
    allTasks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Add each task
    allTasks.forEach((task) => {
      const createdAtDate = new Date(task.createdAt);
      const createdAtStr = createdAtDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const learningOutcome = task.learningOutcome.replace(/,/g, ";"); // Replace commas to avoid CSV issues
      const taskName = task.taskName.replace(/,/g, ";");

      csvRows.push(
        `"${dateStr}","${dayStr}","${taskName}","${task.timeIn}","${task.timeOut}","${formatHoursMinutes(task.hoursRendered)}","${task.category}","${learningOutcome}","${createdAtStr}"`, // UPDATED
      );
    });

    // Calculate total hours for this date
    const totalHours = allTasks.reduce(
      (sum, task) => sum + task.hoursRendered,
      0,
    );

    // Add total row
    csvRows.push(
      `"","","TOTAL FOR ${dateStr}","","","${formatHoursMinutes(totalHours)}","","",""`, // UPDATED
    );

    // Add empty row
    csvRows.push("");
  });

  // Add grand total
  const grandTotal = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  csvRows.push(
    `"","","GRAND TOTAL","","","${formatHoursMinutes(grandTotal)}","","",""`, // UPDATED
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
