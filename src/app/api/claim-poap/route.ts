import { NextRequest, NextResponse } from "next/server";
import { createRedisClient } from "~/lib/redis";

const POAP_API_KEY = process.env.POAP_API_KEY;
const POAP_CLIENT_ID = process.env.POAP_CLIENT_ID;
const POAP_CLIENT_SECRET = process.env.POAP_CLIENT_SECRET;
const POAP_EVENT_ID = process.env.POAP_EVENT_ID;
const POAP_SECRET_CODE = process.env.POAP_SECRET_CODE;

export async function POST(request: NextRequest) {
  try {
    const { address, userId, username } = await request.json();

    if (!address || !userId) {
      return NextResponse.json(
        { error: "Address and user ID are required" },
        { status: 400 }
      );
    }

    // Check if user has already claimed using Redis
    const redis = createRedisClient();
    if (redis) {
      const claimKey = `poap_claim:${POAP_EVENT_ID}:${userId}`;
      const existingClaim = await redis.get(claimKey);
      
      if (existingClaim) {
        return NextResponse.json(
          { error: "You have already claimed this POAP" },
          { status: 400 }
        );
      }
    }

    // Get POAP access token
    const authResponse = await fetch("https://auth.accounts.poap.xyz/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audience: "https://api.poap.tech",
        grant_type: "client_credentials",
        client_id: POAP_CLIENT_ID,
        client_secret: POAP_CLIENT_SECRET,
      }),
    });

    if (!authResponse.ok) {
      console.error("[POAP Claim] Auth error:", await authResponse.text());
      return NextResponse.json(
        { error: "Failed to authenticate with POAP API" },
        { status: 500 }
      );
    }

    const { access_token } = await authResponse.json();

    // Request a claim code
    const claimResponse = await fetch(
      `https://api.poap.tech/event/${POAP_EVENT_ID}/qr-codes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-API-Key": POAP_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret_code: POAP_SECRET_CODE,
          requested_codes: 1,
        }),
      }
    );

    if (!claimResponse.ok) {
      console.error("[POAP Claim] Claim code error:", await claimResponse.text());
      return NextResponse.json(
        { error: "Failed to generate claim code" },
        { status: 500 }
      );
    }

    const claimData = await claimResponse.json();
    const qrCode = claimData.qr_codes?.[0];

    if (!qrCode) {
      return NextResponse.json(
        { error: "No claim codes available" },
        { status: 500 }
      );
    }

    // Redeem the claim code for the user
    const redeemResponse = await fetch(
      `https://api.poap.tech/actions/claim-qr`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "X-API-Key": POAP_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address.toLowerCase(),
          qr_hash: qrCode.qr_hash,
        }),
      }
    );

    if (!redeemResponse.ok) {
      const errorText = await redeemResponse.text();
      console.error("[POAP Claim] Redeem error:", errorText);
      return NextResponse.json(
        { error: "Failed to mint POAP" },
        { status: 500 }
      );
    }

    // Save claim to Redis
    if (redis) {
      const claimKey = `poap_claim:${POAP_EVENT_ID}:${userId}`;
      await redis.set(
        claimKey,
        JSON.stringify({
          address,
          username,
          claimedAt: new Date().toISOString(),
        }),
        { EX: 60 * 60 * 24 * 365 } // 1 year expiry
      );
    }

    return NextResponse.json({
      success: true,
      message: "POAP claimed successfully",
    });

  } catch (error) {
    console.error("[POAP Claim] Error:", error);
    return NextResponse.json(
      { error: "Failed to claim POAP" },
      { status: 500 }
    );
  }
}