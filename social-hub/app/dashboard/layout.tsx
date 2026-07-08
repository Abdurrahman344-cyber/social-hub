import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
        <h2 className="text-xl font-bold text-blue-600 mb-6">Social Hub</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-md font-medium">Dashboard</Link>
          <Link href="/dashboard/queue" className="p-2 hover:bg-gray-100 rounded-md font-medium">Queue</Link>
          <Link href="/dashboard/compose" className="p-2 hover:bg-gray-100 rounded-md font-medium">Compose</Link>
          <Link href="/dashboard/analytics" className="p-2 hover:bg-gray-100 rounded-md font-medium">Analytics</Link>
          <Link href="/dashboard/settings" className="p-2 hover:bg-gray-100 rounded-md font-medium">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
