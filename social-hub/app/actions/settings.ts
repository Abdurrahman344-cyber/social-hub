'use server';

import { insertOrUpdateCredential } from '@/lib/db/dal';
import { revalidatePath } from 'next/cache';

export async function savePlatformCredential(formData: FormData) {
  const platform = formData.get('platform') as string;
  const clientId = formData.get('clientId') as string;
  const clientSecret = formData.get('clientSecret') as string;
  const redirectUri = formData.get('redirectUri') as string;

  if (!platform || !clientId || !clientSecret) {
    throw new Error('Platform, Client ID, and Client Secret are required');
  }

  await insertOrUpdateCredential({
    platform,
    clientId,
    clientSecret,
    redirectUri: redirectUri || undefined,
  });

  revalidatePath('/dashboard/settings');
  return { success: true };
}
