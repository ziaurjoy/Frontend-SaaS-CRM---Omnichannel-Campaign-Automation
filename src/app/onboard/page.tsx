'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Building2, User, Globe, ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { token, user, onboard, loading, error, clearError } = useStore();
  const [step, setStep] = useState(1);

  // Step 1: User Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Step 2: Business Setup
  const [businessName, setBusinessName] = useState('');
  const [businessLogo, setBusinessLogo] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');

  const [formError, setFormError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      router.push('/');
    } else if (user && user.first_name && step === 1) {
      // If user profile is already populated, prefill fields
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhoneNumber(user.phone_number || '');
      setTimezone(user.timezone || 'UTC');
      setProfilePhoto(user.profile_photo || '');
    }
  }, [token, user, router, step]);

  const handleNext = () => {
    setFormError('');
    if (step === 1) {
      if (!firstName || !lastName) {
        setFormError('First Name and Last Name are required.');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    setFormError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!businessName) {
      setFormError('Business name is required.');
      return;
    }

    try {
      await onboard({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        timezone,
        profile_photo: profilePhoto,
        business_name: businessName,
        business_logo: businessLogo,
        industry,
        website: website || null,
        country,
        address,
      });
      router.push('/dashboard');
    } catch (err: any) {
      // error is set in store
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-slate-100">
        
        {/* Header and Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
              Setup Workspace
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Step {step} of 2
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === 1 ? 'Tell us about yourself' : 'Configure your business'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {step === 1 
              ? 'Complete your profile details to personalize your workspace.' 
              : 'Add business information to initialize your CRM pipeline.'}
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {(formError || error) && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-lg text-sm text-red-200">
            {formError || error}
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: User Profile Form */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="+1 (555) 012-3456"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">Eastern Time (EST/EDT)</option>
                <option value="America/Chicago">Central Time (CST/CDT)</option>
                <option value="America/Denver">Mountain Time (MST/MDT)</option>
                <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET/CEST)</option>
                <option value="Asia/Dhaka">Dhaka (GMT+6)</option>
                <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* STEP 2: Business Setup Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="business_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  id="business_name"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Industry
                </label>
                <input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Software"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="United States"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="https://acme.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Office Address
              </label>
              <textarea
                id="address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="123 Silicon Alley, Suite 400"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading.onboard}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {loading.onboard ? (
                  <span>Creating...</span>
                ) : (
                  <>
                    <span>Finish</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
