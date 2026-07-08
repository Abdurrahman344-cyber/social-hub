'use client';

import { useState } from 'react';
import { savePlatformCredential } from '@/app/actions/settings';
import { formatDistanceToNow } from 'date-fns';
import { Settings, ExternalLink, Key, Link2, AlertCircle } from 'lucide-react';

export function SettingsCard({ platform, credential, token }: { platform: any, credential: any, token: any }) {
  const [isEditing, setIsEditing] = useState(!credential);

  let statusText = 'Not configured';
  let statusColor = 'text-gray-500';
  let statusBg = 'bg-gray-100';

  if (credential) {
    if (!token && platform.requiresRedirect) {
      statusText = 'Configured, not connected';
      statusColor = 'text-yellow-600';
      statusBg = 'bg-yellow-50';
    } else if (token) {
      const isExpired = token.expiresAt && new Date(token.expiresAt) < new Date();
      if (isExpired) {
        statusText = 'Token expired, reconnect';
        statusColor = 'text-red-600';
        statusBg = 'bg-red-50';
      } else {
        statusText = token.accountName ? `Connected as ${token.accountName}` : 'Connected (Active)';
        statusColor = 'text-green-600';
        statusBg = 'bg-green-50';
      }
    } else if (!platform.requiresRedirect) {
       statusText = 'Configured (API Key Ready)';
       statusColor = 'text-green-600';
       statusBg = 'bg-green-50';
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {platform.name}
        </h2>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBg} ${statusColor}`}>
          {statusText}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
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
            
            <div className="flex items-center justify-between mt-2">
              <a href={platform.helpLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                Get credentials <ExternalLink size={12} />
              </a>
              <div className="flex gap-2">
                {credential && (
                  <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                )}
                <button type="submit" className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Save</button>
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

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Settings size={16} /> Edit
              </button>
              
              {platform.requiresRedirect && (
                <a 
                  href={`/api/oauth/${platform.id}/start`}
                  className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
