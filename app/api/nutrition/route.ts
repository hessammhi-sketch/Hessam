import { NextResponse } from "next/server";
import { createNutritionEntries } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await createNutritionEntries(payload.entries);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create nutrition entries." },
      { status: 500 }
    );
  }
}
