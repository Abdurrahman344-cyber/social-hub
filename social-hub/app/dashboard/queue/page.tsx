import prisma from '@/lib/db';
import { QueueTable } from './QueueTable';
import { ListTodo } from 'lucide-react';

export default async function QueuePage() {
  let posts: any[] = [];
  try {
    posts = await prisma.contentQueue.findMany({
      orderBy: { scheduledTime: 'asc' },
    });
  } catch (error) {
    console.error("Prisma error:", error);
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 flex items-center gap-3">
          <ListTodo className="text-fuchsia-400" size={36} />
          Content Queue
        </h1>
        <p className="text-slate-400 text-lg">Review, edit, and approve upcoming posts before they go live.</p>
      </div>

      <QueueTable initialPosts={posts} />
    </div>
  );
}
