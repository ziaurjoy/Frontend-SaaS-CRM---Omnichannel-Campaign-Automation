import { create } from 'zustand';
import { apiFetch } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  profile_photo?: string;
  timezone?: string;
  first_name?: string;
  last_name?: string;
}

interface Business {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  country?: string;
  address?: string;
  timezone?: string;
}

interface Lead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  rating?: string;
  source: string;
  stage: string;
  status: string;
  created_at: string;
  collection?: number;
  collection_name?: string;
  place_id?: string;
  user_ratings_total?: number;
  latitude?: number;
  longitude?: number;
  business_status?: string;
  types?: string[];
  google_metadata?: Record<string, any>;
}

interface Template {
  id: number;
  name: string;
  type: string;
  subject?: string;
  body: string;
  created_at: string;
}

interface Campaign {
  id: number;
  name: string;
  template: number;
  template_name: string;
  channel: string;
  status: string;
  schedule_type: string;
  scheduled_time?: string;
  created_at: string;
}

interface Message {
  id: number;
  lead_name: string;
  template_name?: string;
  channel: string;
  recipient: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  failed_reason?: string;
  created_at: string;
}

interface Metrics {
  leads: {
    total: number;
    by_stage: Record<string, number>;
  };
  campaigns: {
    total: number;
    active: number;
    completed: number;
  };
  messages: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
    delivery_rate: number;
    open_rate: number;
  };
  lead_growth: Array<{ date: string; count: number }>;
}

interface Integration {
  id: number;
  provider: string;
  credentials: any;
  status: string;
  connected_email?: string;
  connected_phone?: string;
  created_at: string;
  updated_at: string;
}

interface LeadCollection {
  id: number;
  name: string;
  description?: string;
  leads_count: number;
  created_at: string;
  updated_at: string;
}

interface AppState {
  token: string | null;
  user: User | null;
  businesses: Business[];
  activeBusiness: Business | null;
  leads: Lead[];
  templates: Template[];
  campaigns: Campaign[];
  messages: Message[];
  integrations: Integration[];
  collections: LeadCollection[];
  metrics: Metrics | null;
  loading: Record<string, boolean>;
  error: string | null;

  setToken: (token: string | null) => void;
  setActiveBusiness: (business: Business | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  onboard: (onboardingData: any) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchBusinesses: () => Promise<void>;
  fetchLeads: (collectionId?: number, stage?: string, searchQuery?: string) => Promise<void>;
  createLead: (leadData: any) => Promise<void>;
  updateLead: (leadId: number, leadData: any) => Promise<void>;
  deleteLead: (leadId: number) => Promise<void>;
  updateLeadStage: (leadId: number, stage: string) => Promise<void>;
  scrapeLeads: (query: string, collectionId: number) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (templateData: any) => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (campaignData: any) => Promise<void>;
  triggerCampaign: (campaignId: number) => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchIntegrations: () => Promise<void>;
  connectWhatsApp: (phone: string, credentials?: any, status?: string) => Promise<void>;
  connectGmail: (email: string, credentials?: any, status?: string) => Promise<void>;
  disconnectIntegration: (id: number) => Promise<void>;
  fetchCollections: (searchQuery?: string) => Promise<void>;
  createCollection: (collectionData: { name: string; description?: string }) => Promise<LeadCollection>;
  updateCollection: (id: number, collectionData: { name: string; description?: string }) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  user: null,
  businesses: [],
  activeBusiness: null,
  leads: [],
  templates: [],
  campaigns: [],
  messages: [],
  integrations: [],
  collections: [],
  metrics: null,
  loading: {},
  error: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    set({ token });
  },

  setActiveBusiness: (business) => {
    if (business) {
      localStorage.setItem('active_business_id', business.id);
    } else {
      localStorage.removeItem('active_business_id');
    }
    set({ activeBusiness: business });
    // Refetch dashboard data when tenant switches
    if (business) {
      get().fetchLeads();
      get().fetchTemplates();
      get().fetchCampaigns();
      get().fetchMessages();
      get().fetchMetrics();
      get().fetchIntegrations();
      get().fetchCollections();
    }
  },

