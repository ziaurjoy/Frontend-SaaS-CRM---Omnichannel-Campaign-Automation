'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function MetaCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Read query parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error') || searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMsg(error);
      // Notify parent window of error
      if (window.opener) {
        window.opener.postMessage({ type: 'META_AUTH_ERROR', error }, '*');
      }
      return;
    }

    if (code) {
      setStatus('success');
      // Send auth code back to parent window
      if (window.opener) {
        window.opener.postMessage({ type: 'META_AUTH_CODE', code }, '*');
        // Close callback popup window
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        setStatus('error');
        setErrorMsg('Authentication window opened incorrectly. Parent window not found.');
      }
    } else {
      setStatus('error');
      setErrorMsg('No authorization code returned from Meta.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white text-center font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xl space-y-6">
        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Connecting with Meta</h2>
            <p className="text-xs text-slate-400">Exchanging authorization details. Please do not close this window...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-400">Connection Authorized!</h2>
            <p className="text-xs text-slate-400">Closing window and completing integration setup...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-rose-400">Connection Failed</h2>
            <p className="text-xs text-rose-300 leading-relaxed bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg">
              {errorMsg}
            </p>
            <button
              onClick={() => window.close()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
