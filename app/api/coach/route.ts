import { NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/coach";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await generateCoachResponse(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate coach response." },
      { status: 500 }
    );
  }
}
