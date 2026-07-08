'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateFullPost } from '@/lib/ai/generate';

export async function approvePost(id: string) {
  await prisma.contentQueue.update({
    where: { id },
    data: { status: 'queued' },
  });
  revalidatePath('/dashboard/queue');
  return { success: true };
}

export async function deletePost(id: string) {
  await prisma.contentQueue.delete({
    where: { id },
  });
  revalidatePath('/dashboard/queue');
  return { success: true };
}

export async function savePostEdits(id: string, caption: string, mediaPath: string) {
  await prisma.contentQueue.update({
    where: { id },
    data: { caption, mediaPath },
  });
  revalidatePath('/dashboard/queue');
  return { success: true };
}

export async function triggerAIGeneration(topic: string, platform: string, siteContext: string) {
  try {
    const post = await generateFullPost(topic, platform, siteContext);
    revalidatePath('/dashboard/queue');
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
