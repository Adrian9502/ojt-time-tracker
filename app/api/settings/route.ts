import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    let settings = await prisma.oJTSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      settings = await prisma.oJTSettings.create({
        data: {
          requiredHours: 500,
          studentName: user.name || "",
          startDate: new Date(),
          endDate: new Date(),
          userId: user.id,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    // Parse requiredHours to ensure it's a number
    const requiredHours = parseFloat(body.requiredHours);

    if (isNaN(requiredHours)) {
      return NextResponse.json(
        { error: "Invalid required hours value" },
        { status: 400 }
      );
    }

    const settings = await prisma.oJTSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      const newSettings = await prisma.oJTSettings.create({
        data: {
          requiredHours,
          studentName: body.studentName,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          userId: user.id,
        },
      });
      return NextResponse.json(newSettings);
    }

    const updatedSettings = await prisma.oJTSettings.update({
      where: { userId: user.id },
      data: {
        requiredHours,
        studentName: body.studentName,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