  login: async (username, password) => {
    set({ loading: { ...get().loading, login: true }, error: null });
    try {
      const data = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      get().setToken(data.access);
      await get().fetchProfile();
      await get().fetchBusinesses();
      
      const { businesses } = get();
      if (businesses.length > 0) {
        // Auto-select first business
        const savedId = localStorage.getItem('active_business_id');
        const savedBusiness = businesses.find(b => b.id === savedId) || businesses[0];
        get().setActiveBusiness(savedBusiness);
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: { ...get().loading, login: false } });
    }
  },

  register: async (userData) => {
    set({ loading: { ...get().loading, register: true }, error: null });
    try {
      await apiFetch('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: { ...get().loading, register: false } });
    }
  },

  logout: () => {
    get().setToken(null);
    get().setActiveBusiness(null);
    set({
      user: null,
      businesses: [],
      leads: [],
      templates: [],
      campaigns: [],
      messages: [],
      integrations: [],
      collections: [],
      metrics: null,
      error: null,
    });
  },

  onboard: async (onboardingData) => {
    set({ loading: { ...get().loading, onboard: true }, error: null });
    try {
      const data = await apiFetch('/api/auth/onboard/', {
        method: 'POST',
        body: JSON.stringify(onboardingData),
      });
      await get().fetchProfile();
      await get().fetchBusinesses();
      const newBusiness = get().businesses.find(b => b.id === data.business_id);
      if (newBusiness) {
        get().setActiveBusiness(newBusiness);
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: { ...get().loading, onboard: false } });
    }
  },

  fetchProfile: async () => {
    try {
      const user = await apiFetch('/api/auth/profile/');
      set({ user });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchBusinesses: async () => {
    try {
      const data = await apiFetch('/api/businesses/');
      const businesses = Array.isArray(data) ? data : data.results || [];
      set({ businesses });
      if (businesses.length > 0 && !get().activeBusiness) {
        const savedId = localStorage.getItem('active_business_id');
        const savedBusiness = businesses.find((b: Business) => b.id === savedId) || businesses[0];
        get().setActiveBusiness(savedBusiness);
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchLeads: async (collectionId, stage, searchQuery) => {
    const active = get().activeBusiness;
    if (!active) return;
    set({ loading: { ...get().loading, leads: true } });
    try {
      const params = [];
      if (collectionId) params.push(`collection=${collectionId}`);
      if (stage) params.push(`stage=${stage}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
      const url = `/api/leads/${queryStr}`;
      
      const data = await apiFetch(url, { businessId: active.id });
      // DRF returns paginated results under `results` key if configured, or direct array
      const leads = Array.isArray(data) ? data : data.results || [];
      set({ leads });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: { ...get().loading, leads: false } });
    }
  },

  createLead: async (leadData) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch('/api/leads/', {
        method: 'POST',
        body: JSON.stringify(leadData),
        businessId: active.id,
      });
      get().fetchLeads(leadData.collection);
      get().fetchMetrics();
      get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateLead: async (leadId, leadData) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch(`/api/leads/${leadId}/`, {
        method: 'PATCH',
        body: JSON.stringify(leadData),
        businessId: active.id,
      });
      set({
        leads: get().leads.map((l) => (l.id === leadId ? { ...l, ...leadData } : l)),
      });
      get().fetchMetrics();
      get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteLead: async (leadId) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch(`/api/leads/${leadId}/`, {
        method: 'DELETE',
        businessId: active.id,
      });
      set({
        leads: get().leads.filter((l) => l.id !== leadId),
      });
      get().fetchMetrics();
      get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateLeadStage: async (leadId, stage) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch(`/api/leads/${leadId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
        businessId: active.id,
      });
      // Locally update state to avoid full reload lag
      set({
        leads: get().leads.map((l) => (l.id === leadId ? { ...l, stage } : l)),
      });
      get().fetchMetrics();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  scrapeLeads: async (query, collectionId) => {
    const active = get().activeBusiness;
    if (!active) return;
    set({ loading: { ...get().loading, scrape: true } });
    try {
      await apiFetch('/api/leads/scrape_google_places/', {
        method: 'POST',
        body: JSON.stringify({ query, collection_id: collectionId }),
        businessId: active.id,
      });
      await get().fetchLeads(collectionId);
      await get().fetchMetrics();
      await get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: { ...get().loading, scrape: false } });
    }
  },

  fetchTemplates: async () => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      const data = await apiFetch('/api/templates/', { businessId: active.id });
      const templates = Array.isArray(data) ? data : data.results || [];
      set({ templates });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createTemplate: async (templateData) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch('/api/templates/', {
        method: 'POST',
        body: JSON.stringify(templateData),
        businessId: active.id,
      });
      get().fetchTemplates();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchCampaigns: async () => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      const data = await apiFetch('/api/campaigns/', { businessId: active.id });
      const campaigns = Array.isArray(data) ? data : data.results || [];
      set({ campaigns });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createCampaign: async (campaignData) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch('/api/campaigns/', {
        method: 'POST',
        body: JSON.stringify(campaignData),
        businessId: active.id,
      });
      get().fetchCampaigns();
      get().fetchMetrics();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  triggerCampaign: async (campaignId) => {
    const active = get().activeBusiness;
    if (!active) return;
    set({ loading: { ...get().loading, trigger: true } });
    try {
      await apiFetch(`/api/campaigns/${campaignId}/trigger/`, {
        method: 'POST',
        businessId: active.id,
      });
      get().fetchCampaigns();
      get().fetchMessages();
      get().fetchMetrics();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: { ...get().loading, trigger: false } });
    }
  },

  fetchMessages: async () => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      const data = await apiFetch('/api/messages/', { businessId: active.id });
      const messages = Array.isArray(data) ? data : data.results || [];
      set({ messages });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchMetrics: async () => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      const metrics = await apiFetch('/api/analytics/dashboard/', { businessId: active.id });
      set({ metrics });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchIntegrations: async () => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      const data = await apiFetch('/api/integrations/', { businessId: active.id });
      const integrations = Array.isArray(data) ? data : data.results || [];
      set({ integrations });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  connectWhatsApp: async (phone, credentials = {}, status = 'Connected') => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch('/api/integrations/connect_whatsapp/', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone, credentials, status }),
        businessId: active.id,
      });
      get().fetchIntegrations();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  connectGmail: async (email, credentials = {}, status = 'Connected') => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch('/api/integrations/connect_gmail/', {
        method: 'POST',
        body: JSON.stringify({ email, credentials, status }),
        businessId: active.id,
      });
      get().fetchIntegrations();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  disconnectIntegration: async (id) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch(`/api/integrations/${id}/`, {
        method: 'DELETE',
        businessId: active.id,
      });
      get().fetchIntegrations();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchCollections: async (searchQuery) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      const url = searchQuery 
        ? `/api/collections/?search=${encodeURIComponent(searchQuery)}`
        : '/api/collections/';
      const data = await apiFetch(url, { businessId: active.id });
      const collections = Array.isArray(data) ? data : data.results || [];
      set({ collections });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createCollection: async (collectionData) => {
    const active = get().activeBusiness;
    if (!active) throw new Error("No active workspace");
    try {
      const collection = await apiFetch('/api/collections/', {
        method: 'POST',
        body: JSON.stringify(collectionData),
        businessId: active.id,
      });
      get().fetchCollections();
      return collection;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateCollection: async (id, collectionData) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch(`/api/collections/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(collectionData),
        businessId: active.id,
      });
      get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCollection: async (id) => {
    const active = get().activeBusiness;
    if (!active) return;
    try {
      await apiFetch(`/api/collections/${id}/`, {
        method: 'DELETE',
        businessId: active.id,
      });
      get().fetchCollections();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
