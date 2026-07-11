import prisma from '@/lib/db';
import Link from 'next/link';
import { 
  BarChart3, 
  CalendarDays, 
  ListTodo, 
  Unplug, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

export default async function DashboardPage() {
  // Fetch real counts with graceful fallback
  let queueCount = 0;
  let platformsCount = 0;
  let analyticsCount = 0;
  
  try {
    queueCount = await prisma.contentQueue.count();
    platformsCount = await prisma.platformCredential.count();
    analyticsCount = await prisma.analyticsSnapshot.count();
  } catch (error) {
    console.error("Prisma count error:", error);
  }

  const metrics = [
    { 
      label: 'Scheduled Posts', 
      value: queueCount, 
      icon: CalendarDays, 
      color: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-cyan-500/20'
    },
    { 
      label: 'Active Connections', 
      value: platformsCount, 
      icon: Unplug, 
      color: 'from-fuchsia-500 to-purple-500',
      shadow: 'shadow-fuchsia-500/20'
    },
    { 
      label: 'Analytics Snapshots', 
      value: analyticsCount, 
      icon: BarChart3, 
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-orange-500/20'
    },
    { 
      label: 'Engagement Rate', 
      value: '4.8%', 
      icon: TrendingUp, 
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20'
    },
  ];

  const quickActions = [
    {
      title: 'Compose New Post',
      description: 'Create and schedule content across all your platforms simultaneously.',
      href: '/dashboard/compose',
      icon: Sparkles,
      gradient: 'from-indigo-600 to-blue-600'
    },
    {
      title: 'Review Queue',
      description: 'Manage your upcoming posts, drafts, and edit scheduled times.',
      href: '/dashboard/queue',
      icon: ListTodo,
      gradient: 'from-purple-600 to-fuchsia-600'
    },
    {
      title: 'View Analytics',
      description: 'Track your growth and see which content performs best.',
      href: '/dashboard/analytics',
      icon: Activity,
      gradient: 'from-slate-700 to-slate-800'
    }
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
          Welcome back, Abdur
        </h1>
        <p className="text-slate-400 text-lg">Here's what's happening with your accounts today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div 
              key={i} 
              className="glass-card rounded-2xl p-6 relative overflow-hidden group"
            >
              {/* Decorative background glow */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${metric.color} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg ${metric.shadow}`}>
                  <Icon className="text-white w-6 h-6" />
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-slate-400 font-medium">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link 
                href={action.href} 
                key={i}
                className="group relative rounded-2xl p-1 overflow-hidden"
              >
                {/* Animated Border Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Card Content */}
                <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 flex flex-col items-start border border-white/5 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="text-white w-5 h-5" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-1">{action.description}</p>
                  
                  <div className="flex items-center text-sm font-semibold text-white/80 group-hover:text-white mt-auto">
                    Get Started 
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
