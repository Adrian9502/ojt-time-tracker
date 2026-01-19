import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateTotalHours } from "@/lib/utils";

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
      include: { tasks: true },
      orderBy: { date: "desc" },
    });

    // Recalculate totalHours to ensure accuracy
    const entriesWithCalculatedHours = entries.map((entry) => ({
      ...entry,
      totalHours: calculateTotalHours(entry.tasks),
    }));

    return NextResponse.json(entriesWithCalculatedHours);
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 },
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

    const body = await request.json();

    // Calculate total hours from tasks
    const totalHours = calculateTotalHours(body.tasks);

    const entry = await prisma.oJTEntry.create({
      data: {
        date: new Date(body.date),
        supervisor: body.supervisor,
        notes: body.notes,
        totalHours,
        userId: user.id,
        tasks: {
          create: body.tasks,
        },
      },
      include: { tasks: true },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 },
    );
  }
}
