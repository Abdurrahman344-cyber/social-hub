import prisma from '@/lib/db';
import { ApiCard } from './ApiCard';

const PLATFORMS = [
  { id: 'pinterest', name: 'Pinterest', helpLink: 'https://developers.pinterest.com/apps/', requiresRedirect: true },
  { id: 'meta', name: 'Meta (IG & FB)', helpLink: 'https://developers.facebook.com/apps/', requiresRedirect: true },
  { id: 'tiktok', name: 'TikTok', helpLink: 'https://developers.tiktok.com/', requiresRedirect: true },
  { id: 'youtube', name: 'YouTube', helpLink: 'https://console.cloud.google.com/apis/credentials', requiresRedirect: true },
  { id: 'gemini', name: 'Google Gemini', helpLink: 'https://aistudio.google.com/app/apikey', requiresRedirect: false },
  { id: 'openai', name: 'OpenAI (GPT-4)', helpLink: 'https://platform.openai.com/api-keys', requiresRedirect: false },
  { id: 'anthropic', name: 'Anthropic (Claude)', helpLink: 'https://console.anthropic.com/settings/keys', requiresRedirect: false },
  { id: 'midjourney', name: 'Midjourney', helpLink: 'https://docs.midjourney.com/', requiresRedirect: false },
];

export default async function ApisPage() {
  let credentials: any[] = [];
  let tokens: any[] = [];
  try {
    credentials = await prisma.platformCredential.findMany();
    tokens = await prisma.platformToken.findMany();
  } catch (error) {
    console.error("Prisma error:", error);
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">API Connections</h1>
        <p className="text-slate-400 text-lg">Configure your integrations securely. Connect platforms to automate posting and generation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
