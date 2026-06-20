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
          type: formData.businessType,
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
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-background via-secondary to-background px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Create your business</h1>
          <p className="mb-6 text-muted-foreground">Set up your SlotLock account and start accepting bookings.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-1">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                name="businessName"
                required
                placeholder="e.g., Bloom Hair Studio"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-medium text-foreground mb-1">
                Owner Email
              </label>
              <input
                id="ownerEmail"
                type="email"
                name="ownerEmail"
                required
                placeholder="you@example.com"
                value={formData.ownerEmail}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-foreground mb-1">
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="salon">Salon</option>
                <option value="tutor">Tutor</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/" className="font-semibold text-primary hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
