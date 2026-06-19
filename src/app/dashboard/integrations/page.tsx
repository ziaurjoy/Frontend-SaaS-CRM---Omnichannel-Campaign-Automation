'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Link2, 
  Mail, 
  MessageSquare, 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  Building,
  Key,
  XCircle,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';

export default function IntegrationsPage() {
  const { 
    integrations, 
    fetchIntegrations, 
    connectWhatsApp, 
    connectGmail, 
    disconnectIntegration, 
    activeBusiness, 
    loading 
  } = useStore();

  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappTab, setWhatsappTab] = useState<'qr' | 'otp' | 'waba'>('qr');

  // Form states - Gmail Mock
  const [gmailEmail, setGmailEmail] = useState('sales@mybusiness.com');

  // Form states - WhatsApp
  const [waPhone, setWaPhone] = useState('+1 (555) 123-4567');
  const [waToken, setWaToken] = useState('EAAGb8vTz1...mocktoken');
  const [waPhoneId, setWaPhoneId] = useState('109283746561');
  const [pairingCode, setPairingCode] = useState('');
  const [isPairingLoading, setIsPairingLoading] = useState(false);

  useEffect(() => {
    if (activeBusiness) {
      fetchIntegrations();
    }
  }, [activeBusiness, fetchIntegrations]);

  const gmailIntegration = integrations.find(i => i.provider === 'Gmail' && i.status === 'Connected');
  const whatsappIntegration = integrations.find(i => i.provider === 'WhatsApp' && i.status === 'Connected');

  // Handle Gmail connect simulation
  const handleGmailConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectGmail(gmailEmail, { oauth_token: "mock_gmail_oauth_token" }, 'Connected');
      setShowGmailModal(false);
    } catch (err) {}
  };

  // Handle WhatsApp QR Scan connect simulation
  const handleWhatsAppQRConnect = async () => {
    try {
      await connectWhatsApp('+1 (555) 999-8888', { link_type: "QR_Code", session_id: "session_qr_992" }, 'Connected');
      setShowWhatsAppModal(false);
    } catch (err) {}
  };

  // Handle WhatsApp OTP Pairing Code connect simulation
  const handleGetPairingCode = () => {
    if (!waPhone) return;
    setIsPairingLoading(true);
    // Simulate generation delay
    setTimeout(() => {
      // Mock code: A1B2-C3D4
      setPairingCode('A8F9-2K3P');
      setIsPairingLoading(false);
    }, 800);
  };

  const handleWhatsAppOTPConnect = async () => {
    try {
      await connectWhatsApp(waPhone, { link_type: "Pairing_OTP", pairing_code: pairingCode }, 'Connected');
      setShowWhatsAppModal(false);
      setPairingCode('');
    } catch (err) {}
  };

  // Handle WhatsApp Cloud API manual connect
  const handleWhatsAppWABAConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectWhatsApp(waPhone, { link_type: "WABA_API", token: waToken, phone_id: waPhoneId }, 'Connected');
      setShowWhatsAppModal(false);
    } catch (err) {}
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
                onClick={() => setShowGmailModal(true)}
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
                  <h3 className="text-base font-bold text-white">WhatsApp Client Link</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Link WhatsApp phone via QR Code scan or OTP.</p>
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
                <div className="flex justify-between">
                  <span>Connection Mode:</span>
                  <span className="font-medium text-slate-400">
                    {whatsappIntegration.credentials?.link_type === 'WABA_API' ? 'Cloud API (Meta)' : 'Multi-Device WebLink'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your business or personal WhatsApp number. Select "Link via QR Code" to scan on your phone (Linked Devices) or "OTP pairing" to connect instantly using phone verification.
              </p>
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
                onClick={() => setShowWhatsAppModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Link WhatsApp
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

      {/* POPUP MODAL: WhatsApp Multi-Device (QR/OTP/WABA) Setup */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>Link WhatsApp Channel</span>
            </h3>

            {/* Modal Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 mb-6">
              <button
                type="button"
                onClick={() => setWhatsappTab('qr')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  whatsappTab === 'qr' ? 'bg-slate-850 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Scan</span>
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTab('otp')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  whatsappTab === 'otp' ? 'bg-slate-850 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>OTP Pairing</span>
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTab('waba')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  whatsappTab === 'waba' ? 'bg-slate-850 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Cloud API</span>
              </button>
            </div>

            {whatsappTab === 'qr' && (
              /* TAB 1: QR CODE LINK */
              <div className="flex flex-col items-center space-y-4 py-4 text-center">
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Open WhatsApp on your phone, go to **Settings {"->"} Linked Devices**, and scan the generated code to link.
                </p>

                {/* Simulated QR Code box */}
                <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-700 flex items-center justify-center shadow-lg relative group">
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Simulated QR Code
                    </span>
                  </div>
                  {/* Mock QR visual with CSS pattern */}
                  <div className="w-full h-full bg-[radial-gradient(#10b981_3px,transparent_3px)] [background-size:12px_12px] opacity-75 border-4 border-dashed border-slate-200" />
                </div>

                <div className="flex gap-3 w-full mt-6">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppQRConnect}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Simulate Scan Connection</span>
                  </button>
                </div>
              </div>
            )}

            {whatsappTab === 'otp' && (
              /* TAB 2: PAIRING CODE (OTP) */
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Input your phone number to generate an 8-character pairing code. Enter this code inside your WhatsApp mobile app linked device pairing screen.
                </p>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="wa_phone_otp" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      WhatsApp Phone Number
                    </label>
                    <input
                      id="wa_phone_otp"
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      placeholder="+1 (555) 0199"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleGetPairingCode}
                      disabled={isPairingLoading}
                      className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-9 disabled:opacity-40"
                    >
                      {isPairingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Generate Code</span>
                    </button>
                  </div>
                </div>

                {pairingCode && (
                  <div className="bg-slate-950 border border-slate-850 p-6 rounded-lg text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                      WhatsApp Pairing Code
                    </span>
                    <span className="text-3xl font-extrabold tracking-widest text-emerald-400 font-mono block select-all">
                      {pairingCode}
                    </span>
                    <p className="text-[9px] text-slate-400 max-w-xs mx-auto">
                      Open WhatsApp on your phone, navigate to **Linked Devices {"->"} Link with Phone Number**, and type the code above.
                    </p>

                    <button
                      type="button"
                      onClick={handleWhatsAppOTPConnect}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Complete Pairing Simulation
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWhatsAppModal(false);
                      setPairingCode('');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {whatsappTab === 'waba' && (
              /* TAB 3: CLOUD API */
              <form onSubmit={handleWhatsAppWABAConnect} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="waba_phone" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Business Phone Number
                    </label>
                    <input
                      id="waba_phone"
                      type="text"
                      required
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="waba_phone_id" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Phone Number ID
                    </label>
                    <input
                      id="waba_phone_id"
                      type="text"
                      required
                      value={waPhoneId}
                      onChange={(e) => setWaPhoneId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="waba_token" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    System User Access Token
                  </label>
                  <input
                    id="waba_token"
                    type="text"
                    required
                    value={waToken}
                    onChange={(e) => setWaToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Verify & Save
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
