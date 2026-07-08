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

  return (
    <div className="flex flex-col gap-8">
      
      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Views Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Views by Platform</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="pinterestViews" name="Pinterest" stroke="#e60023" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="metaViews" name="Meta (IG/FB)" stroke="#1877f2" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="tiktokViews" name="TikTok" stroke="#000000" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="youtubeViews" name="YouTube" stroke="#ff0000" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Total Engagement (Likes/Comments/Shares)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="engagement" name="Engagement" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP POSTS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold">Top Performing Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Caption</th>
                <th className="px-6 py-4">Views/Impressions</th>
                <th className="px-6 py-4">Likes</th>
                <th className="px-6 py-4">Comments</th>
                <th className="px-6 py-4">Shares/Saves</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No analytics data yet.</td></tr>
              )}
              {topPosts.map(s => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {s.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="line-clamp-2 text-gray-800">{s.post.caption}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">{s.views || s.impressions || 0}</td>
                  <td className="px-6 py-4 font-mono">{s.likes || 0}</td>
                  <td className="px-6 py-4 font-mono">{s.comments || 0}</td>
                  <td className="px-6 py-4 font-mono">{(s.shares || 0) + (s.saves || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
