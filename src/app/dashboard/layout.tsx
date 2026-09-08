'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Building, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Link2,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [initializing, setInitializing] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { 
    token, 
    user, 
    businesses, 
    activeBusiness, 
    setActiveBusiness, 
    logout, 
    fetchProfile, 
    fetchBusinesses 
  } = useStore();

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!storedToken && !token) {
        if (isMounted) setInitializing(false);
        router.push('/');
        return;
      }

      try {
        let currentUser = user;
        if (!currentUser) {
          await fetchProfile();
          currentUser = useStore.getState().user;
        }

        if (!currentUser || !useStore.getState().token) {
          logout();
          if (isMounted) setInitializing(false);
          router.push('/');
          return;
        }

        let currentBusinesses = useStore.getState().businesses;
        if (currentBusinesses.length === 0) {
          await fetchBusinesses();
          currentBusinesses = useStore.getState().businesses;
        }

        if (currentBusinesses.length === 0) {
          if (isMounted) setInitializing(false);
          router.push('/onboard');
          return;
        }
      } catch (err) {
        logout();
        if (isMounted) setInitializing(false);
        router.push('/');
        return;
      }

      if (isMounted) {
        setInitializing(false);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [token, fetchProfile, fetchBusinesses, logout, router]);

  // Check if onboarding is needed
  useEffect(() => {
    if (user && !user.first_name) {
      router.push('/onboard');
    }
  }, [user, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (initializing || !token || !user || !activeBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
    { name: 'CRM Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Link2 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-x-hidden">
      
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-900/95 lg:bg-slate-900/60 backdrop-blur flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                OmniCampaign
              </h2>
              <p className="text-xs text-slate-500 mt-1">SaaS Workspace</p>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tenant Switcher */}
          <div className="p-4 border-b border-slate-800">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
              Active Workspace
            </label>
            <div className="relative group">
              <select
                value={activeBusiness.id}
                onChange={(e) => {
                  const selected = businesses.find(b => b.id === e.target.value);
                  if (selected) setActiveBusiness(selected);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pr-8 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Sign Out Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">
                {user.first_name} {user.last_name}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-800 hover:bg-slate-800/60 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 overflow-hidden">
              <Building className="w-5 h-5 text-blue-500 shrink-0" />
              <h3 className="font-semibold text-white text-sm truncate max-w-[160px] sm:max-w-xs">
                {activeBusiness.name}
              </h3>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <span className="hidden sm:inline">Timezone: </span>
            <span className="text-slate-300 font-semibold">{activeBusiness.timezone || 'UTC'}</span>
          </div>
        </header>
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

