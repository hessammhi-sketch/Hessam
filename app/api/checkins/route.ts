import { NextResponse } from "next/server";
import { createCheckIn } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await createCheckIn(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create check-in." },
      { status: 500 }
    );
  }
}
