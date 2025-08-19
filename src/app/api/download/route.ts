import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName } = await request.json();

    if (!imageUrl || !fileName) {
      return NextResponse.json(
        { error: "Image URL and file name are required" },
        { status: 400 }
      );
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 500 }
      );
    }

    const imageBlob = await imageResponse.blob();

    // Return the image as a response
    return new NextResponse(imageBlob, {
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") || "image/png",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error("[Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to download image" },
      { status: 500 }
    );
  }
}