'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createManualPost } from '@/app/actions/compose';
import { PenTool, Calendar, Link as LinkIcon, Send } from 'lucide-react';

export default function ComposePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await createManualPost(formData);
      router.push('/dashboard/queue');
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Compose Post</h1>
        <p className="text-gray-600 text-sm">Manually create and schedule a post for any platform.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
               Platform
            </label>
            <select name="platform" className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 focus:bg-white transition" required>
              <option value="pinterest">Pinterest</option>
              <option value="meta">Meta (Instagram/Facebook)</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <PenTool size={16} className="text-gray-400" /> Caption
            </label>
            <textarea 
              name="caption" 
              required
              rows={5}
              placeholder="Write your caption here..."
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} className="text-gray-400" /> Media Path
            </label>
            <input 
              name="mediaPath" 
              type="text"
              placeholder="e.g. public/uploads/video.mp4"
              className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1.5">For local development, type the path to a file in your project directory.</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="text-gray-400" /> Schedule (Optional)
            </label>
            <input 
              name="scheduledTime" 
              type="datetime-local"
              className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1.5">Leave blank to save as a Draft. Pick a time to automatically Queue it.</p>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send size={18} /> {isSubmitting ? 'Saving...' : 'Save Post'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
