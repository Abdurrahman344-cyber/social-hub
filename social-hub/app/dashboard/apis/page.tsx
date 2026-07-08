import prisma from '@/lib/db';
import { ApiCard } from './ApiCard';

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
    requiresRedirect: false,
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4)',
    helpLink: 'https://platform.openai.com/api-keys',
    requiresRedirect: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    helpLink: 'https://console.anthropic.com/settings/keys',
    requiresRedirect: false,
  },
  {
    id: 'midjourney',
    name: 'Midjourney (via API)',
    helpLink: 'https://docs.midjourney.com/',
    requiresRedirect: false,
  },
];

export default async function ApisPage() {
  let credentials = [];
  let tokens = [];
  try {
    credentials = await prisma.platformCredential.findMany();
    tokens = await prisma.platformToken.findMany();
  } catch (error) {
    console.error("Prisma error:", error);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="relative mb-10 p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">API Connections</h1>
          <p className="text-blue-100 max-w-2xl text-lg font-medium opacity-90">
            Configure your integrations seamlessly. Connect social platforms for automated posting, and AI services for content generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PLATFORMS.map((platform) => {
          const cred = credentials.find((c: any) => c.platform === platform.id);
          const token = tokens.find((t: any) => t.platform === platform.id);

          return (
            <ApiCard
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
