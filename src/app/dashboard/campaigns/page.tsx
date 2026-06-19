'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Plus, 
  Megaphone, 
  FileText, 
  Play, 
  Layers, 
  Variable, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function CampaignsPage() {
  const { 
    templates, 
    campaigns, 
    fetchTemplates, 
    fetchCampaigns, 
    createTemplate, 
    createCampaign, 
    triggerCampaign, 
    activeBusiness, 
    loading 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Form states - Template
  const [tName, setTName] = useState('');
  const [tType, setTType] = useState('Email');
  const [tSubject, setTSubject] = useState('');
  const [tBody, setTBody] = useState('');

  // Form states - Campaign
  const [cName, setCName] = useState('');
  const [cTemplate, setCTemplate] = useState('');
  const [cChannel, setCChannel] = useState('Email');
  const [cSchedule, setCSchedule] = useState('Immediate');

  useEffect(() => {
    if (activeBusiness) {
      fetchTemplates();
      fetchCampaigns();
    }
  }, [activeBusiness, fetchTemplates, fetchCampaigns]);

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tBody) return;

    try {
      await createTemplate({
        name: tName,
        type: tType,
        subject: tType === 'Email' ? tSubject : null,
        body: tBody,
      });
      setShowTemplateModal(false);
      setTName('');
      setTSubject('');
      setTBody('');
    } catch (err) {}
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cTemplate) return;

    try {
      await createCampaign({
        name: cName,
        template: parseInt(cTemplate),
        channel: cChannel,
        status: 'Draft',
        schedule_type: cSchedule,
      });
      setShowCampaignModal(false);
      setCName('');
      setCTemplate('');
    } catch (err) {}
  };

  const handleTriggerCampaign = async (id: number) => {
    try {
      await triggerCampaign(id);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campaign Automation Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Build dynamic templates, define schedule parameters, and run bulk omnichannel operations.
          </p>
        </div>

        <div className="flex gap-3">
          {activeTab === 'templates' ? (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (templates.length === 0) {
                  alert('Please create a message template first!');
                  return;
                }
                setShowCampaignModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'campaigns' 
              ? 'border-blue-500 text-blue-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Campaigns
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'templates' 
              ? 'border-blue-500 text-blue-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Message Templates
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'campaigns' ? (
        /* CAMPAIGNS LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div key={camp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                    camp.status === 'Active' 
                      ? 'bg-blue-600/10 border-blue-500/25 text-blue-400' 
                      : camp.status === 'Completed'
                      ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}>
                    {camp.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{camp.channel}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{camp.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Template: {camp.template_name}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  Schedule: {camp.schedule_type}
                </span>

                {camp.status !== 'Completed' && (
                  <button
                    onClick={() => handleTriggerCampaign(camp.id)}
                    disabled={loading.trigger}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Now</span>
                  </button>
                )}

                {camp.status === 'Completed' && (
                  <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Executed</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500 font-semibold">
              No campaigns scheduled. Create a new campaign to begin.
            </div>
          )}
        </div>
      ) : (
        /* TEMPLATES LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">{tpl.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850">
                    {tpl.type}
                  </span>
                </div>

                {tpl.subject && (
                  <div className="text-[11px] font-bold text-slate-400 mb-2 truncate">
                    Subject: <span className="text-slate-300 font-semibold">{tpl.subject}</span>
                  </div>
                )}

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-xs text-slate-400 font-mono whitespace-pre-wrap line-clamp-4">
                  {tpl.body}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold">
                <Variable className="w-3.5 h-3.5 text-blue-500" />
                <span>Supports dynamic user and company placeholders.</span>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="md:col-span-2 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500 font-semibold">
              No message templates designed yet. Create one to support campaigns.
            </div>
          )}
        </div>
      )}

      {/* POPUP MODAL: Create Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Create Message Template</h3>
            
            <form onSubmit={handleTemplateSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label htmlFor="tpl_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tpl_name"
                    type="text"
                    required
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="Welcome Outreach Email"
                  />
                </div>
                <div>
                  <label htmlFor="tpl_type" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Channel Type
                  </label>
                  <select
                    id="tpl_type"
                    value={tType}
                    onChange={(e) => setTType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>

              {tType === 'Email' && (
                <div>
                  <label htmlFor="tpl_subject" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Subject
                  </label>
                  <input
                    id="tpl_subject"
                    type="text"
                    required={tType === 'Email'}
                    value={tSubject}
                    onChange={(e) => setTSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="Let's connect, {{first_name}}!"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="tpl_body" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Template Body <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Dynamic placeholders helper info */}
                  <div className="flex gap-1.5 text-[8px] font-bold text-blue-400">
                    <span>&#123;&#123;first_name&#125;&#125;</span>
                    <span>&#123;&#123;company_name&#125;&#125;</span>
                    <span>&#123;&#123;phone&#125;&#125;</span>
                  </div>
                </div>
                <textarea
                  id="tpl_body"
                  required
                  rows={6}
                  value={tBody}
                  onChange={(e) => setTBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono resize-none"
                  placeholder="Hello {{first_name}},\n\nI saw {{company_name}} and wanted to reach out..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Create Campaign */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Create Campaign</h3>
            
            <form onSubmit={handleCampaignSubmit} className="space-y-4">
              <div>
                <label htmlFor="camp_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="camp_name"
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="e.g. Q3 cold email outreach"
                />
              </div>

              <div>
                <label htmlFor="camp_template" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Select Template <span className="text-red-500">*</span>
                </label>
                <select
                  id="camp_template"
                  required
                  value={cTemplate}
                  onChange={(e) => {
                    setCTemplate(e.target.value);
                    const tpl = templates.find(t => t.id === parseInt(e.target.value));
                    if (tpl) setCChannel(tpl.type);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="camp_channel" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Channel
                  </label>
                  <input
                    id="camp_channel"
                    type="text"
                    disabled
                    value={cChannel}
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg py-2 px-3 text-xs text-slate-400 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="camp_schedule" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Schedule
                  </label>
                  <select
                    id="camp_schedule"
                    value={cSchedule}
                    onChange={(e) => setCSchedule(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Scheduled">Scheduled (Queue)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
