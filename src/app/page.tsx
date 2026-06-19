'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Lock, Mail, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { token, login, register, loading, error, clearError, user } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      if (user && !user.first_name) {
        router.push('/onboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!username || !password) {
      setFormError('Username and password are required.');
      return;
    }

    try {
      if (isLogin) {
        await login(username, password);
        // Successful login will trigger redirection via useEffect
      } else {
        if (!email) {
          setFormError('Email is required for registration.');
          return;
        }
        await register({
          username,
          password,
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        });
        setIsLogin(true);
        setFormError('Registration successful! Please login.');
      }
    } catch (err: any) {
      // Errors are handled in the store and exposed via `error` state
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-indigo-900/30 glass">
        
        {/* Left Side: Product branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-b from-indigo-900/50 to-indigo-950/70 border-r border-indigo-900/20 text-white">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
              OmniCampaign
            </h1>
            <p className="mt-2 text-indigo-200/80 text-sm">
              SaaS CRM & Omnichannel Campaign Automation
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Logical Multi-Tenant Isolation</h3>
                <p className="text-xs text-indigo-200/70">Completely secure workspaces for every business member.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Google Places Extraction</h3>
                <p className="text-xs text-indigo-200/70">Instantly scrape, enrich, and import localized B2B leads.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">WhatsApp & Email Campaigns</h3>
                <p className="text-xs text-indigo-200/70">Schedule and run bulk communications using variable templates.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-indigo-200/50">
            &copy; 2026 OmniCampaign Inc. All rights reserved.
          </p>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-slate-950/80 text-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isLogin ? 'Sign in to workspace' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError('');
                  clearError();
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {(formError || error) && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-lg text-sm text-red-200">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="demouser"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required={!isLogin}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                    <input
                      id="phone_number"
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading.login || loading.register}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.login || loading.register ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
