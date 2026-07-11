'use client';

import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export function PlannerCalendar({ posts }: { posts: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = addDays(startOfWeek(monthEnd), 6);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentDate(addDays(monthEnd, 1));
  const prevMonth = () => setCurrentDate(addDays(monthStart, -1));

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/5 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {format(currentDate, dateFormat)}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 bg-slate-900/80 border-b border-white/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="p-4 text-center text-sm font-bold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 bg-slate-800/20">
        {days.map((day, i) => {
          const dayPosts = posts.filter(p => p.scheduledTime && isSameDay(new Date(p.scheduledTime), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={i} 
              className={`min-h-[140px] p-2 border-b border-r border-white/5 transition-colors
                ${!isCurrentMonth ? 'bg-slate-900/30 opacity-50' : 'hover:bg-white/5'}
                ${i % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                  ${isToday 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                
                {dayPosts.length > 0 && (
                  <span className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700">
                    {dayPosts.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                {dayPosts.slice(0, 3).map((post) => (
                  <div 
                    key={post.id} 
                    className="text-xs px-2 py-1.5 rounded-lg truncate font-medium cursor-pointer flex items-center gap-1.5 border
                      bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {post.status === 'published' 
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      : <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    }
                    <span className="truncate">{post.platform}: {post.caption}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-xs text-center text-slate-500 font-medium mt-1">
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
