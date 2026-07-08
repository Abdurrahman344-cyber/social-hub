'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Edit2, Trash2, Wand2, X, Image as ImageIcon } from 'lucide-react';
import { approvePost, deletePost, savePostEdits, triggerAIGeneration } from '@/app/actions/queue';

export function QueueTable({ initialPosts }: { initialPosts: any[] }) {
  const [filter, setFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const posts = initialPosts.filter(p => filter === 'ALL' ? true : p.platform === filter || p.status === filter);

  const handleApprove = async (id: string) => {
    await approvePost(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this post?')) {
      await deletePost(id);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await savePostEdits(id, formData.get('caption') as string, formData.get('mediaPath') as string);
    setEditingId(null);
  };

  const handleAIGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const btn = document.getElementById('ai-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Generating...';

    const res = await triggerAIGeneration(
      formData.get('topic') as string,
      formData.get('platform') as string,
      formData.get('siteContext') as string
    );

    if (res.success) setShowAIModal(false);
    else alert('Error: ' + res.error);
    
    btn.disabled = false;
    btn.innerText = 'Generate Post';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* TOOLBAR */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <select 
          className="border border-gray-300 rounded-md p-2 text-sm bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Posts</option>
          <option value="draft">Drafts Only</option>
          <option value="queued">Queued Only</option>
          <option value="pinterest">Pinterest</option>
          <option value="meta">Meta (FB/IG)</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </select>

        <button 
          onClick={() => setShowAIModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Wand2 size={16} /> Generate with AI
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Media</th>
              <th className="px-6 py-4">Platform</th>
              <th className="px-6 py-4">Caption / Content</th>
              <th className="px-6 py-4">Status & Time</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No posts found.</td></tr>
            )}
            
            {posts.map(post => (
              <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  {post.mediaPath ? (
                    <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                      {/* Very basic preview (assuming image for MVP) */}
                      {post.mediaPath.endsWith('.mp4') || post.mediaPath.endsWith('.mov') ? (
                        <div className="text-xs text-gray-400">Video</div>
                      ) : (
                        <img src={`/api/media/${post.mediaPath.replace('public/generated/', '')}`} className="object-cover w-full h-full" alt="Media" />
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {post.platform}
                  </span>
                </td>
                
                {/* CAPTION COLUMN */}
                <td className="px-6 py-4 max-w-xs">
                  {editingId === post.id ? (
                    <form id={`edit-form-${post.id}`} onSubmit={(e) => handleSaveEdit(e, post.id)}>
                      <textarea 
                        name="caption"
                        defaultValue={post.caption || ''} 
                        className="w-full border rounded p-2 text-xs mb-2 min-h-[80px]"
                      />
                      <input 
                        name="mediaPath"
                        defaultValue={post.mediaPath || ''} 
                        className="w-full border rounded p-2 text-xs"
                        placeholder="public/uploads/..."
                      />
                    </form>
                  ) : (
                    <div className="line-clamp-3 text-gray-800">
                      <strong className="block text-xs text-gray-500 mb-1">{post.title}</strong>
                      {post.caption}
                      <br/><span className="text-blue-500 text-xs mt-1 block">{post.hashtags}</span>
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${
                      post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      post.status === 'queued' ? 'bg-blue-100 text-blue-800' :
                      post.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {post.scheduledTime ? format(new Date(post.scheduledTime), 'MMM d, h:mm a') : 'Unscheduled'}
                    </span>
                    {post.errorMessage && <span className="text-xs text-red-500 line-clamp-1" title={post.errorMessage}>{post.errorMessage}</span>}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  {editingId === post.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><X size={16}/></button>
                      <button type="submit" form={`edit-form-${post.id}`} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={16}/></button>
                    </div>
                  ) : (
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => setEditingId(post.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={16} />
                      </button>
                      {post.status === 'draft' && (
                        <button onClick={() => handleApprove(post.id)} className="ml-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-100 transition">
                          Approve
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Wand2 size={18} className="text-indigo-600"/> Generate Post</h3>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleAIGenerate} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Topic or Prompt</label>
                <input name="topic" required placeholder="e.g. 5 tips for urban gardening" className="mt-1 w-full p-2 border rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Platform</label>
                  <select name="platform" className="mt-1 w-full p-2 border rounded-md bg-white">
                    <option value="pinterest">Pinterest</option>
                    <option value="meta">Instagram/Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Site Profile</label>
                  <select name="siteContext" className="mt-1 w-full p-2 border rounded-md bg-white">
                    <option value="apartmenthomesteader">Apartment Homesteader</option>
                    <option value="iqcognify">IQ Cognify</option>
                    <option value="crispyairfryer">Crispy Air Fryer</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAIModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" id="ai-btn" className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium">Generate Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
