import { NextResponse } from 'next/server';
import { PinterestClient } from '@/lib/platforms/pinterest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');
  
  if (!boardId) {
    return NextResponse.json({ error: 'Missing boardId query parameter (e.g. ?boardId=12345)' }, { status: 400 });
  }

  try {
    const client = new PinterestClient();
    
    const title = 'Test Pin from Social Hub';
    const description = 'This is an automated test pin created using the new Social Hub application.';
    const link = 'https://github.com/social-hub';
    const imagePath = 'public/sample-pin.jpg';

    // 1. Post Pin
    const postResult = await client.postPin(imagePath, title, description, boardId, link);
    
    // Ensure we got an ID back
    const pinId = postResult?.id;

    if (!pinId) {
      return NextResponse.json({ success: false, message: 'Posted pin, but no ID was returned', result: postResult });
    }

    // 2. Fetch Analytics (Note: analytics might not be immediately available)
    let analyticsResult = null;
    try {
      analyticsResult = await client.getPinAnalytics(pinId);
    } catch (e: any) {
      analyticsResult = { error: 'Analytics not available yet', details: e.message };
    }

    return NextResponse.json({
      success: true,
      message: 'Pin successfully posted!',
      pin: postResult,
      analytics: analyticsResult,
    });
  } catch (error: any) {
    console.error('Pinterest Test Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
    }, { status: 500 });
  }
}
