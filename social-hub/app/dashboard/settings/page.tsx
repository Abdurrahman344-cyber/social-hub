export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">General Settings</h1>
        <p className="text-gray-600">Configure your personal profile and application preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <div className="grid gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <input type="text" className="border border-gray-300 rounded-md p-2 max-w-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter your name" defaultValue="Abdur Rahman" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" className="border border-gray-300 rounded-md p-2 max-w-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter your email" />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="email-notif" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" defaultChecked />
              <label htmlFor="email-notif" className="text-sm text-gray-700">Receive email notifications for failed posts</label>
            </div>
          </div>
          
          <div className="pt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
