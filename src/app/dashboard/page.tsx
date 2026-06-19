'use strict';
'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Users, 
  Megaphone, 
  Mail, 
  Percent, 
  Flame, 
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function DashboardHome() {
  const { metrics, fetchMetrics, activeBusiness, loading } = useStore();

  useEffect(() => {
    if (activeBusiness) {
      fetchMetrics();
    }
  }, [activeBusiness, fetchMetrics]);

  if (loading.metrics || !metrics) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Leads',
      value: metrics.leads.total,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      name: 'Total Campaigns',
      value: metrics.campaigns.total,
      icon: Megaphone,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      name: 'Total Messages',
      value: metrics.messages.total,
      icon: Mail,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      name: 'Message Open Rate',
      value: `${metrics.messages.open_rate}%`,
      icon: Percent,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your customer outreach metrics and workspace pipeline in real-time.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.name}</p>
                <h3 className="text-2xl font-extrabold text-white mt-1.5">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main analytics panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CRM Funnel Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>CRM Lead Pipeline Funnel</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Conversion distribution</span>
          </div>

          <div className="space-y-4">
            {Object.entries(metrics.leads.by_stage).map(([stage, count]) => {
              const maxLeads = Math.max(...Object.values(metrics.leads.by_stage), 1);
              const percentage = Math.round((count / maxLeads) * 100);
              
              // Colors for pipeline stages
              let barColor = 'bg-blue-600';
              if (stage === 'Qualified') barColor = 'bg-indigo-600';
              if (stage === 'Proposal') barColor = 'bg-purple-600';
              if (stage === 'Won') barColor = 'bg-emerald-600';
              if (stage === 'Lost') barColor = 'bg-rose-600';

              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{stage}</span>
                    <span className="text-slate-400">{count} leads ({Math.round((count / (metrics.leads.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messaging Logs & Delivery stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Delivery Breakdown</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Delivered / Sent</span>
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {metrics.messages.delivered} / {metrics.messages.sent}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Opened</span>
                </div>
                <span className="text-sm font-bold text-slate-200">{metrics.messages.opened}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Failed</span>
                </div>
                <span className="text-sm font-bold text-red-400">{metrics.messages.failed}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Delivery Rate:</span>
            <span className="text-slate-200 font-bold text-sm">
              {metrics.messages.delivery_rate}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section: Recent activity list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-white text-sm mb-4">Lead Growth Trend (Last 7 Days)</h3>
        <div className="flex items-end justify-between gap-2 h-32 pt-4">
          {metrics.lead_growth.map((day) => {
            const maxVal = Math.max(...metrics.lead_growth.map(d => d.count), 1);
            const pct = (day.count / maxVal) * 80 + 10; // offset so at least small bar renders
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-[10px] font-bold text-slate-400">{day.count}</div>
                <div 
                  className="w-full bg-blue-600/30 border-t-2 border-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${pct}%` }}
                />
                <div className="text-[10px] text-slate-500 font-semibold">{day.date}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
