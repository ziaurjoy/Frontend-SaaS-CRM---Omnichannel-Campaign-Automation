'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { 
  Plus, 
  Search, 
  MapPin, 
  Table as TableIcon, 
  Kanban as KanbanIcon, 
  Trash2, 
  Edit, 
  ExternalLink,
  Star,
  ChevronRight,
  ChevronLeft,
  Folder,
  FolderPlus,
  Eye,
  FileText,
  Building,
  Mail,
  Phone as PhoneIcon,
  Globe,
  PlusCircle,
  FolderOpen
} from 'lucide-react';

export default function LeadsPage() {
  const { 
    leads, 
    fetchLeads, 
    createLead, 
    updateLead,
    deleteLead,
    updateLeadStage, 
    scrapeLeads, 
    collections,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    activeBusiness, 
    loading, 
    error 
  } = useStore();

  const [activeCollectionId, setActiveCollectionId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [leadsSearch, setLeadsSearch] = useState('');

  // Modals state
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<any>(null);
  
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<any>(null);
  const [showViewLeadModal, setShowViewLeadModal] = useState(false);
  const [leadToView, setLeadToView] = useState<any>(null);

  // Collection form state
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');

  // Lead Form states
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadWebsite, setLeadWebsite] = useState('');
  const [leadAddress, setLeadAddress] = useState('');
  const [leadRating, setLeadRating] = useState('5.0');
  const [leadSource, setLeadSource] = useState('Manual');
  const [leadStage, setLeadStage] = useState('New');

  // Scraper query state
  const [scrapeQuery, setScrapeQuery] = useState('');

  // Activities logs state
  const [leadActivities, setLeadActivities] = useState<any[]>([]);
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch initial collections with debounced search query
  useEffect(() => {
    if (activeBusiness) {
      const delayDebounce = setTimeout(() => {
        fetchCollections(collectionSearch || undefined);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [activeBusiness, collectionSearch, fetchCollections]);

  // Fetch leads when active collection changes or lead search changes (debounced)
  useEffect(() => {
    if (activeBusiness && activeCollectionId !== null) {
      const delayDebounce = setTimeout(() => {
        fetchLeads(activeCollectionId, undefined, leadsSearch || undefined);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [activeBusiness, activeCollectionId, leadsSearch, fetchLeads]);

  // Reset lead search query when swapping collections
  useEffect(() => {
    setLeadsSearch('');
  }, [activeCollectionId]);

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  // Collection Handlers
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName.trim()) return;
    try {
      await createCollection({
        name: collectionName,
        description: collectionDesc || undefined
      });
      setShowCreateCollectionModal(false);
      setCollectionName('');
      setCollectionDesc('');
    } catch (err) {}
  };

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionToEdit || !collectionName.trim()) return;
    try {
      await updateCollection(collectionToEdit.id, {
        name: collectionName,
        description: collectionDesc || undefined
      });
      setShowEditCollectionModal(false);
      setCollectionToEdit(null);
      setCollectionName('');
      setCollectionDesc('');
    } catch (err) {}
  };

  const handleDeleteCollection = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the collection "${name}"? This will delete all leads inside it.`)) {
      try {
        await deleteCollection(id);
        if (activeCollectionId === id) {
          setActiveCollectionId(null);
        }
      } catch (err) {}
    }
  };

  // Lead Handlers
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || activeCollectionId === null) return;
    try {
      await createLead({
        name: leadName,
        email: leadEmail || null,
        phone: leadPhone || null,
        website: leadWebsite || null,
        address: leadAddress || null,
        rating: leadRating ? parseFloat(leadRating) : null,
        source: leadSource,
        stage: leadStage,
        collection: activeCollectionId
      });
      setShowAddLeadModal(false);
      // Reset form
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      setLeadWebsite('');
      setLeadAddress('');
      setLeadRating('5.0');
      setLeadStage('New');
    } catch (err) {}
  };

  const handleEditLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToEdit) return;
    try {
      await updateLead(leadToEdit.id, {
        name: leadName,
        email: leadEmail || null,
        phone: leadPhone || null,
        website: leadWebsite || null,
        address: leadAddress || null,
        rating: leadRating ? parseFloat(leadRating) : null,
        source: leadSource,
        stage: leadStage
      });
      setShowEditLeadModal(false);
      setLeadToEdit(null);
    } catch (err) {}
  };

  const handleDeleteLead = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      try {
        await deleteLead(id);
        if (leadToView?.id === id) {
          setShowViewLeadModal(false);
        }
      } catch (err) {}
    }
  };

  const handleScrapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeQuery || activeCollectionId === null) return;
    try {
      await scrapeLeads(scrapeQuery, activeCollectionId);
      setShowScrapeModal(false);
      setScrapeQuery('');
    } catch (err) {}
  };

  // Fetch Activities for View Modal
  const loadLeadActivities = async (leadId: number) => {
    setLoadingActivities(true);
    try {
      const data = await apiFetch(`/api/leads/${leadId}/activities/`, { businessId: activeBusiness?.id });
      setLeadActivities(data);
    } catch (err) {
      setLeadActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent, leadId: number) => {
    e.preventDefault();
    if (!newActivityDesc.trim()) return;
    try {
      await apiFetch(`/api/leads/${leadId}/activities/add/`, {
        method: 'POST',
        body: JSON.stringify({
          activity_type: 'Note',
          description: newActivityDesc
        }),
        businessId: activeBusiness?.id
      });
      setNewActivityDesc('');
      loadLeadActivities(leadId);
    } catch (err) {}
  };

  const openViewLead = (lead: any) => {
    setLeadToView(lead);
    setShowViewLeadModal(true);
    loadLeadActivities(lead.id);
  };

  const openEditLead = (lead: any) => {
    setLeadToEdit(lead);
    setLeadName(lead.name);
    setLeadEmail(lead.email || '');
    setLeadPhone(lead.phone || '');
    setLeadWebsite(lead.website || '');
    setLeadAddress(lead.address || '');
    setLeadRating(lead.rating ? String(lead.rating) : '5.0');
    setLeadSource(lead.source);
    setLeadStage(lead.stage);
    setShowEditLeadModal(true);
  };

  const openEditCollection = (col: any) => {
    setCollectionToEdit(col);
    setCollectionName(col.name);
    setCollectionDesc(col.description || '');
    setShowEditCollectionModal(true);
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
      
      {/* LEVEL 1: COLLECTIONS GRID VIEW */}
      {activeCollectionId === null ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Lead Collections</h1>
              <p className="text-sm text-slate-400 mt-1">
                Create segments of leads (e.g. 'Software Companies') and run search actions under them.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="w-full sm:w-60 bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>
              <button
                onClick={() => {
                  setCollectionName('');
                  setCollectionDesc('');
                  setShowCreateCollectionModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-md shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create Collection</span>
              </button>
            </div>
          </div>

          {loading.collections ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <div 
                  key={col.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group relative"
                >
                  <div 
                    onClick={() => setActiveCollectionId(col.id)} 
                    className="space-y-3 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Created {new Date(col.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {col.description || 'No description provided. Click to manage this collection.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      <span>{col.leads_count || 0} leads</span>
                    </span>

                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditCollection(col)}
                        className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
                        title="Edit collection details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col.id, col.name)}
                        className="p-1.5 bg-slate-950 hover:bg-red-950/20 border border-slate-850 text-slate-400 hover:text-red-400 rounded cursor-pointer transition-colors"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {collections.length === 0 && (
                <div className="col-span-full border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No collections found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Create your first collection like 'Software Companies' to start saving and managing lead lists.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCollectionName('');
                      setCollectionDesc('');
                      setShowCreateCollectionModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Create New Collection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* LEVEL 2: ACTIVE COLLECTION WORKSPACE */
        <div className="space-y-6">
          {/* Back button and Collection Header */}
          <div className="space-y-4">
            <button
              onClick={() => setActiveCollectionId(null)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer font-semibold transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Collections</span>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  <h1 className="text-2xl font-bold text-white tracking-tight">{activeCollection?.name}</h1>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {activeCollection?.description || 'Workspace leads group manager.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScrapeModal(true)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 hover:text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Scrape Places</span>
                </button>
                <button
                  onClick={() => {
                    setLeadName('');
                    setLeadEmail('');
                    setLeadPhone('');
                    setLeadWebsite('');
                    setLeadAddress('');
                    setLeadRating('5.0');
                    setLeadStage('New');
                    setShowAddLeadModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800 gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, address..."
                  value={leadsSearch}
                  onChange={(e) => setLeadsSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>
              <div className="text-xs text-slate-400 font-semibold pl-1">
                Showing {leads.length} leads in this collection
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-end sm:self-auto">
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

          {/* Leads render */}
          {loading.leads ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : viewMode === 'board' ? (
            /* KANBAN BOARD VIEW */
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {stages.map((stg) => {
                const stgLeads = leads.filter(l => l.stage === stg);
                return (
                  <div key={stg} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col w-72 shrink-0 snap-center">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        {stg}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
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

                          {/* Action links */}
                          <div className="flex justify-between items-center border-t border-slate-900/50 pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openViewLead(lead)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                                title="View details & logs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditLead(lead)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                                title="Edit lead info"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                className="p-1 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                                title="Delete lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex gap-1">
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
                    <tr key={lead.id} className="hover:bg-slate-850/30 group">
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
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {lead.website && (
                            <a 
                              href={lead.website} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded"
                              title="Visit website"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => openViewLead(lead)}
                            className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditLead(lead)}
                            className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded cursor-pointer"
                            title="Edit info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-1 bg-slate-950 hover:bg-red-950/20 border border-slate-850 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                            title="Delete lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                        No leads registered in this collection. Click Scrape Places or Add Lead to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* POPUP MODAL: Create Collection */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Create Lead Collection</h3>
            
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label htmlFor="col_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="col_name"
                  type="text"
                  required
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Software Companies"
                />
              </div>

              <div>
                <label htmlFor="col_desc" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  id="col_desc"
                  value={collectionDesc}
                  onChange={(e) => setCollectionDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="Brief context about this target group..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateCollectionModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Edit Collection */}
      {showEditCollectionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Edit Collection Details</h3>
            
            <form onSubmit={handleUpdateCollection} className="space-y-4">
              <div>
                <label htmlFor="col_edit_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="col_edit_name"
                  type="text"
                  required
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="col_edit_desc" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  id="col_edit_desc"
                  value={collectionDesc}
                  onChange={(e) => setCollectionDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCollectionModal(false);
                    setCollectionToEdit(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Add Lead */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">Add Custom Lead</h3>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label htmlFor="lead_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lead_name"
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Nobo IT"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead_email" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    id="lead_email"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="contact@domain.com"
                  />
                </div>
                <div>
                  <label htmlFor="lead_phone" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="lead_phone"
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="+880 1700..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead_website" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Website URL
                  </label>
                  <input
                    id="lead_website"
                    type="url"
                    value={leadWebsite}
                    onChange={(e) => setLeadWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="https://domain.com"
                  />
                </div>
                <div>
                  <label htmlFor="lead_rating" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Rating (Google Maps)
                  </label>
                  <input
                    id="lead_rating"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={leadRating}
                    onChange={(e) => setLeadRating(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lead_address" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Physical Address
                </label>
                <input
                  id="lead_address"
                  type="text"
                  value={leadAddress}
                  onChange={(e) => setLeadAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="Dhaka, Bangladesh"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead_source" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Source
                  </label>
                  <input
                    id="lead_source"
                    type="text"
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lead_stage" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    id="lead_stage"
                    value={leadStage}
                    onChange={(e) => setLeadStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {stages.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
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

      {/* POPUP MODAL: Edit Lead */}
      {showEditLeadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">Edit Lead Info</h3>
            
            <form onSubmit={handleEditLeadSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit_lead_name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit_lead_name"
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit_lead_email" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    id="edit_lead_email"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit_lead_phone" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="edit_lead_phone"
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit_lead_website" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Website URL
                  </label>
                  <input
                    id="edit_lead_website"
                    type="url"
                    value={leadWebsite}
                    onChange={(e) => setLeadWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit_lead_rating" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Rating (Google Maps)
                  </label>
                  <input
                    id="edit_lead_rating"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={leadRating}
                    onChange={(e) => setLeadRating(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit_lead_address" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Physical Address
                </label>
                <input
                  id="edit_lead_address"
                  type="text"
                  value={leadAddress}
                  onChange={(e) => setLeadAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit_lead_source" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Source
                  </label>
                  <input
                    id="edit_lead_source"
                    type="text"
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edit_lead_stage" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    id="edit_lead_stage"
                    value={leadStage}
                    onChange={(e) => setLeadStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {stages.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditLeadModal(false);
                    setLeadToEdit(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: View Lead Details & Activity Logs */}
      {showViewLeadModal && leadToView && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{leadToView.name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/20 border border-blue-500/20 text-blue-400">
                  {leadToView.stage}
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowViewLeadModal(false);
                  setLeadToView(null);
                  setLeadActivities([]);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold bg-slate-950 border border-slate-850 hover:bg-slate-850 px-2.5 py-1 rounded cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 pr-1 pb-4">
              {/* Left Column: Lead Info details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Information</span>
                </h4>

                <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-3.5 text-xs text-slate-400">
                  {leadToView.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-200 select-all">{leadToView.email}</span>
                    </div>
                  )}
                  {leadToView.phone && (
                    <div className="flex items-center gap-2.5">
                      <PhoneIcon className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-200 select-all">{leadToView.phone}</span>
                    </div>
                  )}
                  {leadToView.website && (
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <a 
                        href={leadToView.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-bold text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {leadToView.rating && (
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <div className="flex items-center gap-1.5">
                        <span>Rating: <strong className="text-slate-200">{leadToView.rating} / 5.0</strong></span>
                        {leadToView.user_ratings_total !== undefined && leadToView.user_ratings_total !== null && (
                          <span className="text-[10px] text-slate-505 font-medium">({leadToView.user_ratings_total} reviews)</span>
                        )}
                      </div>
                    </div>
                  )}

                  {leadToView.business_status && (
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-slate-500" />
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Status:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          leadToView.business_status === 'OPERATIONAL' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}>
                          {leadToView.business_status}
                        </span>
                      </div>
                    </div>
                  )}

                  {(leadToView.latitude || leadToView.longitude || leadToView.place_id) && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <div className="flex items-center gap-2 flex-wrap">
                        {leadToView.latitude && leadToView.longitude && (
                          <span className="text-slate-400">Location: <span className="font-semibold text-slate-300">{Number(leadToView.latitude).toFixed(4)}, {Number(leadToView.longitude).toFixed(4)}</span></span>
                        )}
                        <a
                          href={
                            leadToView.place_id
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(leadToView.name)}&query_place_id=${leadToView.place_id}`
                              : `https://www.google.com/maps/search/?api=1&query=${leadToView.latitude},${leadToView.longitude}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-0.5 ml-1 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20"
                        >
                          <span>Open in Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {leadToView.types && leadToView.types.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-900">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categories</span>
                      <div className="flex flex-wrap gap-1.5">
                        {leadToView.types.map((type: string) => (
                          <span key={type} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-[10px] font-medium text-slate-450 uppercase tracking-wider">
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-slate-900">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Address</span>
                    <p className="text-slate-300 leading-relaxed">{leadToView.address || 'No physical address stored.'}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between text-[10px] text-slate-500">
                    <span>Source: {leadToView.source}</span>
                    <span>Added: {new Date(leadToView.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setShowViewLeadModal(false);
                      openEditLead(leadToView);
                    }}
                    className="flex-1 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Lead</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteLead(leadToView.id, leadToView.name)}
                    className="flex-1 py-2 bg-slate-950 border border-slate-850 hover:bg-red-950/20 text-red-400 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Lead</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Activity History & Logs */}
              <div className="space-y-4 flex flex-col">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Activity Timeline & Notes</span>
                </h4>

                {/* Add Activity Form */}
                <form onSubmit={(e) => handleAddNote(e, leadToView.id)} className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityDesc}
                    onChange={(e) => setNewActivityDesc(e.target.value)}
                    placeholder="Log a call or add a note..."
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Log Note
                  </button>
                </form>

                {/* Activity Feed list */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
                  {loadingActivities ? (
                    <div className="py-8 text-center text-slate-600 text-xs">Loading activities...</div>
                  ) : leadActivities.length > 0 ? (
                    leadActivities.map((act) => (
                      <div key={act.id} className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-lg text-xs text-slate-400 space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span className="font-bold uppercase tracking-wider text-blue-400">{act.activity_type}</span>
                          <span>{new Date(act.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{act.description}</p>
                        {act.username && <span className="block text-[8px] text-slate-600 text-right">By {act.username}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border border-dashed border-slate-850 rounded-lg text-slate-600 text-xs font-semibold">
                      No activities logged for this lead yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Scrape Leads (Places Scraper) */}
      {showScrapeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span>Scrape Google Places Leads</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Enter a search query to pull business profiles from Google Maps into the collection <strong>{activeCollection?.name}</strong>.
            </p>
            
            <form onSubmit={handleScrapeSubmit} className="space-y-4">
              <div>
                <label htmlFor="scrape_query" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Places Query
                </label>
                <input
                  id="scrape_query"
                  type="text"
                  required
                  value={scrapeQuery}
                  onChange={(e) => setScrapeQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. software company dhaka"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowScrapeModal(false);
                    setScrapeQuery('');
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.scrape}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-450 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading.scrape ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scraping...</span>
                    </>
                  ) : (
                    <span>Scrape & Import</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
