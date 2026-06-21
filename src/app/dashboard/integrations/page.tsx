'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';

export default function IntegrationsPage() {
  const { 
    integrations, 
    fetchIntegrations, 
    connectWhatsApp, 
    connectGmail, 
    disconnectIntegration, 
    fetchMetaConfig,
    exchangeMetaCode,
    exchangeGoogleCode,
    activeBusiness, 
    loading 
  } = useStore();

  const [showGmailModal, setShowGmailModal] = useState(false);

  // Meta Embedded Signup States
  const [isSubmittingMeta, setIsSubmittingMeta] = useState(false);
  const [metaConfig, setMetaConfig] = useState<any>(null);

  // Form states - Gmail Mock
  const [gmailEmail, setGmailEmail] = useState('sales@mybusiness.com');

  useEffect(() => {
    if (activeBusiness) {
      fetchIntegrations();
    }
  }, [activeBusiness, fetchIntegrations]);

  // Fetch Meta configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await fetchMetaConfig();
        setMetaConfig(cfg);
      } catch (err) {}
    };
    if (activeBusiness) {
      loadConfig();
    }
  }, [activeBusiness, fetchMetaConfig]);

  // Load and initialize Facebook SDK & Google GIS SDK
  useEffect(() => {
    // 1. Load Google Identity Services (GIS) SDK
    const loadGoogleSDK = () => {
      if (document.getElementById('google-gsi')) return;
      const fjs = document.getElementsByTagName('script')[0];
      const js = document.createElement('script');
      js.id = 'google-gsi';
      js.src = 'https://accounts.google.com/gsi/client';
      js.async = true;
      js.defer = true;
      fjs.parentNode?.insertBefore(js, fjs);
    };
    loadGoogleSDK();

    // 2. Load Facebook SDK if App ID is configured
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || metaConfig?.meta_app_id;
    if (!metaAppId) return;

    const loadFbSDK = () => {
      if (document.getElementById('facebook-jssdk')) return;
      const fjs = document.getElementsByTagName('script')[0];
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode?.insertBefore(js, fjs);
    };

    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId            : metaAppId,
        cookie           : true,
        xfbml            : true,
        version          : 'v20.0'
      });
    };

    loadFbSDK();
  }, [metaConfig]);

  const gmailIntegration = integrations.find(i => i.provider === 'Gmail' && i.status === 'Connected');
  const whatsappIntegration = integrations.find(i => i.provider === 'WhatsApp' && i.status === 'Connected');

  // Handle Gmail connect simulation (Mock Mode)
  const handleGmailConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectGmail(gmailEmail, { oauth_token: "mock_gmail_oauth_token" }, 'Connected');
      setShowGmailModal(false);
    } catch (err) {}
  };

  // Handle Google Login (OAuth 2.0)
  const handleGoogleConnectClick = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      // Fall back to standard mock connector
      setShowGmailModal(true);
      return;
    }

    if (!(window as any).google?.accounts?.oauth2) {
      alert("Google Identity Services SDK is loading or failed to load. Please verify your connection.");
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send',
        ux_mode: 'popup',
        access_type: 'offline',
        prompt: 'consent',
        callback: async (response: any) => {
          if (response.error) {
            alert(`Google Login failed: ${response.error_description || response.error}`);
            return;
          }
          if (response.code) {
            try {
              await exchangeGoogleCode(response.code);
              alert("Gmail successfully connected!");
            } catch (err: any) {
              alert(`Failed to complete Gmail connection: ${err.message}`);
            }
          }
        },
      });
      client.requestCode();
    } catch (err: any) {
      alert(`Google client initialization failed: ${err.message}`);
    }
  };

  const handleMetaSignupClick = async () => {
    setIsSubmittingMeta(true);
    try {
      const config = await fetchMetaConfig();
      const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || config.meta_app_id;
      const isMockMode = !metaAppId || (!process.env.NEXT_PUBLIC_META_APP_ID && config.is_mock_mode);

      if (isMockMode) {
        // Direct sandbox mock mode exchange
        await exchangeMetaCode('mock_auth_code');
        alert("WhatsApp successfully connected via Meta (Development Sandbox Mode)!");
      } else {
        // Trigger flow using the Meta JavaScript SDK (FB.login)
        if (!(window as any).FB) {
          alert("Facebook SDK is loading or failed to load. Please verify your connection.");
          setIsSubmittingMeta(false);
          return;
        }

        // Set up message event listener for WA_EMBEDDED_SIGNUP
        const handleSDKMessage = async (event: MessageEvent) => {
          if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
            return;
          }
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (data?.type === 'WA_EMBEDDED_SIGNUP') {
              console.log('WhatsApp Embedded Signup message event:', data);
              if (data.event === 'FINISH') {
                console.log('WhatsApp Signup Finished successfully!');
              }
            }
          } catch (err) {}
        };
        window.addEventListener('message', handleSDKMessage);

        const loginOptions: any = {
          response_type: 'code',
          override_default_response_type: true
        };
        
        const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || config.meta_config_id;
        if (configId) {
          loginOptions.config_id = configId;
        } else {
          loginOptions.scope = 'whatsapp_business_management,whatsapp_business_messaging';
        }

        (window as any).FB.login((response: any) => {
          window.removeEventListener('message', handleSDKMessage);
          if (response.authResponse) {
            const code = response.authResponse.code;
            setIsSubmittingMeta(true);
            
            const metaAppSecret = process.env.NEXT_PUBLIC_META_APP_SECRET || '';

            exchangeMetaCode(code, { 
              redirect_uri: window.location.href.split('?')[0].split('#')[0],
              meta_app_id: metaAppId,
              meta_app_secret: metaAppSecret
            })
              .then(() => {
                alert("WhatsApp successfully connected via Meta Embedded Signup!");
              })
              .catch((err: any) => {
                alert(`Failed to complete Meta integration: ${err.message}`);
              })
              .finally(() => {
                setIsSubmittingMeta(false);
              });
          } else {
            alert("Meta login cancelled or failed.");
            setIsSubmittingMeta(false);
          }
        }, loginOptions);
      }
    } catch (err: any) {
      alert(`Meta Config Error: ${err.message}`);
      setIsSubmittingMeta(false);
    }
  };

  const handleDisconnect = async (id: number) => {
    if (window.confirm("Are you sure you want to disconnect this integration?")) {
      try {
        await disconnectIntegration(id);
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Integrations & Connectors</h1>
        <p className="text-sm text-slate-400 mt-1">
          Link your communication channels (Gmail & WhatsApp) to allow bulk outreach and campaign deliveries.
        </p>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* GMAIL CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gmail Connector</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Send bulk outreach emails via Gmail API.</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                gmailIntegration 
                  ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}>
                {gmailIntegration ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {gmailIntegration ? (
              <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Connected Email:</span>
                  <span className="font-bold text-slate-200">{gmailIntegration.connected_email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Type:</span>
                  <span className="font-medium text-slate-400">Google OAuth 2.0</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your business Gmail account to sync outboxes and authorize bulk sending. Meta tags and dynamic variables will be injected automatically during delivery.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex justify-end">
            {gmailIntegration ? (
              <button
                onClick={() => handleDisconnect(gmailIntegration.id)}
                className="bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800/20 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleGoogleConnectClick}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Connect Gmail
              </button>
            )}
          </div>
        </div>

        {/* WHATSAPP CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">WhatsApp Business (Meta)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Send bulk campaign messages via WhatsApp Cloud API.</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                whatsappIntegration 
                  ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}>
                {whatsappIntegration ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {whatsappIntegration ? (
              <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Connected Phone:</span>
                  <span className="font-bold text-slate-200">{whatsappIntegration.connected_phone}</span>
                </div>
                {whatsappIntegration.credentials?.business_name && (
                  <div className="flex justify-between">
                    <span>Business Name:</span>
                    <span className="font-bold text-slate-200">{whatsappIntegration.credentials.business_name}</span>
                  </div>
                )}
                {whatsappIntegration.credentials?.waba_id && (
                  <div className="flex justify-between">
                    <span>WABA ID:</span>
                    <span className="font-mono text-slate-300">{whatsappIntegration.credentials.waba_id}</span>
                  </div>
                )}
                {whatsappIntegration.credentials?.phone_id && (
                  <div className="flex justify-between">
                    <span>Phone ID:</span>
                    <span className="font-mono text-slate-300">{whatsappIntegration.credentials.phone_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your official WhatsApp Business profile using Meta Embedded Signup. Send large-scale customer campaigns, template messages, and manage automated responses using the secure, official WhatsApp Cloud API.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Official Meta Business verification integration
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Direct templates synchronization
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> High-throughput cloud message delivery
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex justify-end">
            {whatsappIntegration ? (
              <button
                onClick={() => handleDisconnect(whatsappIntegration.id)}
                className="bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800/20 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleMetaSignupClick}
                disabled={isSubmittingMeta}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-sm"
              >
                {isSubmittingMeta ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Connect with Facebook</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* POPUP MODAL: Gmail Auth Simulation */}
      {showGmailModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-500" />
              <span>Connect Gmail (Google OAuth)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Grant permissions to send outreach emails on your behalf.
            </p>

            <form onSubmit={handleGmailConnect} className="space-y-4">
              <div>
                <label htmlFor="gmail_email" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Gmail Account Email
                </label>
                <input
                  id="gmail_email"
                  type="email"
                  required
                  value={gmailEmail}
                  onChange={(e) => setGmailEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-lg text-[10px] text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>
                  This simulation bypasses Google Consent Page and logs in instantly.
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGmailModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Authorize Gmail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
