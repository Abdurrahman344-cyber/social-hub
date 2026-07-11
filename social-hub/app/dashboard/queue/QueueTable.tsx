'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';

export function QueueTable({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPost, setEditingPost] = useState<any>(null);

  const handleEdit = (post: any) => {
    setEditingPost(post);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normally would call API here
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setPosts(posts.map(p => {
      if (p.id === editingPost.id) {
        return {
          ...p,
          caption: formData.get('caption'),
          platform: formData.get('platform'),
          scheduledTime: formData.get('scheduledTime'),
        };
      }
      return p;
    }));
    setEditingPost(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Controls */}
      <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Platforms</option>
            <option value="pinterest">Pinterest</option>
            <option value="meta">Meta</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          Showing {posts.length} posts
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Content</th>
                <th className="px-6 py-4">Schedule Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Your queue is empty. Go compose a post!
                  </td>
                </tr>
              )}
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.status === 'scheduled' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Scheduled
                      </span>
                    ) : post.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize font-semibold text-white">{post.platform}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      {post.mediaUrl && (
                        <div className="mb-2 text-xs text-indigo-400 font-mono truncate">
                          {post.mediaUrl}
                        </div>
                      )}
                      <p className="line-clamp-2 text-slate-300">{post.caption}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {post.scheduledTime 
                      ? format(new Date(post.scheduledTime), 'MMM d, yyyy h:mm a')
                      : 'Not scheduled'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(post)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">Edit Post</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Platform</label>
                <select 
                  name="platform" 
                  defaultValue={editingPost.platform}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="pinterest">Pinterest</option>
                  <option value="meta">Meta</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Caption</label>
                <textarea 
                  name="caption" 
                  defaultValue={editingPost.caption}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Schedule Date</label>
                <input 
                  type="datetime-local" 
                  name="scheduledTime"
                  defaultValue={editingPost.scheduledTime ? new Date(editingPost.scheduledTime).toISOString().slice(0,16) : ''}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:dark]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setEditingPost(null)}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
