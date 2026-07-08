import prisma from '@/lib/db';
import { SettingsCard } from './SettingsCard';

const PLATFORMS = [
  {
    id: 'pinterest',
    name: 'Pinterest',
    helpLink: 'https://developers.pinterest.com/apps/',
    requiresRedirect: true,
  },
  {
    id: 'meta',
    name: 'Meta (Instagram & Facebook)',
    helpLink: 'https://developers.facebook.com/apps/',
    requiresRedirect: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    helpLink: 'https://developers.tiktok.com/',
    requiresRedirect: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    helpLink: 'https://console.cloud.google.com/apis/credentials',
    requiresRedirect: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini (AI)',
    helpLink: 'https://aistudio.google.com/app/apikey',
    requiresRedirect: false, // AI just needs the key
  },
];

export default async function SettingsPage() {
  const credentials = await prisma.platformCredential.findMany();
  const tokens = await prisma.platformToken.findMany();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Connections & Settings</h1>
      <p className="text-gray-600 mb-8">
        Configure your app credentials locally. Since this is for your personal use, 
        these are stored directly in your local SQLite database.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORMS.map((platform) => {
          const cred = credentials.find(c => c.platform === platform.id);
          const token = tokens.find(t => t.platform === platform.id);

          return (
            <SettingsCard
              key={platform.id}
              platform={platform}
              credential={cred}
              token={token}
            />
          );
        })}
      </div>
    </div>
  );
}
