import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 flex items-center gap-3">
          <Settings className="text-slate-400" size={36} />
          Settings
        </h1>
        <p className="text-slate-400 text-lg">Manage your account preferences and global configuration.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="Abdur" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="user@example.com" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <hr className="border-white/10" />
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500" defaultChecked />
                <span className="text-slate-300 group-hover:text-white transition-colors">Enable email notifications for failed posts</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500" />
                <span className="text-slate-300 group-hover:text-white transition-colors">Require manual approval for AI generated content</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
