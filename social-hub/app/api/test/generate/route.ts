import { NextResponse } from 'next/server';
import { generateFullPost } from '@/lib/ai/generate';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Defaults for testing
  const topic = searchParams.get('topic') || 'Top 5 urban gardening tips for small balconies';
  const platform = searchParams.get('platform') || 'pinterest';
  const siteContext = searchParams.get('siteContext') || 'apartmenthomesteader';

  try {
    // Generates caption, hashtags, and an image via Gemini
    // Then inserts it as a draft into the DB queue
    const draftPost = await generateFullPost(topic, platform, siteContext);

    return NextResponse.json({
      success: true,
      message: 'Successfully generated AI post and saved as draft.',
      post: draftPost,
      preview: {
        caption: draftPost.caption,
        hashtags: draftPost.hashtags,
        mediaUrl: `/${draftPost.mediaPath.replace('public/', '')}`, // Format for Next.js static serving
      }
    });
  } catch (error: any) {
    console.error('AI Generation Test Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred during AI generation',
    }, { status: 500 });
  }
}
