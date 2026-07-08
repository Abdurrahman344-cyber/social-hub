import { schedule } from '@netlify/functions';

export const handler = schedule('0 0 * * *', async (event) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://social-hub-app.netlify.app';
  
  try {
    const response = await fetch(`${baseUrl}/api/cron/analytics`);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('Analytics Cron Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
});
