import prisma from '@/lib/db';
import { AnalyticsCharts } from './AnalyticsCharts';

export default async function AnalyticsPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let snapshots: any[] = [];
  try {
    snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        date: { gte: thirtyDaysAgo }
      },
      include: {
        post: {
          select: { title: true, caption: true, platform: true }
        }
      },
      orderBy: { date: 'asc' }
    });
  } catch (error) {
    console.error("Prisma error:", error);
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Performance Analytics</h1>
        <p className="text-slate-400 text-lg">Track views and engagement across all platforms over the last 30 days.</p>
      </div>

      <AnalyticsCharts snapshots={snapshots} />
    </div>
  );
}
