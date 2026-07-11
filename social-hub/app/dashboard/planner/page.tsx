import prisma from '@/lib/db';
import { PlannerCalendar } from './PlannerCalendar';
import { CalendarDays } from 'lucide-react';

export default async function PlannerPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.contentQueue.findMany({
      where: {
        scheduledTime: {
          not: null
        }
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });
  } catch (error) {
    console.error("Prisma error:", error);
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="relative mb-10 p-8 rounded-3xl overflow-hidden glass-card border-none">
        {/* Abstract animated background blobs inside the card */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight flex items-center gap-4">
            <CalendarDays className="text-fuchsia-400" size={40} />
            Content Planner
          </h1>
          <p className="text-slate-300 max-w-2xl text-lg font-medium">
            Visualize your entire content strategy at a glance.
          </p>
        </div>
      </div>

      <PlannerCalendar posts={posts} />
    </div>
  );
}
