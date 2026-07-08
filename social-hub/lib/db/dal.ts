import prisma from './index';
import { Prisma } from '@prisma/client';

export async function getQueuedPosts(platform?: string) {
  const where = { status: 'queued' } as any;
  if (platform) where.platform = platform;
  
  return prisma.contentQueue.findMany({
    where,
    orderBy: { scheduledTime: 'asc' },
  });
}

export async function getPlatformToken(platform: string) {
  return prisma.platformToken.findFirst({
    where: { platform },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function insertOrUpdateToken(data: {
  platform: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  accountName?: string;
}) {
  const existing = await getPlatformToken(data.platform);
  
  if (existing) {
    return prisma.platformToken.update({
      where: { id: existing.id },
      data,
    });
  } else {
    return prisma.platformToken.create({
      data,
    });
  }
}

export async function saveAnalyticsSnapshot(data: Omit<Prisma.AnalyticsSnapshotUncheckedCreateInput, 'id' | 'collectedAt' | 'date'>) {
  return prisma.analyticsSnapshot.create({
    data,
  });
}

export async function updatePostStatus(id: string, status: string, errorMessage?: string, postedAt?: Date) {
  return prisma.contentQueue.update({
    where: { id },
    data: { status, errorMessage, postedAt },
  });
}

export async function getPlatformCredential(platform: string) {
  return prisma.platformCredential.findUnique({
    where: { platform },
  });
}

export async function insertOrUpdateCredential(data: {
  platform: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}) {
  return prisma.platformCredential.upsert({
    where: { platform: data.platform },
    update: data,
    create: data,
  });
}
