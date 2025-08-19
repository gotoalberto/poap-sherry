import { NextRequest, NextResponse } from "next/server";
import { createRedisClient } from "~/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user has already claimed using Redis
    const redis = createRedisClient();
    if (redis) {
      const claimKey = `poap_claim:${process.env.POAP_EVENT_ID}:${userId}`;
      const claimedData = await redis.get(claimKey);
      
      if (claimedData) {
        const { address } = JSON.parse(claimedData);
        return NextResponse.json({ claimed: true, address });
      }
    }

    return NextResponse.json({ claimed: false });
  } catch (error) {
    console.error("[POAP Claim Check] Error:", error);
    return NextResponse.json(
      { error: "Failed to check claim status" },
      { status: 500 }
    );
  }
}