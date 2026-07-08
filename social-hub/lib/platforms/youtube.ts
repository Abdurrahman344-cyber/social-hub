import { getPlatformToken, insertOrUpdateToken, getPlatformCredential } from '../db/dal';
import { getStore } from '@netlify/blobs';

const YOUTUBE_DATA_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_ANALYTICS_API_BASE = 'https://youtubeanalytics.googleapis.com/v2';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export class YouTubeClient {
  constructor() {}

  private async getCredentials() {
    const creds = await getPlatformCredential('youtube');
    if (!creds || !creds.clientId || !creds.clientSecret) {
      throw new Error('YouTube credentials not configured in database');
    }
    return creds;
  }

  private async getValidToken() {
    const token = await getPlatformToken('youtube');
    if (!token) throw new Error('No YouTube token found in database');

    if (token.expiresAt && token.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      if (!token.refreshToken) throw new Error('No refresh token available for YouTube');
      return this.refreshToken(token.refreshToken);
    }
    
    return token.accessToken;
  }

  async refreshToken(refreshToken: string) {
    const creds = await this.getCredentials();

    const payload = new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to refresh Google token: ${JSON.stringify(data)}`);
    }

    await insertOrUpdateToken({
      platform: 'youtube',
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    });

    return data.access_token;
  }

  async uploadVideo(videoKey: string, title: string, description: string, tags: string[] = []) {
    const token = await this.getValidToken();

    const store = getStore({ name: 'media', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
    const videoBuffer = await store.get(videoKey, { type: 'buffer' });
    if (!videoBuffer) throw new Error(`Blob not found: ${videoKey}`);
    
    const videoSize = videoBuffer.length;

    const ext = videoKey.split('.').pop()?.toLowerCase();
    const contentType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';

    const initUrl = `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`;
    
    const initPayload = {
      snippet: { title, description, tags },
      status: { privacyStatus: 'private', selfDeclaredMadeForKids: false }
    };

    const initResponse = await fetch(initUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': videoSize.toString(),
        'X-Upload-Content-Type': contentType,
      },
      body: JSON.stringify(initPayload),
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      throw new Error(`YouTube Init Upload Error: ${JSON.stringify(errorData)}`);
    }

    const uploadUrl = initResponse.headers.get('location');
    if (!uploadUrl) {
      throw new Error('YouTube API did not return a resumable upload location URL.');
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': videoSize.toString(),
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`YouTube Video Upload Error: ${await uploadResponse.text()}`);
    }

    const videoData = await uploadResponse.json();
    return videoData; 
  }

  async getVideoAnalytics(videoId: string) {
    const token = await this.getValidToken();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365); 
    const endDate = new Date();
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const metrics = 'views,estimatedMinutesWatched,subscribersGained';
    
    const url = new URL(`${YOUTUBE_ANALYTICS_API_BASE}/reports`);
    url.searchParams.append('ids', 'channel==MINE');
    url.searchParams.append('startDate', startStr);
    url.searchParams.append('endDate', endStr);
    url.searchParams.append('metrics', metrics);
    url.searchParams.append('dimensions', 'video');
    url.searchParams.append('filters', `video==${videoId}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`YouTube Analytics Error: ${JSON.stringify(data)}`);
    }

    let stats = { views: 0, watchTime: 0, subsGained: 0 };
    
    if (data.rows && data.rows.length > 0) {
      const row = data.rows[0];
      stats = {
        views: row[1],
        watchTime: row[2], 
        subsGained: row[3],
      };
    }

    return stats;
  }
}
