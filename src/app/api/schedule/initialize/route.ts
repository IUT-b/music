import { NextResponse } from "next/server";
import { initializeScheduler } from "@/lib/scheduler";

export async function GET() {
  try {
    await initializeScheduler();
    console.log("Scheduler initialized successfully.");
    return NextResponse.json({ message: "Scheduler initialized." });
  } catch (error) {
    console.error("Failed to initialize scheduler:", error);
    return NextResponse.json({ error: "Failed to initialize scheduler." }, { status: 500 });
  }
}
