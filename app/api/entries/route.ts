import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface TaskInput {
  timeIn: string;
  timeOut: string;
  hoursRendered: number;
  taskName: string;
  category: string;
  status: string;
}

interface EntryInput {
  date: string;
  supervisor: string;
  notes?: string;
  tasks: TaskInput[];
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const entries = await prisma.oJTEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: EntryInput = await request.json();

    // Calculate total hours from tasks
    const totalHours = body.tasks.reduce(
      (sum, task) => sum + task.hoursRendered,
      0
    );

    const entry = await prisma.oJTEntry.create({
      data: {
        date: new Date(body.date),
        supervisor: body.supervisor,
        notes: body.notes,
        totalHours,
        userId: user.id,
        tasks: {
          create: body.tasks.map((task) => ({
            timeIn: task.timeIn,
            timeOut: task.timeOut,
            hoursRendered: task.hoursRendered,
            taskName: task.taskName,
            category: task.category,
            status: task.status,
          })),
        },
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
