import prisma from '@/lib/db';
import { PlannerCalendar } from './PlannerCalendar';
import { CalendarDays } from 'lucide-react';

export default async function PlannerPage() {
  const posts = await prisma.contentQueue.findMany({
    where: {
      scheduledTime: {
        not: null
      }
    },
    orderBy: {
      scheduledTime: 'asc'
    }
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="relative mb-8 p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-fuchsia-500 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-500 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarDays className="text-fuchsia-300" size={32} />
            Content Planner
          </h1>
          <p className="text-purple-100 max-w-2xl text-lg font-medium opacity-90">
            Visualize your content strategy. View and manage all your scheduled, drafted, and published posts across all platforms in one place.
          </p>
        </div>
      </div>

      <PlannerCalendar posts={posts} />
    </div>
  );
}
