import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error("Failed to fetch image");
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'attachment; filename="wedding-photo.jpg"',
      },
    });

  } catch (error) {
    console.error("Download API Error:", error);
    return NextResponse.json({ error: "Error downloading image" }, { status: 500 });
  }
}