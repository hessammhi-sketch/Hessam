import { NextResponse } from "next/server";
import { createWorkout } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await createWorkout(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create workout." },
      { status: 500 }
    );
  }
}
