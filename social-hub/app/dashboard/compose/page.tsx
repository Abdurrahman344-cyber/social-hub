import { PenSquare } from 'lucide-react';

export default function ComposePage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 flex items-center gap-3">
          <PenSquare className="text-indigo-400" size={36} />
          Compose Content
        </h1>
        <p className="text-slate-400 text-lg">Create, edit, and preview your posts across all platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Create Post</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Select Platforms</label>
                <select name="platform" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" required>
                  <option value="">Choose platform...</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="meta">Meta (Instagram / Facebook)</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Caption</label>
                <textarea 
                  name="caption" 
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
                  placeholder="Write your amazing caption here..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Media URL (Optional)</label>
                <input 
                  type="url" 
                  name="mediaUrl" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Schedule Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  name="scheduledTime" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]" 
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                  Schedule Post
                </button>
                <button type="button" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all">
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-4">Live Preview</h2>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-h-[300px] flex items-center justify-center text-slate-500">
              <p>Select a platform to see preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
