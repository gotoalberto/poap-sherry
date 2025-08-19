import { NextResponse } from "next/server";
import { createPOAPMetadata } from "~/lib/sherry-config";

// This endpoint provides the Sherry metadata for the mini-app
export async function GET() {
  try {
    const eventId = parseInt(process.env.POAP_EVENT_ID || "0");
    const eventName = "Twitter POAP"; // You can fetch this from POAP API if needed
    
    const metadata = createPOAPMetadata(eventId, eventName);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("[Metadata] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate metadata" },
      { status: 500 }
    );
  }
}