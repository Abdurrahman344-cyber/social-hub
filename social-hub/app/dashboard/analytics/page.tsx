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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Performance Analytics</h1>
        <p className="text-gray-600 text-sm">Track views and engagement across all platforms over the last 30 days.</p>
      </div>

      <AnalyticsCharts snapshots={snapshots} />
    </div>
  );
}
