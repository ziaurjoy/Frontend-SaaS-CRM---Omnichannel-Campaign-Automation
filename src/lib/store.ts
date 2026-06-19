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

interface AppState {
  token: string | null;
  user: User | null;
  businesses: Business[];
  activeBusiness: Business | null;
  leads: Lead[];
  templates: Template[];
  campaigns: Campaign[];
  messages: Message[];
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
  fetchLeads: (stage?: string) => Promise<void>;
  createLead: (leadData: any) => Promise<void>;
  updateLeadStage: (leadId: number, stage: string) => Promise<void>;
  scrapeLeads: (query: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (templateData: any) => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (campaignData: any) => Promise<void>;
  triggerCampaign: (campaignId: number) => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
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
      const businesses = await apiFetch('/api/businesses/');
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

  fetchLeads: async (stage) => {
    const active = get().activeBusiness;
    if (!active) return;
    set({ loading: { ...get().loading, leads: true } });
    try {
      const url = stage ? `/api/leads/?stage=${stage}` : '/api/leads/';
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
      get().fetchLeads();
      get().fetchMetrics();
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

  scrapeLeads: async (query) => {
    const active = get().activeBusiness;
    if (!active) return;
    set({ loading: { ...get().loading, scrape: true } });
    try {
      await apiFetch('/api/leads/scrape_google_places/', {
        method: 'POST',
        body: JSON.stringify({ query }),
        businessId: active.id,
      });
      await get().fetchLeads();
      await get().fetchMetrics();
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

  clearError: () => set({ error: null }),
}));
