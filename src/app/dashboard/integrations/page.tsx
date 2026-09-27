'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import QRCode from 'qrcode';
import {
	Mail,
	MessageSquare,
	CheckCircle,
	RefreshCw,
	Info,
	Loader2,
	QrCode,
	Smartphone,
	Check,
	Laptop,
	ShieldCheck,
	X,
	Sparkles,
	PhoneCall,
	Copy,
	ExternalLink,
	Hash,
} from 'lucide-react';

// 100% Compliant Standard QR Code Generator using 'qrcode' library with High Error Correction
function DynamicQRCodeDisplay({ value, expired, onRefresh }: { value: string; expired: boolean; onRefresh: () => void }) {
	const [dataUrl, setDataUrl] = useState<string>('');

	useEffect(() => {
		if (!value) return;
		QRCode.toDataURL(value, {
			width: 300,
			margin: 2,
			color: {
				dark: '#0f172a',
				light: '#ffffff',
			},
			errorCorrectionLevel: 'H', // High error correction level allows center badge overlay
		})
			.then((url) => setDataUrl(url))
			.catch((err) => console.error('QR generation error:', err));
	}, [value]);

	return (
		<div className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
			{expired && (
				<div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-20 p-4 text-center">
					<div className="p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
						<RefreshCw className="w-6 h-6 animate-spin" />
					</div>
					<p className="text-xs font-semibold text-slate-200">QR Code Expired</p>
					<button
						onClick={onRefresh}
						className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
					>
						<RefreshCw className="w-3.5 h-3.5" />
						<span>Generate New Code</span>
					</button>
				</div>
			)}

			<div className="relative">
				{dataUrl ? (
					<img src={dataUrl} alt="WhatsApp Pairing QR Code" className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl" />
				) : (
					<div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-slate-100 rounded-xl">
						<Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
					</div>
				)}

				{/* Center WhatsApp Logo Badge */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl shadow-md border-2 border-emerald-500/30 flex items-center justify-center p-1.5 pointer-events-none">
					<svg viewBox="0 0 512 512" className="w-full h-full">
						<path
							fill="#25D366"
							d="M260.1 0C116.7 0 0 116.7 0 260.1c0 45.8 11.9 90.6 34.6 130L0 512l124.6-32.7c38.1 20.8 81.1 31.7 125.5 31.7 143.4 0 260.1-116.7 260.1-260.1C510.2 116.7 393.5 0 260.1 0z"
						/>
						<path
							fill="#FFFFFF"
							d="M399.9 319.4c-6.1-3.1-36.1-17.8-41.7-19.8-5.6-2-9.7-3.1-13.8 3.1-4.1 6.1-15.8 19.8-19.4 23.9-3.6 4.1-7.2 4.6-13.3 1.5-6.1-3.1-25.7-9.5-49-30.3-18.1-16.1-30.3-36.1-33.8-42.2-3.6-6.1-.4-9.4 2.7-12.4 2.8-2.8 6.1-7.2 9.2-10.8 3.1-3.6 4.1-6.1 6.1-10.2 2-4.1 1-7.7-.5-10.8-1.5-3.1-13.8-33.3-18.9-45.6-5-12-10-10.4-13.8-10.6-3.6-.2-7.7-.2-11.8-.2s-10.8 1.5-16.4 7.7c-5.6 6.1-21.5 21-21.5 51.2s22 59.4 25.1 63.5c3.1 4.1 43.3 66.1 104.9 92.7 14.7 6.3 26.2 10.1 35.1 12.9 14.8 4.7 28.3 4 39 2.4 11.9-1.8 36.1-14.8 41.2-29.1 5.1-14.3 5.1-26.6 3.6-29.1-1.5-2.6-5.6-4.1-11.7-7.2z"
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}

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
		generateWhatsAppQR,
		checkWhatsAppStatus,
		disconnectWhatsApp,
		confirmWhatsAppQR,
		activeBusiness,
		loading,
	} = useStore();

	const [showGmailModal, setShowGmailModal] = useState(false);

	// WhatsApp QR Modal States
	const [showQrModal, setShowQrModal] = useState(false);
	const [pairingMode, setPairingMode] = useState<'qr' | 'code'>('qr');
	const [qrSession, setQrSession] = useState<any>(null);
	const [qrStatus, setQrStatus] = useState<'idle' | 'generating' | 'waiting_scan' | 'pairing' | 'connected' | 'expired'>('idle');
	const [countdown, setCountdown] = useState(60);
	const [customPhone, setCustomPhone] = useState('+1 (555) 867-5309');
	const [copiedCode, setCopiedCode] = useState(false);
	const [isPairing, setIsPairing] = useState(false);

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

	// Load SDKs
	useEffect(() => {
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

		(window as any).fbAsyncInit = function () {
			(window as any).FB.init({
				appId: metaAppId,
				cookie: true,
				xfbml: true,
				version: 'v20.0',
			});
		};

		loadFbSDK();
	}, [metaConfig]);

	// Real-time polling for WhatsApp Baileys connection status
	useEffect(() => {
		let pollInterval: NodeJS.Timeout;
		if (showQrModal && (qrStatus === 'waiting_scan' || qrStatus === 'generating')) {
			pollInterval = setInterval(async () => {
				try {
					const res = await checkWhatsAppStatus();
					if (res && res.connected) {
						setQrStatus('connected');
						setTimeout(() => {
							setShowQrModal(false);
							setQrStatus('idle');
						}, 1500);
					} else if (res && res.qr_code && (!qrSession || res.qr_code !== qrSession.qr_code)) {
						setQrSession((prev: any) => ({
							...prev,
							qr_code: res.qr_code,
							qr_data_url: res.qr_data_url || prev?.qr_data_url
						}));
					}
				} catch (e) {
					console.error("Polling WhatsApp status error:", e);
				}
			}, 2000);
		}
		return () => clearInterval(pollInterval);
	}, [showQrModal, qrStatus, checkWhatsAppStatus, qrSession]);

	// QR Code Expiration Countdown Timer
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (showQrModal && qrStatus === 'waiting_scan' && countdown > 0) {
			timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						setQrStatus('expired');
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [showQrModal, qrStatus, countdown]);

	const gmailIntegration = integrations.find((i) => i.provider === 'Gmail' && i.status === 'Connected');

	const standardWhatsappIntegration = integrations.find(
		(i) => i.provider === 'WhatsApp' && i.status === 'Connected' && (i.credentials?.link_type === 'WhatsApp_Standard_QR' || !i.credentials?.waba_id)
	);

	const metaWhatsappIntegration = integrations.find(
		(i) => i.provider === 'WhatsApp' && i.status === 'Connected' && i.credentials?.link_type === 'Meta_Embedded_Signup' && i.credentials?.waba_id
	);

	// Handle Gmail connect simulation
	const handleGmailConnect = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await connectGmail(gmailEmail, { oauth_token: 'mock_gmail_oauth_token' }, 'Connected');
			setShowGmailModal(false);
		} catch (err) {}
	};

	// Handle Google Login
	const handleGoogleConnectClick = () => {
		const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
		if (!googleClientId) {
			setShowGmailModal(true);
			return;
		}

		if (!(window as any).google?.accounts?.oauth2) {
			alert('Google Identity Services SDK is loading. Please verify connection.');
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
							alert('Gmail successfully connected!');
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

	// Generate WhatsApp QR Code Session
	const handleOpenQrModal = async () => {
		setShowQrModal(true);
		await handleRefreshQR();
	};

	const handleRefreshQR = async () => {
		setQrStatus('generating');
		try {
			const data = await generateWhatsAppQR(customPhone);
			setQrSession(data);
			setCountdown(data.ttl_seconds || 60);
			setQrStatus('waiting_scan');
		} catch (err: any) {
			alert(`Failed to generate QR code: ${err.message}`);
			setQrStatus('idle');
		}
	};

	// Copy Pairing Code
	const handleCopyPairingCode = () => {
		if (qrSession?.pairing_code) {
			navigator.clipboard.writeText(qrSession.pairing_code);
			setCopiedCode(true);
			setTimeout(() => setCopiedCode(false), 2000);
		}
	};

	// Confirm / Pair QR Device Link
	const handleConfirmQrPairing = async () => {
		if (!qrSession) return;
		setIsPairing(true);
		setQrStatus('pairing');
		try {
			await new Promise((res) => setTimeout(res, 1200));

			await confirmWhatsAppQR({
				session_id: qrSession.session_id,
				phone_number: customPhone,
				device_name: 'WhatsApp Web (Chrome / Multi-Device)',
				push_name: 'Connected WhatsApp Account',
			});

			setQrStatus('connected');
			setTimeout(() => {
				setShowQrModal(false);
				setQrStatus('idle');
				setIsPairing(false);
			}, 1500);
		} catch (err: any) {
			alert(`QR Pairing error: ${err.message}`);
			setQrStatus('waiting_scan');
			setIsPairing(false);
		}
	};

	const handleMetaSignupClick = async () => {
		setIsSubmittingMeta(true);
		try {
			const config = await fetchMetaConfig();
			const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || config.meta_app_id;
			const isMockMode = !metaAppId || (!process.env.NEXT_PUBLIC_META_APP_ID && config.is_mock_mode);

			if (isMockMode) {
				await exchangeMetaCode('mock_auth_code');
				alert('WhatsApp successfully connected via Meta (Development Sandbox Mode)!');
			} else {
				if (!(window as any).FB) {
					alert('Facebook SDK loading failed. Please verify connection.');
					setIsSubmittingMeta(false);
					return;
				}

				const handleSDKMessage = async (event: MessageEvent) => {
					if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
						return;
					}
					try {
						const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
						if (data?.type === 'WA_EMBEDDED_SIGNUP') {
							console.log('WhatsApp Embedded Signup event:', data);
						}
					} catch (err) {}
				};
				window.addEventListener('message', handleSDKMessage);

				const loginOptions: any = {
					response_type: 'code',
					override_default_response_type: true,
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
							meta_app_secret: metaAppSecret,
						})
							.then(() => {
								alert('WhatsApp successfully connected via Meta Embedded Signup!');
							})
							.catch((err: any) => {
								alert(`Failed to complete Meta integration: ${err.message}`);
							})
							.finally(() => {
								setIsSubmittingMeta(false);
							});
					} else {
						alert('Meta login cancelled or failed.');
						setIsSubmittingMeta(false);
					}
				}, loginOptions);
			}
		} catch (err: any) {
			alert(`Meta Config Error: ${err.message}`);
			setIsSubmittingMeta(false);
		}
	};

	const handleDisconnect = async (id: number, isStandardWa: boolean = false) => {
		if (window.confirm('Are you sure you want to disconnect this integration?')) {
			try {
				if (isStandardWa) {
					await disconnectWhatsApp();
				} else {
					await disconnectIntegration(id);
				}
			} catch (err) {}
		}
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold text-white tracking-tight">Integrations & Connectors</h1>
				<p className="text-sm text-slate-400 mt-1">
					Link your communication channels (Gmail & WhatsApp) to send automated outreach and campaign deliveries.
				</p>
			</div>

			{/* Grid of integrations */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6">
				{/* 1. GMAIL CARD */}
				<div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-6">
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-red-500/10 rounded-lg text-red-500 shrink-0">
									<Mail className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-base font-bold text-white">Gmail Connector</h3>
									<p className="text-xs text-slate-500 mt-0.5">Send bulk emails via Google API.</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
									gmailIntegration ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400' : 'bg-slate-850 border-slate-800 text-slate-400'
								}`}
							>
								{gmailIntegration ? 'Connected' : 'Not Connected'}
							</span>
						</div>

						{gmailIntegration ? (
							<div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-xs text-slate-400 space-y-2">
								<div className="flex justify-between items-center gap-2">
									<span className="shrink-0">Connected Email:</span>
									<span className="font-bold text-slate-200 truncate">{gmailIntegration.connected_email}</span>
								</div>
								<div className="flex justify-between items-center gap-2">
									<span>Auth Type:</span>
									<span className="font-medium text-slate-400">Google OAuth 2.0</span>
								</div>
							</div>
						) : (
							<p className="text-xs text-slate-400 leading-relaxed">
								Connect your business Gmail account to sync outboxes and authorize campaign email delivery.
							</p>
						)}
					</div>

					<div className="pt-4 border-t border-slate-800/60 flex justify-end">
						{gmailIntegration ? (
							<button
								onClick={() => handleDisconnect(gmailIntegration.id)}
								className="w-full bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800/20 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
							>
								Disconnect
							</button>
						) : (
							<button
								onClick={handleGoogleConnectClick}
								className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
							>
								Connect Gmail
							</button>
						)}
					</div>
				</div>

				{/* 2. STANDARD WHATSAPP (QR CODE SCAN) CARD */}
				<div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-6">
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
									<QrCode className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-base font-bold text-white">WhatsApp (Linked Devices)</h3>
									<p className="text-xs text-slate-500 mt-0.5">Link regular WhatsApp via QR Code scan.</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
									standardWhatsappIntegration
										? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400'
										: 'bg-slate-850 border-slate-800 text-slate-400'
								}`}
							>
								{standardWhatsappIntegration ? 'Connected' : 'Not Connected'}
							</span>
						</div>

						{standardWhatsappIntegration ? (
							<div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-xs text-slate-400 space-y-2">
								<div className="flex justify-between items-center gap-2">
									<span>Linked Phone:</span>
									<span className="font-bold text-emerald-400 truncate">{standardWhatsappIntegration.connected_phone}</span>
								</div>
								<div className="flex justify-between items-center gap-2">
									<span>Link Method:</span>
									<span className="font-medium text-slate-300">Linked Devices (QR)</span>
								</div>
								<div className="flex justify-between items-center gap-2">
									<span>Session Status:</span>
									<span className="flex items-center gap-1.5 text-emerald-400 font-medium">
										<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
										Active & Synced
									</span>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<p className="text-xs text-slate-400 leading-relaxed">
									Link standard WhatsApp or WhatsApp Business mobile accounts by scanning a dynamic QR code from your phone's{' '}
									<strong className="text-slate-300">Linked Devices</strong> settings.
								</p>
								<ul className="text-[11px] text-slate-500 space-y-1">
									<li className="flex items-center gap-1.5">
										<span className="text-emerald-500 font-bold">✓</span> No Meta developer setup required
									</li>
									<li className="flex items-center gap-1.5">
										<span className="text-emerald-500 font-bold">✓</span> Scannable QR code & 8-digit pairing code
									</li>
									<li className="flex items-center gap-1.5">
										<span className="text-emerald-500 font-bold">✓</span> Instant multi-device campaign dispatch
									</li>
								</ul>
							</div>
						)}
					</div>

					<div className="pt-4 border-t border-slate-800/60 flex justify-end">
						{standardWhatsappIntegration ? (
							<button
								onClick={() => handleDisconnect(standardWhatsappIntegration.id, true)}
								className="w-full bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800/20 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
							>
								Disconnect Device
							</button>
						) : (
							<button
								onClick={handleOpenQrModal}
								className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
							>
								<QrCode className="w-4 h-4" />
								<span>Connect via QR Code</span>
							</button>
						)}
					</div>
				</div>

				{/* 3. META WHATSAPP BUSINESS CARD */}
				<div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-6">
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
									<MessageSquare className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-base font-bold text-white">WhatsApp Business (Meta)</h3>
									<p className="text-xs text-slate-500 mt-0.5">Official Cloud API via Meta Signup.</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
									metaWhatsappIntegration
										? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400'
										: 'bg-slate-850 border-slate-800 text-slate-400'
								}`}
							>
								{metaWhatsappIntegration ? 'Connected' : 'Not Connected'}
							</span>
						</div>

						{metaWhatsappIntegration ? (
							<div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-xs text-slate-400 space-y-2">
								<div className="flex justify-between items-center gap-2">
									<span>Connected Phone:</span>
									<span className="font-bold text-slate-200 truncate">{metaWhatsappIntegration.connected_phone}</span>
								</div>
								{metaWhatsappIntegration.credentials?.business_name && (
									<div className="flex justify-between items-center gap-2">
										<span>Business Name:</span>
										<span className="font-bold text-slate-200 truncate">{metaWhatsappIntegration.credentials.business_name}</span>
									</div>
								)}
								{metaWhatsappIntegration.credentials?.waba_id && (
									<div className="flex justify-between items-center gap-2">
										<span>WABA ID:</span>
										<span className="font-mono text-slate-300 truncate max-w-[120px]">
											{metaWhatsappIntegration.credentials.waba_id}
										</span>
									</div>
								)}
							</div>
						) : (
							<div className="space-y-3">
								<p className="text-xs text-slate-400 leading-relaxed">
									Connect your official WhatsApp Business profile using Meta Embedded Signup for high-volume enterprise messaging.
								</p>
								<ul className="text-[11px] text-slate-500 space-y-1">
									<li className="flex items-center gap-1.5">
										<span className="text-blue-400 font-bold">✓</span> Meta Business verification & green badge support
									</li>
									<li className="flex items-center gap-1.5">
										<span className="text-blue-400 font-bold">✓</span> Official WhatsApp Cloud API infrastructure
									</li>
								</ul>
							</div>
						)}
					</div>

					<div className="pt-4 border-t border-slate-800/60 flex justify-end">
						{metaWhatsappIntegration ? (
							<button
								onClick={() => handleDisconnect(metaWhatsappIntegration.id)}
								className="w-full bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800/20 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
							>
								Disconnect
							</button>
						) : (
							<button
								onClick={handleMetaSignupClick}
								disabled={isSubmittingMeta}
								className="w-full justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-sm"
							>
								{isSubmittingMeta ? (
									<>
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
										<span>Connecting...</span>
									</>
								) : (
									<>
										<svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
											<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
										</svg>
										<span>Connect with Meta</span>
									</>
								)}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* POPUP MODAL: Standard WhatsApp QR Code & Pairing Code Scanning */}
			{showQrModal && (
				<div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
					<div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl relative">
						{/* Close Button */}
						<button
							onClick={() => setShowQrModal(false)}
							className="absolute top-5 right-5 p-2 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
						>
							<X className="w-5 h-5" />
						</button>

						{/* Modal Header */}
						<div className="flex items-center gap-3 mb-6">
							<div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
								<QrCode className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-lg font-bold text-white flex items-center gap-2">
									<span>Link WhatsApp Account</span>
									<span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
										Linked Devices
									</span>
								</h3>
								<p className="text-xs text-slate-400 mt-0.5">Scan QR Code or enter 8-digit pairing code on your mobile phone.</p>
							</div>
						</div>

						{/* Mode Switcher Tabs */}
						<div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
							<button
								onClick={() => setPairingMode('qr')}
								className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
									pairingMode === 'qr' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
								}`}
							>
								<QrCode className="w-4 h-4" />
								<span>Scan QR Code</span>
							</button>
							<button
								onClick={() => setPairingMode('code')}
								className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
									pairingMode === 'code' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
								}`}
							>
								<Hash className="w-4 h-4" />
								<span>8-Digit Pairing Code</span>
							</button>
						</div>

						{qrStatus === 'connected' ? (
							/* SUCCESS VIEW */
							<div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
								<div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
									<Check className="w-8 h-8 stroke-[3]" />
								</div>
								<h4 className="text-xl font-bold text-white">WhatsApp Connected Successfully!</h4>
								<p className="text-xs text-slate-300 max-w-sm">
									Your mobile device <strong className="text-emerald-400 font-mono">{customPhone}</strong> has been linked as an active WhatsApp session.
								</p>
							</div>
						) : pairingMode === 'qr' ? (
							/* QR SCANNING MAIN VIEW */
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
								{/* Left Column: Standard Scannable QR Code */}
								<div className="flex flex-col items-center space-y-4">
									{qrStatus === 'generating' ? (
										<div className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
											<Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
											<span className="text-xs font-semibold">Generating scannable QR code...</span>
										</div>
									) : (
										<>
											<DynamicQRCodeDisplay
												value={qrSession?.qr_code || '1@ref_code,pubkey_sample,client_id_sample'}
												expired={qrStatus === 'expired'}
												onRefresh={handleRefreshQR}
											/>

											{/* Expiration Bar */}
											<div className="w-full max-w-[240px] space-y-1.5">
												<div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
													<span className="flex items-center gap-1">
														<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
														Scan active
													</span>
													<span>{countdown}s remaining</span>
												</div>
												<div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
													<div
														className="h-full bg-emerald-500 transition-all duration-1000 ease-linear rounded-full"
														style={{ width: `${(countdown / 60) * 100}%` }}
													/>
												</div>
											</div>
										</>
									)}
								</div>

								{/* Right Column: Step-by-Step Instructions */}
								<div className="space-y-5">
									<h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
										<Smartphone className="w-4 h-4 text-emerald-400" />
										<span>How to connect on your phone:</span>
									</h4>

									<ol className="space-y-3.5 text-xs text-slate-300">
										<li className="flex items-start gap-3">
											<span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
												1
											</span>
											<span>
												Open <strong className="text-white">WhatsApp</strong> on your phone.
											</span>
										</li>
										<li className="flex items-start gap-3">
											<span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
												2
											</span>
											<span>
												Tap <strong className="text-white">Menu (⋮)</strong> on Android or <strong className="text-white">Settings (⚙)</strong> on iPhone.
											</span>
										</li>
										<li className="flex items-start gap-3">
											<span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
												3
											</span>
											<span>
												Select <strong className="text-emerald-400">Linked Devices</strong> and tap <strong className="text-white">Link a Device</strong>.
											</span>
										</li>
										<li className="flex items-start gap-3">
											<span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
												4
											</span>
											<span>Point camera at this screen to scan the QR code.</span>
										</li>
									</ol>

									{/* Simulated Scan Action Bar for Testing */}
									<div className="pt-4 border-t border-slate-800/80 space-y-3">
										<div>
											<label htmlFor="custom_phone" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
												Linked Phone Number (Testing / Simulator)
											</label>
											<input
												id="custom_phone"
												type="text"
												value={customPhone}
												onChange={(e) => setCustomPhone(e.target.value)}
												className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50"
											/>
										</div>

										<button
											onClick={handleConfirmQrPairing}
											disabled={isPairing || qrStatus === 'expired'}
											className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
										>
											{isPairing ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													<span>Pairing Device...</span>
												</>
											) : (
												<>
													<ShieldCheck className="w-4 h-4" />
													<span>Simulate QR Scan & Link Device</span>
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						) : (
							/* 8-DIGIT PAIRING CODE VIEW */
							<div className="space-y-6">
								<div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
									<span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
										Enter this 8-Digit Code in WhatsApp:
									</span>

									{/* 8-Digit Pairing Code Display */}
									<div className="flex items-center gap-3">
										<div className="text-2xl sm:text-3xl font-black font-mono tracking-[0.25em] text-emerald-400 bg-slate-900 px-6 py-3 rounded-xl border border-emerald-500/30 shadow-inner">
											{qrSession?.pairing_code || 'W82A-9X2L'}
										</div>
										<button
											onClick={handleCopyPairingCode}
											className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
											title="Copy Code"
										>
											{copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
										</button>
									</div>

									{copiedCode && <span className="text-[11px] font-bold text-emerald-400 animate-pulse">Copied to clipboard!</span>}
								</div>

								{/* Instructions for Pairing Code */}
								<div className="space-y-3">
									<h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
										<Smartphone className="w-4 h-4 text-emerald-400" />
										<span>Steps on your mobile phone:</span>
									</h4>

									<ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
										<li className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5">
											<span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
												1
											</span>
											<span>Open WhatsApp & go to <strong>Linked Devices</strong>.</span>
										</li>
										<li className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5">
											<span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
												2
											</span>
											<span>Tap <strong>Link a device</strong>.</span>
										</li>
										<li className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5">
											<span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
												3
											</span>
											<span>Tap <strong className="text-emerald-400">Link with phone number instead</strong> at the bottom.</span>
										</li>
										<li className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5">
											<span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
												4
											</span>
											<span>Type the 8-digit code shown above.</span>
										</li>
									</ol>

									<div className="pt-4 border-t border-slate-800/80">
										<button
											onClick={handleConfirmQrPairing}
											disabled={isPairing}
											className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
										>
											{isPairing ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													<span>Confirming Pairing...</span>
												</>
											) : (
												<>
													<ShieldCheck className="w-4 h-4" />
													<span>Complete Pairing & Link Account</span>
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* POPUP MODAL: Gmail Auth Simulation */}
			{showGmailModal && (
				<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
						<h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
							<Mail className="w-5 h-5 text-red-500" />
							<span>Connect Gmail (Google OAuth)</span>
						</h3>
						<p className="text-[11px] text-slate-400 mb-4">Grant permissions to send outreach emails on your behalf.</p>

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
								<span>This simulation bypasses Google Consent Page and logs in instantly.</span>
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
