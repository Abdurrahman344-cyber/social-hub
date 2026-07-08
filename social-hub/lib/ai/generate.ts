import prisma from '../db/index';
import { getPlatformCredential } from '../db/dal';
import { getStore } from '@netlify/blobs';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function getGeminiKey() {
  const cred = await getPlatformCredential('gemini');
  if (!cred || !cred.clientSecret) {
    throw new Error('GEMINI API KEY is missing in platform_credentials (use clientSecret field for the key)');
  }
  return cred.clientSecret;
}

/**
 * Helper to fetch a prompt template from the database
 */
async function fetchTemplate(siteName: string, platform: string) {
  const template = await prisma.promptTemplate.findFirst({
    where: { siteName, platform }
  });
  
  if (!template) {
    // Provide a sensible fallback if no template exists
    return {
      promptText: 'Write an engaging and natural social media post.',
      imageStyleNotes: 'High quality, vibrant, photorealistic.',
    };
  }
  
  return template;
}

export async function generateCaption(topic: string, platform: string, siteContext: string) {
  const GEMINI_API_KEY = await getGeminiKey();
  
  const template = await fetchTemplate(siteContext, platform);
  
  const systemPrompt = `You are a social media manager for the site "${siteContext}".
Platform: ${platform}
Tone/Style Guidelines: ${template.promptText}

Task: Write a highly engaging caption for a post about "${topic}". 
Include relevant hashtags at the end. Do not wrap the response in quotes.`;

  const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini Text Gen Error: ${JSON.stringify(data)}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Failed to parse Gemini text response');

  // Basic extraction: separate hashtags from caption if possible, 
  // but usually it's fine to keep them together for the DB.
  // We'll just extract words starting with #
  const words = text.split(/\s+/);
  const hashtags = words.filter(w => w.startsWith('#')).join(' ');
  const caption = text.replace(hashtags, '').trim();

  return { caption, hashtags };
}

export async function generateImage(prompt: string, platform: string, siteContext: string) {
  const GEMINI_API_KEY = await getGeminiKey();
  
  const template = await fetchTemplate(siteContext, platform);
  
  // Determine Aspect Ratio based on platform
  let aspectRatio = '1:1'; // Default (Instagram)
  if (platform.toLowerCase() === 'pinterest') {
    aspectRatio = '3:4'; // Closest to 2:3/1000x1500 available in Imagen
  } else if (platform.toLowerCase() === 'youtube') {
    aspectRatio = '16:9'; // 1280x720
  } else if (platform.toLowerCase() === 'tiktok') {
    aspectRatio = '9:16';
  }
  
  const fullPrompt = `${prompt}. Style guidelines: ${template.imageStyleNotes}`;

  const response = await fetch(`${GEMINI_BASE_URL}/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: fullPrompt }],
      parameters: {
        sampleCount: 1,
        outputOptions: { mimeType: 'image/jpeg' },
        aspectRatio: aspectRatio
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini Image Gen Error: ${JSON.stringify(data)}`);
  }

  const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64Image) {
    throw new Error('No image returned from Gemini');
  }

  // Decode base64 to buffer
  const imageBuffer = Buffer.from(base64Image, 'base64');
  
  // Save to Netlify Blobs
  const fileName = `${platform}/${Date.now()}.jpg`;
  const store = getStore({ name: 'media', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
  await store.set(fileName, imageBuffer);
  
  return fileName; // Now just a key, not a path
}

export async function generateFullPost(topic: string, platform: string, siteContext: string) {
  // 1. Generate text content
  const { caption, hashtags } = await generateCaption(topic, platform, siteContext);
  
  // 2. Generate image
  // We use the topic as the core image prompt, but you could also ask Gemini text to generate an image prompt!
  const imagePrompt = `A visually appealing image representing: ${topic}`;
  const mediaPath = await generateImage(imagePrompt, platform, siteContext);
  
  // 3. Insert as Draft into Content Queue
  const draft = await prisma.contentQueue.create({
    data: {
      platform,
      title: `${topic.substring(0, 50)}...`,
      caption,
      hashtags,
      mediaPath,
      mediaType: 'image',
      status: 'draft',
      // Scheduled time is left null until manual review
    }
  });

  return draft;
}
