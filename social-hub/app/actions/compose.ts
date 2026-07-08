'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createManualPost(formData: FormData) {
  const platform = formData.get('platform') as string;
  const caption = formData.get('caption') as string;
  const mediaPath = formData.get('mediaPath') as string;
  const scheduledTimeStr = formData.get('scheduledTime') as string;

  if (!platform || !caption) {
    throw new Error('Platform and caption are required');
  }

  const scheduledTime = scheduledTimeStr ? new Date(scheduledTimeStr) : null;
  const status = scheduledTime ? 'queued' : 'draft';

  await prisma.contentQueue.create({
    data: {
      platform,
      caption,
      mediaPath,
      scheduledTime,
      status,
    }
  });

  revalidatePath('/dashboard/queue');
  return { success: true };
}
