import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function GET(
  request: Request,
  { params }: { params: { key: string[] } }
) {
  const key = params.key.join('/');
  
  try {
    const store = getStore({ name: 'media', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
    const buffer = await store.get(key, { type: 'buffer' });
    
    if (!buffer) {
      return new NextResponse('Blob not found', { status: 404 });
    }

    const ext = key.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'mp4') contentType = 'video/mp4';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Blob fetch error:', error);
    return new NextResponse('Error fetching blob', { status: 500 });
  }
}
