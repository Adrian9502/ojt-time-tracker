export type Category =
  | "Learning"
  | "Development/Coding"
  | "Project Work"
  | "Admin"
  | "Meeting"
  | "Research"
  | "Documentation";

export type Status =
  | "Completed"
  | "In Progress"
  | "Pending Review"
  | "Approved";

export interface Task {
  id: string;
  timeIn: string;
  timeOut: string;
  hoursRendered: number;
  taskName: string;
  category: Category;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface OJTEntry {
  id: string;
  date: Date;
  tasks: Task[];
  supervisor: string;
  notes?: string;
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OJTSettings {
  requiredHours: number;
  studentName: string;
}

export interface OJTStats {
  totalHours: number;
  completedHours: number;
  remainingHours: number;
  progressPercentage: number;
  entriesCount: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: "regular" | "ooo";
  userId: string;
  oooDate?: Date;
  oooTimeStart?: string;
  oooTimeEnd?: string;
  isOneDay?: boolean; // New field
  createdAt: Date;
  updatedAt: Date;
}
