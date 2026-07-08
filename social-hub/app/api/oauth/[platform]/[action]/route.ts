import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getPlatformCredential, insertOrUpdateToken } from '@/lib/db/dal';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string; action: string }> }
) {
  const { platform, action } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const creds = await getPlatformCredential(platform);
  if (!creds || !creds.clientId) {
    return NextResponse.json({ error: `Credentials not found for ${platform}` }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = creds.redirectUri || `${baseUrl}/api/oauth/${platform}/callback`;

  // --- START ACTION (Redirects to Provider) ---
  if (action === 'start') {
    let authUrl = '';
    
    if (platform === 'pinterest') {
      authUrl = `https://www.pinterest.com/oauth/?client_id=${creds.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=boards:read,pins:read,pins:write`;
    } 
    else if (platform === 'meta') {
      authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${creds.clientId}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts&response_type=code`;
    }
    else if (platform === 'tiktok') {
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${creds.clientId}&response_type=code&scope=video.upload,video.publish&redirect_uri=${redirectUri}`;
    }
    else if (platform === 'youtube') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${creds.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/yt-analytics.readonly&access_type=offline&prompt=consent`;
    }
    else {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);
  }

  // --- CALLBACK ACTION (Exchanges Code for Token) ---
  if (action === 'callback') {
    if (error) {
      return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 });
    }
    if (!code) {
      return NextResponse.json({ error: 'No code returned from OAuth provider' }, { status: 400 });
    }

    try {
      let accessToken = '';
      let refreshToken = '';
      let expiresIn = 3600;

      if (platform === 'pinterest') {
        const credentials = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
        const res = await fetch(`https://api.pinterest.com/v5/oauth/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
          }).toString()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        expiresIn = data.expires_in || 2592000;
      }
      else if (platform === 'meta') {
        const res = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${creds.clientId}&redirect_uri=${redirectUri}&client_secret=${creds.clientSecret}&code=${code}`);
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        
        // Exchange short-lived token for long-lived
        const longRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${creds.clientId}&client_secret=${creds.clientSecret}&fb_exchange_token=${data.access_token}`);
        const longData = await longRes.json();
        if (!longRes.ok) throw new Error(JSON.stringify(longData));

        accessToken = longData.access_token;
        expiresIn = longData.expires_in || 5184000; // 60 days
      }
      else if (platform === 'tiktok') {
        const res = await fetch(`https://open.tiktokapis.com/v2/oauth/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: creds.clientId,
            client_secret: creds.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        expiresIn = data.expires_in || 86400;
      }
      else if (platform === 'youtube') {
        const res = await fetch(`https://oauth2.googleapis.com/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        accessToken = data.access_token;
        refreshToken = data.refresh_token || ''; // Needs offline_access prompt=consent
        expiresIn = data.expires_in || 3600;
      }

      // Save token to database
      await insertOrUpdateToken({
        platform,
        accessToken,
        refreshToken: refreshToken || undefined,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      });

      // Redirect back to settings page
      return NextResponse.redirect(new URL('/dashboard/settings', request.url));
      
    } catch (e: any) {
      console.error('OAuth Exchange Error:', e);
      return NextResponse.json({ error: 'Failed to exchange token', details: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
