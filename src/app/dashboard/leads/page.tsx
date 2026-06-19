'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Plus, 
  Search, 
  MapPin, 
  Table as TableIcon, 
  Kanban as KanbanIcon, 
  Trash2, 
  ExternalLink,
  Star,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function LeadsPage() {
  const { 
    leads, 
    fetchLeads, 
    createLead, 
    updateLeadStage, 
    scrapeLeads, 
    activeBusiness, 
    loading, 
    error 
  } = useStore();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScrapeModal, setShowScrapeModal] = useState(false);

  // Form states - Add Lead
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('5.0');
  const [source, setSource] = useState('Manual');
  const [stage, setStage] = useState('New');

  // Form states - Scraper
  const [scrapeQuery, setScrapeQuery] = useState('');

  useEffect(() => {
    if (activeBusiness) {
      fetchLeads();
    }
  }, [activeBusiness, fetchLeads]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await createLead({
        name,
        email: email || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        rating: rating ? parseFloat(rating) : null,
        source,
        stage,
      });
      setShowAddModal(false);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setAddress('');
      setRating('5.0');
    } catch (err) {}
  };

  const handleScrapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeQuery) return;

    try {
      await scrapeLeads(scrapeQuery);
      setShowScrapeModal(false);
      setScrapeQuery('');
    } catch (err) {}
  };

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

  const moveStage = (leadId: number, currentStage: string, direction: 'next' | 'prev') => {
    const currentIndex = stages.indexOf(currentStage);
    let newIndex = currentIndex;
    if (direction === 'next' && currentIndex < stages.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    if (newIndex !== currentIndex) {
      updateLeadStage(leadId, stages[newIndex]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM Leads Manager</h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize customer relationships, track pipeline progress, and run automated scraping.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowScrapeModal(true)}
            className="bg-slate-900 border border-slate-800 text-slate-200 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Scrape Places</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-400 font-semibold pl-2">
          Showing {leads.length} leads
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('board')}
            className={`p-1.5 rounded-md cursor-pointer transition-all ${
              viewMode === 'board' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <KanbanIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md cursor-pointer transition-all ${
              viewMode === 'list' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content display */}
      {loading.leads ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'board' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map((stg) => {
            const stgLeads = leads.filter(l => l.stage === stg);
            return (
              <div key={stg} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col min-w-[240px]">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {stg}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-850 text-slate-400">
                    {stgLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                  {stgLeads.map((lead) => (
                    <div key={lead.id} className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg space-y-3 hover:border-slate-700 transition-colors group">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 truncate">{lead.name}</h4>
                        {lead.email && <p className="text-[10px] text-slate-500 truncate mt-0.5">{lead.email}</p>}
                        {lead.phone && <p className="text-[10px] text-slate-500 truncate mt-0.5">{lead.phone}</p>}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 bg-slate-900/40 p-1.5 rounded">
                        <span className="font-semibold text-slate-400 truncate max-w-[100px]">{lead.source}</span>
                        {lead.rating && (
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {lead.rating}
                          </span>
                        )}
                      </div>

                      {/* Manual Card Stage Movement Control */}
                      <div className="flex justify-end gap-1.5 border-t border-slate-900/50 pt-2 opacity-65 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveStage(lead.id, lead.stage, 'prev')}
                          disabled={stg === 'New'}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveStage(lead.id, lead.stage, 'next')}
                          disabled={stg === 'Lost'}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {stgLeads.length === 0 && (
                    <div className="h-24 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-600 font-semibold">
                      No leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Source</th>
                <th className="py-4 px-6">Stage</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-850/30">
                  <td className="py-3.5 px-6 font-bold text-white">{lead.name}</td>
                  <td className="py-3.5 px-6 text-slate-400">{lead.email || '-'}</td>
                  <td className="py-3.5 px-6 text-slate-400">{lead.phone || '-'}</td>
                  <td className="py-3.5 px-6 font-medium">{lead.source}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-850 text-slate-300">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    {lead.rating ? (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        {lead.rating}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {lead.website && (
                      <a 
                        href={lead.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block p-1 text-slate-400 hover:text-white mr-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                    No leads registered in this workspace yet. Add a lead or scrape Google Places to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODAL: Add Lead */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Add Custom Lead</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="modal_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal_name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Jane Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal_email" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    id="modal_email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="modal_phone" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="modal_phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="+1 555-0199"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal_website" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Website URL
                </label>
                <input
                  id="modal_website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label htmlFor="modal_address" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Address
                </label>
                <input
                  id="modal_address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="100 Silicon Blvd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal_stage" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    id="modal_stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modal_rating" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    id="modal_rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Google Places Lead Scraper */}
      {showScrapeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Google Places Lead Extractor</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Search Google Maps for target businesses. We will scrape and enrich leads, including addresses, ratings, websites, and emails automatically.
            </p>
            
            <form onSubmit={handleScrapeSubmit} className="space-y-4">
              <div>
                <label htmlFor="scrape_query" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Search Query
                </label>
                <input
                  id="scrape_query"
                  type="text"
                  required
                  value={scrapeQuery}
                  onChange={(e) => setScrapeQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. coffee shops in Austin, Texas"
                />
              </div>

              {loading.scrape && (
                <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-lg flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-blue-200">
                    Querying API, scraping business profiles and importing leads...
                  </span>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  disabled={loading.scrape}
                  onClick={() => setShowScrapeModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.scrape}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Start Scrape</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
