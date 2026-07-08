import { getPlatformToken, insertOrUpdateToken, getPlatformCredential } from '../db/dal';
import { getStore } from '@netlify/blobs';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

export class PinterestClient {
  constructor() {}

  private async getValidToken() {
    const token = await getPlatformToken('pinterest');
    if (!token) throw new Error('No Pinterest token found');

    // If token expires in less than 5 minutes, refresh it
    if (token.expiresAt && token.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      if (!token.refreshToken) throw new Error('No refresh token available');
      return this.refreshToken(token.refreshToken);
    }
    
    return token.accessToken;
  }

  async refreshToken(refreshToken: string) {
    const creds = await getPlatformCredential('pinterest');
    if (!creds || !creds.clientId || !creds.clientSecret) {
      throw new Error('Pinterest credentials not configured in database');
    }
    const credentials = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
    
    const response = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${await response.text()}`);
    }

    const data = await response.json();
    
    await insertOrUpdateToken({
      platform: 'pinterest',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    });

    return data.access_token;
  }

  async postPin(imageKey: string, title: string, description: string, boardId: string, link: string) {
    const token = await this.getValidToken();

    // Read image from Netlify Blobs
    const store = getStore({ name: 'media', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
    const arrayBuffer = await store.get(imageKey, { type: 'arrayBuffer' });
    if (!arrayBuffer) throw new Error(`Blob not found: ${imageKey}`);
    const imageBuffer = Buffer.from(arrayBuffer);

    const base64Image = imageBuffer.toString('base64');
    
    // Determine content type (fallback to jpeg if missing extension)
    const ext = imageKey.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';

    const payload = {
      title,
      description,
      board_id: boardId,
      link,
      media_source: {
        source_type: 'image_base64',
        content_type: contentType,
        data: base64Image,
      }
    };

    const response = await fetch(`${PINTEREST_API_BASE}/pins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to post pin: ${await response.text()}`);
    }

    return response.json();
  }

  async getPinAnalytics(pinId: string) {
    const token = await this.getValidToken();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();
    
    // Format YYYY-MM-DD
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const metrics = 'IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK';
    const url = `${PINTEREST_API_BASE}/pins/${pinId}/analytics?start_date=${startStr}&end_date=${endStr}&metric_types=${metrics}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${await response.text()}`);
    }

    return response.json();
  }
}
