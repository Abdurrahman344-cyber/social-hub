"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListTodo, 
  CalendarDays, 
  PenSquare, 
  BarChart3, 
  Unplug, 
  Settings,
  Sparkles
} from 'lucide-react';

// export const dynamic = 'force-dynamic'; // Cannot be used in client component. The pages will be dynamic if they fetch.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Queue', href: '/dashboard/queue', icon: ListTodo },
    { name: 'Planner', href: '/dashboard/planner', icon: CalendarDays },
    { name: 'Compose', href: '/dashboard/compose', icon: PenSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'APIs', href: '/dashboard/apis', icon: Unplug },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen text-slate-100 selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 p-6 flex flex-col gap-8 shrink-0 z-20 shadow-2xl relative">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Social Hub</h2>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative group
                  ${isActive 
                    ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-indigo-400 to-fuchsia-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                )}
                
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Snippet */}
        <div className="mt-auto px-4 py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden">
            <span className="text-xs font-bold text-slate-300">AR</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white leading-none">Abdur</span>
            <span className="text-xs text-slate-400 mt-1">Free Plan</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative scroll-smooth">
        {/* Decorative background glow behind main content */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="w-full h-full relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
