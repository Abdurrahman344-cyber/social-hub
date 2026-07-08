'use client';

import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { reschedulePost } from '@/app/actions/queue';

export function PlannerCalendar({ posts: initialPosts }: { posts: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [optimisticPosts, setOptimisticPosts] = useState(initialPosts);
  const [isPending, setIsPending] = useState(false);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = 'd';
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'draft': return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: <Clock size={12}/> };
      case 'queued': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <Send size={12}/> };
      case 'posted': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 size={12}/> };
      case 'failed': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: <AlertCircle size={12}/> };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: null };
    }
  };

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.dataTransfer.setData('postId', postId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('postId');
    if (!postId) return;
    
    // Optimistic UI update
    const originalPosts = [...optimisticPosts];
    setOptimisticPosts(prev => prev.map(p => {
      if (p.id === postId) {
        // Keep time but update date
        const originalTime = new Date(p.scheduledTime);
        const newTime = new Date(targetDate);
        newTime.setHours(originalTime.getHours());
        newTime.setMinutes(originalTime.getMinutes());
        newTime.setSeconds(originalTime.getSeconds());
        return { ...p, scheduledTime: newTime };
      }
      return p;
    }));
    
    setIsPending(true);
    const result = await reschedulePost(postId, targetDate.toISOString());
    setIsPending(false);
    
    if (!result.success) {
      // Revert if failed
      setOptimisticPosts(originalPosts);
      alert('Failed to reschedule post: ' + result.error);
    }
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Find posts for this day using optimistic state
      const dayPosts = optimisticPosts.filter(post => post.scheduledTime && isSameDay(new Date(post.scheduledTime), cloneDay));

      days.push(
        <div 
          key={day.toString()} 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, cloneDay)}
          className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors ${
            !isSameMonth(day, monthStart) 
              ? 'bg-gray-50/50 text-gray-400' 
              : isSameDay(day, new Date()) 
                ? 'bg-blue-50/30' 
                : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
              isSameDay(day, new Date()) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'
            }`}>
              {formattedDate}
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] no-scrollbar">
            {dayPosts.map(post => {
              const cfg = getStatusConfig(post.status);
              return (
                <div
                  key={post.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, post.id)}
                  className={`group flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md border cursor-grab active:cursor-grabbing ${cfg.bg} ${cfg.border} ${cfg.text} hover:shadow-sm transition-all truncate`}
                  title={post.title || post.caption || 'Untitled Post'}
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">{cfg.icon}</span>
                  <span className="truncate flex-1">{post.title || post.caption || 'Untitled Post'}</span>
                  <Link href="/dashboard/queue" className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/5 rounded">
                     <span className="sr-only">Edit</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          {isPending && <Loader2 size={16} className="text-blue-600 animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl font-medium text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-col">
        <div className="grid grid-cols-7 bg-gray-50/80 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="flex flex-col border-l border-gray-100">
          {rows}
        </div>
      </div>
    </div>
  );
}
