import { NextResponse } from 'next/server';
import { MetaClient } from '@/lib/platforms/meta';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target') || 'both'; // 'fb', 'ig', or 'both'
  const imageUrl = searchParams.get('imageUrl') || 'https://via.placeholder.com/600x600.jpg?text=Meta+Test';
  const localImage = 'public/sample-pin.jpg';
  
  try {
    const client = new MetaClient();
    
    const caption = 'Test Post from Social Hub #automation #test';
    const results: any = {};

    // 1. Facebook Test (Supports local file binary upload)
    if (target === 'fb' || target === 'both') {
      try {
        const fbResult = await client.postToFacebook(localImage, caption);
        results.facebook = fbResult;
        
        // Fetch insights right away (might be empty/0 immediately)
        if (fbResult.id) {
          results.facebookAnalytics = await client.getFacebookPostInsights(fbResult.id).catch(e => e.message);
        }
      } catch (e: any) {
        results.facebook = { error: e.message };
      }
    }

    // 2. Instagram Test (Requires public URL)
    if (target === 'ig' || target === 'both') {
      try {
        const igResult = await client.postToInstagram(imageUrl, caption);
        results.instagram = igResult;
        
        // Fetch insights
        if (igResult.id) {
          results.instagramAnalytics = await client.getInstagramInsights(igResult.id).catch(e => e.message);
        }
      } catch (e: any) {
        results.instagram = { error: e.message };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Meta test completed',
      results,
    });
  } catch (error: any) {
    console.error('Meta Test Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
    }, { status: 500 });
  }
}
