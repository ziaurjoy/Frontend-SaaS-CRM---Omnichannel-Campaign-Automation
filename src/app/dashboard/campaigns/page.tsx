'use strict';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { 
  Plus, 
  Megaphone, 
  FileText, 
  Play, 
  Layers, 
  Variable, 
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Search,
  Download,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  XCircle,
  RefreshCw,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function CampaignsPage() {
  const { 
    templates, 
    campaigns, 
    collections,
    fetchTemplates, 
    fetchCampaigns, 
    fetchCollections,
    createTemplate, 
    createCampaign, 
    updateCampaign,
    deleteCampaign,
    triggerCampaign, 
    fetchCampaignMessages,
    activeBusiness, 
    loading 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [layoutMode, setLayoutMode] = useState<'card' | 'table'>('card');

  // Form states - Template
  const [tName, setTName] = useState('');
  const [tType, setTType] = useState('Email');
  const [tSubject, setTSubject] = useState('');
  const [tBody, setTBody] = useState('');

  // Form states - Campaign
  const [cName, setCName] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cTemplate, setCTemplate] = useState('');
  const [cCollection, setCCollection] = useState('');
  const [cChannel, setCChannel] = useState('Email');
  const [cMessageContent, setCMessageContent] = useState('');
  const [cSchedule, setCSchedule] = useState('Immediate');
  const [cScheduledTime, setCScheduledTime] = useState('');
  const [cStatus, setCStatus] = useState('Draft');

  // Inline Template Creation Form State inside Campaign Modal
  const [showInlineTemplateForm, setShowInlineTemplateForm] = useState(false);
  const [inlineTName, setInlineTName] = useState('');
  const [inlineTType, setInlineTType] = useState('Email');
  const [inlineTSubject, setInlineTSubject] = useState('');
  const [inlineTBody, setInlineTBody] = useState('');
  const [isSavingInlineTemplate, setIsSavingInlineTemplate] = useState(false);

  // Campaign Details Page States
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [campaignMessages, setCampaignMessages] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (activeBusiness) {
      fetchTemplates();
      fetchCampaigns();
      fetchCollections();
    }
  }, [activeBusiness, fetchTemplates, fetchCampaigns, fetchCollections]);

  useEffect(() => {
    if (selectedCampaignId) {
      setIsMessagesLoading(true);
      fetchCampaignMessages(selectedCampaignId)
        .then(msgs => {
          setCampaignMessages(msgs);
          setIsMessagesLoading(false);
        })
        .catch(() => setIsMessagesLoading(false));
    }
  }, [selectedCampaignId, fetchCampaignMessages, refreshTrigger]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

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

  const handleInlineTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTName || !inlineTBody) return;
    setIsSavingInlineTemplate(true);
    try {
      await createTemplate({
        name: inlineTName,
        type: inlineTType,
        subject: inlineTType === 'Email' ? inlineTSubject : null,
        body: inlineTBody,
      });
      await fetchTemplates();
      
      // Auto-select newly created template
      const currentTemplates = useStore.getState().templates;
      const createdTpl = currentTemplates.find(t => t.name === inlineTName);
      if (createdTpl) {
        setCTemplate(createdTpl.id.toString());
        setCChannel(createdTpl.type);
        setCMessageContent(createdTpl.body);
      }
      
      setInlineTName('');
      setInlineTSubject('');
      setInlineTBody('');
      setShowInlineTemplateForm(false);
    } catch (err) {
      alert("Failed to save template.");
    } finally {
      setIsSavingInlineTemplate(false);
    }
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName) return;

    const payload = {
      name: cName,
      description: cDescription || null,
      template: cTemplate ? parseInt(cTemplate) : null,
      target_collection: cCollection ? parseInt(cCollection) : null,
      message_content: cMessageContent || null,
      channel: cChannel,
      status: cStatus,
      schedule_type: cSchedule,
      scheduled_time: cSchedule === 'Scheduled' && cScheduledTime ? new Date(cScheduledTime).toISOString() : null,
    };

    try {
      if (editingCampaignId) {
        await updateCampaign(editingCampaignId, payload);
      } else {
        await createCampaign(payload);
      }
      setShowCampaignModal(false);
      setEditingCampaignId(null);
      setCName('');
      setCDescription('');
      setCTemplate('');
      setCCollection('');
      setCChannel('Email');
      setCMessageContent('');
      setCSchedule('Immediate');
      setCScheduledTime('');
      setCStatus('Draft');
    } catch (err) {}
  };

  const handleEditCampaignClick = (camp: any) => {
    setEditingCampaignId(camp.id);
    setCName(camp.name);
    setCDescription(camp.description || '');
    setCTemplate(camp.template ? camp.template.toString() : '');
    setCCollection(camp.target_collection ? camp.target_collection.toString() : '');
    setCChannel(camp.channel);
    setCMessageContent(camp.message_content || '');
    setCSchedule(camp.schedule_type);
    setCScheduledTime(camp.scheduled_time ? new Date(camp.scheduled_time).toISOString().substring(0, 16) : '');
    setCStatus(camp.status);
    setShowCampaignModal(true);
  };

  const handleToggleCampaignStatus = async (camp: any) => {
    const newStatus = camp.status === 'Active' ? 'Paused' : 'Active';
    try {
      await updateCampaign(camp.id, { status: newStatus });
    } catch (err: any) {
      alert(`Failed to update campaign status: ${err.message}`);
    }
  };

  const renderStatusBadge = (status: string) => {
    let label = status;
    let styles = '';
    if (status === 'Active') {
      label = 'Active';
      styles = 'bg-blue-600/10 border-blue-500/25 text-blue-400';
    } else if (status === 'Paused') {
      label = 'Inactive';
      styles = 'bg-slate-800 border-slate-700 text-slate-400';
    } else if (status === 'Draft') {
      label = 'Draft';
      styles = 'bg-slate-850 border-slate-800 text-slate-400';
    } else if (status === 'Completed') {
      label = 'Completed';
      styles = 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400';
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${styles}`}>
        {label}
      </span>
    );
  };

  const handleTriggerCampaign = async (id: number) => {
    try {
      await triggerCampaign(id);
    } catch (err) {}
  };

  const handleDeleteCampaign = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this campaign? All message logs for this campaign will be removed permanently.")) {
      try {
        await deleteCampaign(id);
        if (selectedCampaignId === id) {
          setSelectedCampaignId(null);
        }
      } catch (err: any) {
        alert(`Failed to delete campaign: ${err.message}`);
      }
    }
  };

  const handleTriggerCampaignFromDetails = async (id: number) => {
    try {
      await triggerCampaign(id);
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 1000);
    } catch (err) {}
  };

  // Metrics calculation
  const uniqueLeadsCount = useMemo(() => {
    const leadIds = new Set(campaignMessages.map(m => m.lead));
    return leadIds.size;
  }, [campaignMessages]);

  const sentCount = campaignMessages.filter(m => ['Sent', 'Delivered', 'Opened', 'Replied'].includes(m.status)).length;
  const deliveredCount = campaignMessages.filter(m => ['Delivered', 'Opened', 'Replied'].includes(m.status)).length;
  const failedCount = campaignMessages.filter(m => m.status === 'Failed').length;
  const pendingCount = campaignMessages.filter(m => m.status === 'Pending').length;
  const responseCount = campaignMessages.filter(m => m.status === 'Replied' || m.is_replied).length;
  const conversionCount = Math.round(responseCount * 0.4);

  // Table filtering
  const filteredMessages = useMemo(() => {
    return campaignMessages.filter(msg => {
      const nameMatch = msg.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const contactMatch = msg.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      if (searchQuery && !nameMatch && !contactMatch) return false;

      if (statusFilter !== 'All') {
        if (statusFilter === 'Sent') {
          if (!['Sent', 'Delivered', 'Opened', 'Replied'].includes(msg.status)) return false;
        } else if (statusFilter === 'Delivered') {
          if (!['Delivered', 'Opened', 'Replied'].includes(msg.status)) return false;
        } else if (statusFilter === 'Replied') {
          if (msg.status !== 'Replied' && !msg.is_replied) return false;
        } else {
          if (msg.status !== statusFilter) return false;
        }
      }

      if (startDate) {
        const sentTime = msg.sent_at ? new Date(msg.sent_at).getTime() : 0;
        const startTime = new Date(startDate).getTime();
        if (sentTime < startTime) return false;
      }
      if (endDate) {
        const sentTime = msg.sent_at ? new Date(msg.sent_at).getTime() : 0;
        const endTime = new Date(endDate).setHours(23, 59, 59, 999);
        if (sentTime > endTime) return false;
      }

      return true;
    });
  }, [campaignMessages, searchQuery, statusFilter, startDate, endDate]);

  // Pagination
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredMessages.slice(startIndex, startIndex + 10);
  }, [filteredMessages, currentPage]);

  const totalPages = Math.ceil(filteredMessages.length / 10) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, startDate, endDate]);

  const handleExportCSV = () => {
    if (filteredMessages.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Lead Name", "Phone/Email", "Message Status", "Sent Date & Time", "Delivery Status", "Response Status", "Campaign Name"];
    const rows = filteredMessages.map(msg => [
      msg.lead_name || 'N/A',
      msg.recipient || 'N/A',
      msg.status,
      msg.sent_at ? new Date(msg.sent_at).toLocaleString() : 'Pending',
      ['Delivered', 'Opened', 'Replied'].includes(msg.status) ? 'Delivered' : (msg.status === 'Failed' ? 'Failed' : 'Pending'),
      (msg.status === 'Replied' || msg.is_replied) ? 'Replied' : 'No Response',
      selectedCampaign?.name || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campaign_${selectedCampaign?.name.replace(/\s+/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If in details view
  if (selectedCampaignId && selectedCampaign) {
    return (
      <div className="space-y-6">
        
        {/* Back header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCampaignId(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campaigns</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{selectedCampaign.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                selectedCampaign.status === 'Active' 
                  ? 'bg-blue-600/10 border-blue-500/25 text-blue-400' 
                  : selectedCampaign.status === 'Completed'
                  ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400'
                  : selectedCampaign.status === 'Paused'
                  ? 'bg-amber-600/10 border-amber-500/25 text-amber-400'
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}>
                {selectedCampaign.status}
              </span>
            </div>
            {selectedCampaign.description && (
              <p className="text-xs text-slate-400 max-w-2xl">{selectedCampaign.description}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Target Audience: <strong className="text-slate-300 font-semibold">{selectedCampaign.target_collection_name || 'All Leads'}</strong></span>
              <span className="flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> Channel: <strong className="text-slate-300 font-semibold">{selectedCampaign.channel}</strong></span>
              {selectedCampaign.scheduled_time && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Scheduled: <strong className="text-slate-300 font-semibold">{new Date(selectedCampaign.scheduled_time).toLocaleString()}</strong></span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={isMessagesLoading}
              className="bg-slate-850 hover:bg-slate-800 text-slate-300 p-2 rounded-lg cursor-pointer transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isMessagesLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => handleDeleteCampaign(selectedCampaign.id)}
              className="bg-red-950/30 hover:bg-red-900/30 border border-red-900/50 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Delete Campaign"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Campaign</span>
            </button>
            
            {selectedCampaign.status !== 'Completed' && (
              <button
                onClick={() => handleTriggerCampaignFromDetails(selectedCampaign.id)}
                disabled={loading.trigger || isMessagesLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {loading.trigger ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Campaign Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Metrics Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-white">{uniqueLeadsCount}</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sent</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-blue-400">{sentCount}</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivered</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-emerald-400">{deliveredCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">
                ({sentCount > 0 ? Math.round((deliveredCount / sentCount) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failed</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-red-400">{failedCount}</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-slate-400">{pendingCount}</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Responses</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-purple-400">{responseCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">
                ({sentCount > 0 ? Math.round((responseCount / sentCount) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversions</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg md:text-2xl font-bold text-pink-400">{conversionCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">
                ({responseCount > 0 ? Math.round((conversionCount / responseCount) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Lead Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          
          {/* Filtering Header */}
          <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-950/20">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search leads, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800/80 rounded-lg overflow-x-auto max-w-full">
                {['All', 'Sent', 'Delivered', 'Failed', 'Pending', 'Replied'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === status 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range filters and export */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-[10px] text-white focus:outline-none focus:border-slate-700 cursor-pointer"
                  title="Start Date"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-[10px] text-white focus:outline-none focus:border-slate-700 cursor-pointer"
                  title="End Date"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="bg-slate-850 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-800 w-full md:w-auto justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table display */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/30 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-4 px-6">Lead Name</th>
                  <th className="py-4 px-6">Contact Address</th>
                  <th className="py-4 px-6">Sent Date</th>
                  <th className="py-4 px-6 text-center">Delivery Status</th>
                  <th className="py-4 px-6 text-center">Response Status</th>
                  <th className="py-4 px-6">Campaign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-850/20 transition-colors text-xs text-slate-300">
                    <td className="py-3.5 px-6 font-bold text-white">{msg.lead_name || 'N/A'}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px]">{msg.recipient || 'N/A'}</td>
                    <td className="py-3.5 px-6 text-slate-400">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : <span className="text-slate-600 font-medium italic">Pending</span>}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        msg.status === 'Replied' || msg.status === 'Opened' || msg.status === 'Delivered'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : msg.status === 'Sent'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : msg.status === 'Failed'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {msg.status === 'Replied' || msg.status === 'Opened' ? 'Delivered' : msg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        (msg.status === 'Replied' || msg.is_replied)
                          ? 'bg-purple-900/30 border border-purple-500/20 text-purple-300'
                          : 'bg-slate-950 border border-slate-850 text-slate-500'
                      }`}>
                        {(msg.status === 'Replied' || msg.is_replied) ? 'Replied' : 'No Response'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 font-medium">{selectedCampaign.name}</td>
                  </tr>
                ))}

                {filteredMessages.length === 0 && !isMessagesLoading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                      No campaign lead records found matching these criteria.
                    </td>
                  </tr>
                )}

                {isMessagesLoading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="font-semibold">Loading campaign leads...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {filteredMessages.length > 10 && (
            <div className="p-4 md:p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/10">
              <span className="text-[10px] text-slate-500 font-bold">
                Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, filteredMessages.length)} of {filteredMessages.length} records
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 p-1.5 rounded transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-semibold px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 p-1.5 rounded transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, list view
  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campaign Automation Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Build dynamic templates, define schedule parameters, and run bulk CRM outreach campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Layout Mode Switcher */}
          {activeTab === 'campaigns' && (
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setLayoutMode('card')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  layoutMode === 'card'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setLayoutMode('table')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  layoutMode === 'table'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
            </div>
          )}

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
                setEditingCampaignId(null); // Clean form
                setCName('');
                setCDescription('');
                setCTemplate('');
                setCCollection('');
                setCChannel('Email');
                setCMessageContent('');
                setCSchedule('Immediate');
                setCScheduledTime('');
                setCStatus('Draft');
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
        layoutMode === 'card' ? (
          /* CAMPAIGNS CARD GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div 
                key={camp.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
                onClick={() => setSelectedCampaignId(camp.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {renderStatusBadge(camp.status)}
                    <span className="text-[10px] text-slate-500 font-semibold">{camp.channel}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{camp.name}</h3>
                    {camp.description && (
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{camp.description}</p>
                    )}
                    
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Audience: <strong className="text-slate-300 font-semibold">{camp.target_collection_name || 'All Leads'}</strong></span>
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Template: {camp.template_name || <em className="text-slate-600">Custom Content</em>}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()} // Prevent card viewDetails navigation
                >
                  <span className="text-[10px] text-slate-500 font-medium">
                    Type: {camp.schedule_type}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className="text-slate-450 hover:text-white px-2 py-1 rounded text-[10px] font-bold border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer bg-slate-950/20"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleEditCampaignClick(camp)}
                      className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-800 hover:border-blue-950/50 transition-colors cursor-pointer bg-blue-950/5"
                    >
                      Edit
                    </button>

                    {camp.status !== 'Completed' && (
                      <button
                        onClick={() => handleToggleCampaignStatus(camp)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          camp.status === 'Active'
                            ? 'border-amber-900/50 bg-amber-950/20 text-amber-400 hover:bg-amber-900/20'
                            : 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/20'
                        }`}
                      >
                        {camp.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="text-red-400/80 hover:text-red-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-800 hover:border-red-950/50 transition-colors cursor-pointer flex items-center gap-1 bg-red-950/10"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
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
          /* CAMPAIGNS DATA TABLE VIEW */
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-5">Campaign Title</th>
                    <th className="py-4 px-5">Audience</th>
                    <th className="py-4 px-5">Channel</th>
                    <th className="py-4 px-5">Schedule</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {campaigns.map((camp) => (
                    <tr 
                      key={camp.id} 
                      className="hover:bg-slate-850/30 transition-colors text-xs cursor-pointer"
                      onClick={() => setSelectedCampaignId(camp.id)}
                    >
                      <td className="py-3.5 px-5 font-semibold text-white">
                        <div>{camp.name}</div>
                        {camp.description && (
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1 max-w-xs">{camp.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400 font-medium">
                        {camp.target_collection_name || 'All Leads'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400 font-medium">
                        {camp.channel}
                      </td>
                      <td className="py-3.5 px-5 text-slate-450">
                        {camp.schedule_type} {camp.scheduled_time && `(${new Date(camp.scheduled_time).toLocaleString()})`}
                      </td>
                      <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(camp.status)}
                          {camp.status !== 'Completed' && (
                            <button
                              onClick={() => handleToggleCampaignStatus(camp)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                                camp.status === 'Active'
                                  ? 'border-amber-900/50 bg-amber-950/20 text-amber-400 hover:bg-amber-900/20'
                                  : 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/20'
                              }`}
                              title={camp.status === 'Active' ? 'Deactivate campaign' : 'Activate campaign'}
                            >
                              {camp.status === 'Active' ? 'Pause' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCampaignId(camp.id)}
                            className="text-slate-350 hover:text-white px-2 py-1 rounded text-[10px] font-bold border border-slate-800 hover:border-slate-700 bg-slate-950/30 transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          
                          <button
                            onClick={() => handleEditCampaignClick(camp)}
                            className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-800 hover:border-blue-950/50 bg-blue-950/5 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="text-red-400 hover:text-red-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-800 hover:border-red-950/50 bg-red-950/10 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold border-none">
                        No campaigns scheduled. Create a new campaign to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
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
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
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
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-100 relative max-h-[90vh] overflow-y-auto">
            
            {showInlineTemplateForm ? (
              /* Inline Template Creator inside Campaign Modal */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Create Instant Template</span>
                  </h3>
                  <button 
                    onClick={() => setShowInlineTemplateForm(false)}
                    className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    Back to Campaign
                  </button>
                </div>

                <form onSubmit={handleInlineTemplateSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label htmlFor="inline_tpl_name" className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="inline_tpl_name"
                        type="text"
                        required
                        value={inlineTName}
                        onChange={(e) => setInlineTName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                        placeholder="Instant cold pitch tpl"
                      />
                    </div>
                    <div>
                      <label htmlFor="inline_tpl_type" className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Channel Type
                      </label>
                      <select
                        id="inline_tpl_type"
                        value={inlineTType}
                        onChange={(e) => setInlineTType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  {inlineTType === 'Email' && (
                    <div>
                      <label htmlFor="inline_tpl_subject" className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Email Subject
                      </label>
                      <input
                        id="inline_tpl_subject"
                        type="text"
                        required={inlineTType === 'Email'}
                        value={inlineTSubject}
                        onChange={(e) => setInlineTSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                        placeholder="Let's link up!"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="inline_tpl_body" className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Body Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="inline_tpl_body"
                      required
                      rows={5}
                      value={inlineTBody}
                      onChange={(e) => setInlineTBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono resize-none"
                      placeholder="Hi {{first_name}}, let's hook up..."
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInlineTemplateForm(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingInlineTemplate}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingInlineTemplate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save & Auto-select</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Campaign Form */
              <div>
                <h3 className="text-base font-bold text-white mb-4">
                  {editingCampaignId ? 'Edit Outreach Campaign' : 'Create Outreach Campaign'}
                </h3>
                
                <form onSubmit={handleCampaignSubmit} className="space-y-4">
                  
                  {/* Campaign Title */}
                  <div>
                    <label htmlFor="camp_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Campaign Title <span className="text-red-500">*</span>
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

                  {/* Campaign Short Description */}
                  <div>
                    <label htmlFor="camp_description" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Short Description
                    </label>
                    <input
                      id="camp_description"
                      type="text"
                      value={cDescription}
                      onChange={(e) => setCDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      placeholder="e.g. Outreach campaign targeting newly scraped tech leads"
                    />
                  </div>

                  {/* Target collection (CRM Leads Selection) */}
                  <div>
                    <label htmlFor="camp_collection" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Target Audience (Lead Collection)
                    </label>
                    <select
                      id="camp_collection"
                      value={cCollection}
                      onChange={(e) => setCCollection(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="">All Business Leads (Fallback)</option>
                      {collections.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.leads_count || 0} leads)</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Template + Inline Add template icon button */}
                  <div>
                    <label htmlFor="camp_template" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Template Source
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="camp_template"
                        value={cTemplate}
                        onChange={(e) => {
                          setCTemplate(e.target.value);
                          if (e.target.value === '') {
                            // Don't modify channel or content
                          } else {
                            const tpl = templates.find(t => t.id === parseInt(e.target.value));
                            if (tpl) {
                              setCChannel(tpl.type);
                              setCMessageContent(tpl.body);
                            }
                          }
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Custom (No Template / Direct Write) --</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => setShowInlineTemplateForm(true)}
                        className="bg-slate-850 hover:bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                        title="Create New Template Inline"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  {/* Channel / Campaign Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="camp_channel" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Campaign Type / Channel
                      </label>
                      <select
                        id="camp_channel"
                        value={cChannel}
                        onChange={(e) => setCChannel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="Email">Email Outbox</option>
                        <option value="WhatsApp">WhatsApp Outbox</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label htmlFor="camp_status" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Initial Status
                      </label>
                      <select
                        id="camp_status"
                        value={cStatus}
                        onChange={(e) => setCStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <label htmlFor="camp_msg" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 font-bold">
                      Message Content (Supports placeholders: &#123;&#123;first_name&#125;&#125;, etc.)
                    </label>
                    <textarea
                      id="camp_msg"
                      rows={4}
                      value={cMessageContent}
                      onChange={(e) => setCMessageContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono resize-none"
                      placeholder="Write your custom campaign outreach message directly here..."
                    />
                  </div>

                  {/* Schedule Parameter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="camp_schedule" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Schedule Configuration
                      </label>
                      <select
                        id="camp_schedule"
                        value={cSchedule}
                        onChange={(e) => setCSchedule(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="Immediate">Immediate Run</option>
                        <option value="Scheduled">Scheduled Queue</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="camp_sched_time" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Schedule Date & Time
                      </label>
                      <input
                        id="camp_sched_time"
                        type="datetime-local"
                        disabled={cSchedule === 'Immediate'}
                        value={cScheduledTime}
                        onChange={(e) => setCScheduledTime(e.target.value)}
                        className="w-full bg-slate-950 disabled:bg-slate-950/40 disabled:text-slate-600 disabled:border-slate-800/40 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                      />
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
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {editingCampaignId ? 'Save Changes' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
