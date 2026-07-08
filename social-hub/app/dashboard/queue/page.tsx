import prisma from '@/lib/db';
import { QueueTable } from './QueueTable';

export default async function QueuePage() {
  const posts = await prisma.contentQueue.findMany({
    orderBy: { scheduledTime: 'asc' },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Content Queue</h1>
          <p className="text-gray-600 text-sm">Review, edit, and approve upcoming posts.</p>
        </div>
      </div>

      <QueueTable initialPosts={posts} />
    </div>
  );
}
