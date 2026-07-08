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

export async function reschedulePost(id: string, newDateIso: string) {
  const existing = await prisma.contentQueue.findUnique({ where: { id } });
  if (!existing || !existing.scheduledTime) return { success: false, error: 'Post not found or not scheduled' };
  
  // Keep the original time, just change the date
  const originalTime = new Date(existing.scheduledTime);
  const newDate = new Date(newDateIso);
  
  newDate.setHours(originalTime.getHours());
  newDate.setMinutes(originalTime.getMinutes());
  newDate.setSeconds(originalTime.getSeconds());
  
  await prisma.contentQueue.update({
    where: { id },
    data: { scheduledTime: newDate },
  });
  
  revalidatePath('/dashboard/planner');
  revalidatePath('/dashboard/queue');
  return { success: true };
}
