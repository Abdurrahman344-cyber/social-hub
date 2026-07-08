'use client';

import { useState } from 'react';
import { savePlatformCredential } from '@/app/actions/settings';
import { formatDistanceToNow } from 'date-fns';
import { Settings, ExternalLink, Key, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ApiCard({ platform, credential, token }: { platform: any, credential: any, token: any }) {
  const [isEditing, setIsEditing] = useState(!credential);

  let statusText = 'Not configured';
  let statusColor = 'text-gray-500';
  let statusBg = 'bg-gray-100';

  if (credential) {
    if (!token && platform.requiresRedirect) {
      statusText = 'Configured, not connected';
      statusColor = 'text-amber-500';
      statusBg = 'bg-amber-500/10 border border-amber-500/20';
    } else if (token) {
      const isExpired = token.expiresAt && new Date(token.expiresAt) < new Date();
      if (isExpired) {
        statusText = 'Token expired, reconnect';
        statusColor = 'text-rose-500';
        statusBg = 'bg-rose-500/10 border border-rose-500/20';
      } else {
        statusText = token.accountName ? `Connected as ${token.accountName}` : 'Connected (Active)';
        statusColor = 'text-emerald-500';
        statusBg = 'bg-emerald-500/10 border border-emerald-500/20';
      }
    } else if (!platform.requiresRedirect) {
       statusText = 'Configured (API Key Ready)';
       statusColor = 'text-emerald-500';
       statusBg = 'bg-emerald-500/10 border border-emerald-500/20';
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('platform', platform.id);
    await savePlatformCredential(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
            <Key size={14} className="opacity-80" />
          </div>
          {platform.name}
        </h2>
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 ${statusBg} ${statusColor} transition-colors`}>
          {statusText.includes('Connected') || statusText.includes('Ready') ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {statusText}
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4">
        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">App ID / Client ID</label>
              <input 
                name="clientId" 
                defaultValue={credential?.clientId || ''}
                className="mt-1 w-full p-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">App Secret / Client Secret / API Key</label>
              <input 
                name="clientSecret" 
                type="password"
                defaultValue={credential?.clientSecret || ''}
                className="mt-1 w-full p-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            {platform.requiresRedirect && (
              <div>
                <label className="text-sm font-medium text-gray-700">Redirect URI (Optional)</label>
                <input 
                  name="redirectUri" 
                  defaultValue={credential?.redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/${platform.id}/callback`}
                  className="mt-1 w-full p-2 text-sm border border-gray-300 bg-gray-50 rounded-md outline-none text-gray-500" 
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <a href={platform.helpLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 flex items-center gap-1.5 hover:text-blue-700 transition-colors bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50 hover:bg-blue-100/50">
                Get credentials <ExternalLink size={14} />
              </a>
              <div className="flex gap-3">
                {credential && (
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                )}
                <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Save Keys</button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Client ID</span>
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                  {credential?.clientId.substring(0, 8)}...
                </span>
              </div>
              {token && token.expiresAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Token Expires</span>
                  <span className={`font-medium ${new Date(token.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                    {new Date(token.expiresAt) < new Date() ? 'Expired' : formatDistanceToNow(new Date(token.expiresAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <Settings size={16} className="text-gray-500" /> Edit Config
              </button>
              
              {platform.requiresRedirect && (
                <a 
                  href={`/api/oauth/${platform.id}/start`}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <Link2 size={16} /> Connect Account
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
