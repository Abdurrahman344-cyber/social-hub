'use client';

import { format } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export function AnalyticsCharts({ snapshots }: { snapshots: any[] }) {
  // Aggregate data by date
  const dateMap = new Map<string, any>();
  
  snapshots.forEach(s => {
    const dateStr = format(new Date(s.date), 'MMM dd');
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { 
        name: dateStr, 
        pinterestViews: 0, metaViews: 0, tiktokViews: 0, youtubeViews: 0,
        engagement: 0 
      });
    }
    const current = dateMap.get(dateStr);
    
    const views = s.views || s.impressions || 0;
    const eng = (s.likes || 0) + (s.comments || 0) + (s.shares || 0) + (s.saves || 0);

    if (s.platform === 'pinterest') current.pinterestViews += views;
    else if (s.platform === 'meta') current.metaViews += views;
    else if (s.platform === 'tiktok') current.tiktokViews += views;
    else if (s.platform === 'youtube') current.youtubeViews += views;

    current.engagement += eng;
  });

  const chartData = Array.from(dateMap.values());

  // Top posts table
  const topPosts = [...snapshots].sort((a, b) => {
    const aTotal = (a.views || a.impressions || 0) + (a.likes || 0) + (a.comments || 0);
    const bTotal = (b.views || b.impressions || 0) + (b.likes || 0) + (b.comments || 0);
    return bTotal - aTotal;
  }).slice(0, 10);

  // Custom Tooltip style for Dark Theme
  const customTooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    color: '#f8fafc',
    padding: '12px',
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Views Trend */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-6 text-white">Views by Platform</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="pinterestViews" name="Pinterest" stroke="#e60023" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="metaViews" name="Meta" stroke="#1877f2" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="tiktokViews" name="TikTok" stroke="#25f4ee" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="youtubeViews" name="YouTube" stroke="#ff0000" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-6 text-white">Total Engagement</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="engagement" name="Engagement" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP POSTS TABLE */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white">Top Performing Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Caption</th>
                <th className="px-6 py-4 text-right">Views</th>
                <th className="px-6 py-4 text-right">Likes</th>
                <th className="px-6 py-4 text-right">Comments</th>
                <th className="px-6 py-4 text-right">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topPosts.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No analytics data yet.</td></tr>
              )}
              {topPosts.map((s, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white capitalize border border-white/10">
                      {s.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="line-clamp-2 text-slate-300 max-w-md">{s.post?.caption || 'No caption'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-right text-indigo-300 font-semibold">{s.views || s.impressions || 0}</td>
                  <td className="px-6 py-4 font-mono text-right text-fuchsia-300">{s.likes || 0}</td>
                  <td className="px-6 py-4 font-mono text-right text-cyan-300">{s.comments || 0}</td>
                  <td className="px-6 py-4 font-mono text-right text-amber-300">{(s.shares || 0) + (s.saves || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
