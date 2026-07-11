'use client';

import { useState } from 'react';

export function ApiCard({ platform, credential, token }: { platform: any, credential?: any, token?: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [key, setKey] = useState(credential?.key || '');
  const [secret, setSecret] = useState(credential?.secret || '');

  const isConnected = !!credential || !!token;

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col group relative">
      {/* Decorative gradient glow */}
      {isConnected && <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[26px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>}
      
      <div className="relative bg-slate-900/50 backdrop-blur-xl h-full flex flex-col z-10 rounded-[22px] border border-white/5">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            {platform.name}
          </h2>
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
            isConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-4">
          <p className="text-sm text-slate-400">
            {platform.requiresRedirect 
              ? 'Uses OAuth for secure connection. Requires redirect to platform.' 
              : 'Requires API keys generated from the developer console.'}
          </p>

          <a href={platform.helpLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            How to get credentials?
          </a>

          {isEditing ? (
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">API Key / Client ID</label>
                <input 
                  type="text" 
                  value={key} 
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter key..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">API Secret / Client Secret</label>
                <input 
                  type="password" 
                  value={secret} 
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter secret..."
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" className="flex-1 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                  Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-auto pt-6 flex gap-2">
              {platform.requiresRedirect ? (
                <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                  Connect via OAuth
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all">
                  {isConnected ? 'Update Keys' : 'Add API Keys'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
