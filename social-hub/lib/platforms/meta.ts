import { getPlatformToken, insertOrUpdateToken, getPlatformCredential } from '../db/dal';
import { getStore } from '@netlify/blobs';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export class MetaClient {
  private igUserId: string;
  private fbPageId: string;

  constructor() {
    this.igUserId = process.env.META_IG_USER_ID || '';
    this.fbPageId = process.env.META_FB_PAGE_ID || '';
  }

  private async getCredentials() {
    const creds = await getPlatformCredential('meta');
    if (!creds || !creds.clientId || !creds.clientSecret) {
      throw new Error('Meta credentials not configured in database');
    }
    return creds;
  }

  private async getValidToken() {
    const token = await getPlatformToken('meta');
    if (!token) throw new Error('No Meta token found in database');

    if (token.expiresAt && token.expiresAt.getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000) {
      return this.refreshLongLivedToken(token.accessToken);
    }
    
    return token.accessToken;
  }

  async refreshLongLivedToken(currentToken: string) {
    const creds = await this.getCredentials();

    const url = `${META_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${creds.clientId}&client_secret=${creds.clientSecret}&fb_exchange_token=${currentToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to refresh Meta token: ${JSON.stringify(data)}`);
    }

    const expiresIn = data.expires_in || 5184000;
    
    await insertOrUpdateToken({
      platform: 'meta',
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });

    return data.access_token;
  }

  async postToFacebook(imageKeyOrUrl: string, caption: string) {
    const token = await this.getValidToken();
    if (!this.fbPageId) throw new Error('META_FB_PAGE_ID is not configured');

    const url = `${META_GRAPH_URL}/${this.fbPageId}/photos`;
    let response;
    
    if (imageKeyOrUrl.startsWith('http://') || imageKeyOrUrl.startsWith('https://')) {
      const payload = new URLSearchParams({
        url: imageKeyOrUrl,
        message: caption,
        access_token: token,
      });
      response = await fetch(url, { method: 'POST', body: payload });
    } else {
      const store = getStore({ name: 'media', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
      const imageBuffer = await store.get(imageKeyOrUrl, { type: 'buffer' });
      if (!imageBuffer) throw new Error(`Blob not found: ${imageKeyOrUrl}`);
      
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('source', blob, 'image.jpg');
      formData.append('message', caption);
      formData.append('access_token', token);
      
      response = await fetch(url, { method: 'POST', body: formData });
    }

    const data = await response.json();
    if (!response.ok) throw new Error(`Facebook Post Error: ${JSON.stringify(data)}`);
    return data;
  }

  async postToInstagram(imageUrl: string, caption: string) {
    const token = await this.getValidToken();
    if (!this.igUserId) throw new Error('META_IG_USER_ID is not configured');

    if (!imageUrl.startsWith('http')) {
      throw new Error('Instagram Graph API requires a public image URL.');
    }

    const containerUrl = `${META_GRAPH_URL}/${this.igUserId}/media`;
    const containerPayload = new URLSearchParams({
      image_url: imageUrl,
      caption: caption,
      access_token: token,
    });

    const containerResponse = await fetch(containerUrl, { method: 'POST', body: containerPayload });
    const containerData = await containerResponse.json();
    if (!containerResponse.ok) throw new Error(`IG Container Error: ${JSON.stringify(containerData)}`);

    const publishUrl = `${META_GRAPH_URL}/${this.igUserId}/media_publish`;
    const publishPayload = new URLSearchParams({
      creation_id: containerData.id,
      access_token: token,
    });

    const publishResponse = await fetch(publishUrl, { method: 'POST', body: publishPayload });
    const publishData = await publishResponse.json();

    if (!publishResponse.ok) throw new Error(`IG Publish Error: ${JSON.stringify(publishData)}`);
    return publishData;
  }

  async getInstagramInsights(mediaId: string) {
    const token = await this.getValidToken();
    const metrics = 'impressions,reach,saved,likes,comments';
    const url = `${META_GRAPH_URL}/${mediaId}/insights?metric=${metrics}&access_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(`IG Insights Error: ${JSON.stringify(data)}`);
    return data;
  }

  async getFacebookPostInsights(postId: string) {
    const token = await this.getValidToken();
    const metrics = 'post_impressions,post_impressions_unique,post_engaged_users';
    const url = `${META_GRAPH_URL}/${postId}/insights?metric=${metrics}&access_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(`FB Insights Error: ${JSON.stringify(data)}`);
    return data;
  }
}
