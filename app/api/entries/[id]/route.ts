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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params
    const { id } = await params;

    const existingEntry = await prisma.oJTEntry.findUnique({
      where: { id },
    });

    if (!existingEntry || existingEntry.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: EntryInput = await request.json();

    const totalHours = body.tasks.reduce(
      (sum, task) => sum + task.hoursRendered,
      0
    );

    // Delete existing tasks first
    await prisma.task.deleteMany({
      where: { entryId: id },
    });

    const entry = await prisma.oJTEntry.update({
      where: { id },
      data: {
        date: new Date(body.date),
        supervisor: body.supervisor,
        notes: body.notes,
        totalHours,
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
    console.error("Failed to update entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params
    const { id } = await params;

    const existingEntry = await prisma.oJTEntry.findUnique({
      where: { id },
    });

    if (!existingEntry || existingEntry.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.oJTEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
