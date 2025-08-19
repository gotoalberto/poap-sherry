import { NextResponse } from "next/server";

const POAP_EVENT_ID = process.env.POAP_EVENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// POAP contract ABI (simplified version with mintToken function)
const POAP_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "mintToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function GET() {
  try {
    // Fetch POAP event data first
    const eventResponse = await fetch(`${APP_URL}/api/poap-event`);
    const eventData = await eventResponse.json();
    
    // Create Sherry metadata for our POAP mini-app
    const metadata = {
      type: "action",
      url: APP_URL,
      icon: eventData.image_url || `${APP_URL}/poap-event-image.png`,
      title: `Mint ${eventData.name || 'POAP'}`,
      description: "Claim your commemorative POAP badge on Twitter",
      actions: [
        {
          label: "Mint POAP",
          address: "0x22C1f6050E56d2876009903609a2cC3fEf83B415", // POAP contract on mainnet
          abi: POAP_ABI,
          functionName: "mintToken",
          paramsLabel: ["Event ID", "Recipient"],
          chain: "mainnet"
        }
      ]
    };

    // Generate the Sherry link
    // In production, this would use the actual Sherry API endpoint
    // For now, we'll construct it based on Sherry's URL pattern
    const encodedMetadata = encodeURIComponent(JSON.stringify(metadata));
    const sherryLink = `https://sherry.social/link?app=${encodeURIComponent(APP_URL)}&metadata=${encodedMetadata}`;

    // Return the link and metadata
    return NextResponse.json({
      success: true,
      sherryLink,
      directLink: APP_URL,
      metadata,
      instructions: {
        withExtension: "Users with Sherry Links extension will see the mini-app embedded in the tweet",
        withoutExtension: "Users without the extension will be redirected to the app"
      }
    });

  } catch (error) {
    console.error("[Sherry Link] Error generating link:", error);
    return NextResponse.json(
      { error: "Failed to generate Sherry link" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, eventName, imageUrl } = body;

    // Create custom metadata if provided
    const metadata = {
      type: "action",
      url: APP_URL,
      icon: imageUrl || `${APP_URL}/poap-event-image.png`,
      title: `Mint ${eventName || 'POAP'}`,
      description: "Claim your commemorative POAP badge on Twitter",
      actions: [
        {
          label: "Mint POAP",
          address: "0x22C1f6050E56d2876009903609a2cC3fEf83B415",
          abi: POAP_ABI,
          functionName: "mintToken",
          paramsLabel: ["Event ID", "Recipient"],
          chain: "mainnet"
        }
      ]
    };

    const encodedMetadata = encodeURIComponent(JSON.stringify(metadata));
    const sherryLink = `https://sherry.social/link?app=${encodeURIComponent(APP_URL)}&metadata=${encodedMetadata}`;

    return NextResponse.json({
      success: true,
      sherryLink,
      directLink: APP_URL,
      metadata
    });

  } catch (error) {
    console.error("[Sherry Link] Error generating custom link:", error);
    return NextResponse.json(
      { error: "Failed to generate custom Sherry link" },
      { status: 500 }
    );
  }
}