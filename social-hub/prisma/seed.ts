import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing
  await prisma.analyticsSnapshot.deleteMany()
  await prisma.contentQueue.deleteMany()
  await prisma.platformToken.deleteMany()
  await prisma.promptTemplate.deleteMany()

  // 1. Platform Token
  const token = await prisma.platformToken.create({
    data: {
      platform: 'pinterest',
      accessToken: 'dummy_access_token',
      refreshToken: 'dummy_refresh_token',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      accountName: 'TestAccount',
    },
  })

  // 2. Content Queue
  const queueItem = await prisma.contentQueue.create({
    data: {
      platform: 'pinterest',
      title: 'Sample Pin',
      caption: 'This is a sample pin description #test',
      hashtags: '#test #sample',
      mediaPath: 'public/sample-pin.jpg',
      mediaType: 'image',
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour later
      status: 'draft',
    },
  })

  // 3. Analytics Snapshot
  await prisma.analyticsSnapshot.create({
    data: {
      platform: 'pinterest',
      postId: queueItem.id,
      views: 100,
      likes: 10,
      comments: 2,
      shares: 5,
      saves: 20,
      impressions: 150,
    },
  })

  // 4. Prompt Template
  await prisma.promptTemplate.create({
    data: {
      siteName: 'apartmenthomesteader',
      platform: 'pinterest',
      promptText: 'Create a pin about urban gardening',
      imageStyleNotes: 'Cozy, bright, modern',
    },
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
