'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerEmail: '',
    businessType: 'salon',
  });
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.businessName,
          ownerEmail: formData.ownerEmail,
          type: formData.businessType === 'others' ? customBusinessType : formData.businessType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create business');
      }

      const business = await response.json();
      router.push(`/dashboard/${business.id}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] mesh-bg text-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-stretch">
        <div className="mx-auto max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 px-6 py-12 items-center">
          
          {/* Left Side: Brand features */}
          <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-6 text-left animate-slide-up">
            <div className="space-y-2">
              <span className="text-primary font-bold text-xs uppercase tracking-wider">Join SlotLock</span>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Power your booking engine with active-active resilience.
              </h1>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create an account for your business in seconds. Lock down slots atomically, eliminate race conditions, and offer a smooth booking layout to your clients.
            </p>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">✓</span>
                <span>Synchronous multi-region ACID safety</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">✓</span>
                <span>Custom schedule widgets for your clients</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">✓</span>
                <span>Mock credit card deposit locks</span>
              </li>
            </ul>
          </div>

          {/* Right Side: Signup Form */}
          <div className="col-span-1 md:col-span-6 flex justify-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-full max-w-md rounded-xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl glass-card space-y-6">
              
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl font-bold text-white">Get Started</h2>
                <p className="text-xs text-muted-foreground">Setup your business profile to open your calendar.</p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <label htmlFor="businessName" className="text-xs font-semibold text-slate-300">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    name="businessName"
                    required
                    placeholder="e.g. Bloom Hair Studio"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-muted-foreground glass-input focus:outline-none"
                  />
                </div>

                {/* Owner Email */}
                <div className="space-y-1.5">
                  <label htmlFor="ownerEmail" className="text-xs font-semibold text-slate-300">
                    Owner Email
                  </label>
                  <input
                    id="ownerEmail"
                    type="email"
                    name="ownerEmail"
                    required
                    placeholder="owner@example.com"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-muted-foreground glass-input focus:outline-none"
                  />
                </div>

                {/* Business Type */}
                <div className="space-y-1.5">
                  <label htmlFor="businessType" className="text-xs font-semibold text-slate-300">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-300 glass-input focus:outline-none cursor-pointer"
                  >
                    <option value="salon" className="bg-[#080A0F] text-white">Salon</option>
                    <option value="tutor" className="bg-[#080A0F] text-white">Tutor</option>
                    <option value="doctor" className="bg-[#080A0F] text-white">Doctor</option>
                    <option value="others" className="bg-[#080A0F] text-white">Others</option>
                  </select>
                </div>

                {formData.businessType === 'others' && (
                  <div className="space-y-1.5 animate-slide-up">
                    <label htmlFor="customBusinessType" className="text-xs font-semibold text-slate-300">
                      Specify Business Type
                    </label>
                    <input
                      id="customBusinessType"
                      type="text"
                      required
                      placeholder="e.g. Barber, Consultant, Studio"
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-muted-foreground glass-input focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border border-primary-foreground/30 border-t-primary-foreground" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Business Calendar'
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-muted-foreground">
                Already registered?{' '}
                <Link href="/" className="font-semibold text-primary hover:underline">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
