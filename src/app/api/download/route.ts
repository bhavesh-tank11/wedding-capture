import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const directUrl = fileUrl
      .replace('/view?usp=drivesdk', '')
      .replace('/view', '')
      .replace('file/d/', 'uc?export=download&id=');

    const response = await fetch(directUrl);
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="TS_Wedding_Capture.jpg"',
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error) {
    return new NextResponse('Failed to download', { status: 500 });
  }
}