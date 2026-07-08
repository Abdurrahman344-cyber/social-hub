import { getPlatformToken, insertOrUpdateToken, getPlatformCredential } from '../db/dal';
import { getStore } from '@netlify/blobs';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

export class TikTokClient {
  constructor() {}

  private async getCredentials() {
    const creds = await getPlatformCredential('tiktok');
    if (!creds || !creds.clientId || !creds.clientSecret) {
      throw new Error('TikTok credentials not configured in database');
    }
    return creds;
  }

  private async getValidToken() {
    const token = await getPlatformToken('tiktok');
    if (!token) throw new Error('No TikTok token found in database');

    if (token.expiresAt && token.expiresAt.getTime() - Date.now() < 60 * 60 * 1000) {
      if (!token.refreshToken) throw new Error('No refresh token available for TikTok');
      return this.refreshToken(token.refreshToken);
    }
    
    return token.accessToken;
  }

  async refreshToken(refreshToken: string) {
    const creds = await this.getCredentials();
    const url = 'https://open.tiktokapis.com/v2/oauth/token/';
    
    const payload = new URLSearchParams({
      client_key: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Failed to refresh TikTok token: ${JSON.stringify(data)}`);

    await insertOrUpdateToken({
      platform: 'tiktok',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 86400) * 1000),
    });

    return data.access_token;
  }

  async postVideo(videoKey: string, caption: string) {
    const token = await this.getValidToken();

    const store = getStore({ name: 'media', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
    const videoBuffer = await store.get(videoKey, { type: 'buffer' });
    if (!videoBuffer) throw new Error(`Blob not found: ${videoKey}`);
    
    const videoSize = videoBuffer.length;

    const initUrl = `${TIKTOK_API_BASE}/post/publish/video/init/`;
    const initPayload = {
      post_info: {
        title: caption,
        privacy_level: 'SELF_ONLY',
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoSize,
        chunk_size: videoSize,
        total_chunk_count: 1,
      }
    };

    const initResponse = await fetch(initUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initPayload),
    });

    const initData = await initResponse.json();
    if (!initResponse.ok || initData.error?.code !== 'ok') {
      throw new Error(`TikTok Init Upload Error: ${JSON.stringify(initData)}`);
    }

    const publishId = initData.data.publish_id;
    const uploadUrl = initData.data.upload_url;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
        'Content-Length': videoSize.toString(),
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`TikTok Video Upload Error: ${await uploadResponse.text()}`);
    }

    return {
      publish_id: publishId,
      status: 'Upload initiated.',
    };
  }

  async getVideoAnalytics(publishId: string) {
    const token = await this.getValidToken();
    const statusUrl = `${TIKTOK_API_BASE}/post/publish/status/fetch/`;
    
    const response = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publish_id: publishId }),
    });

    const data = await response.json();
    if (!response.ok || data.error?.code !== 'ok') {
      throw new Error(`TikTok Status Fetch Error: ${JSON.stringify(data)}`);
    }

    return data.data;
  }
}
