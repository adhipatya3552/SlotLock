'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header({ title = 'SlotLock' }: { title?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [savedBizId, setSavedBizId] = useState<string | null>(null);
  const [savedBizName, setSavedBizName] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Read saved session from localStorage
  useEffect(() => {
    const id = localStorage.getItem('slotlock_business_id');
    const name = localStorage.getItem('slotlock_business_name');
    if (id) setSavedBizId(id);
    if (name) setSavedBizName(name);
  }, [pathname]); // Re-check on every page change

  const handleLogout = () => {
    localStorage.removeItem('slotlock_business_id');
    localStorage.removeItem('slotlock_business_name');
    setSavedBizId(null);
    setSavedBizName(null);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/5 bg-[#080A0F]/70 backdrop-blur-md shadow-lg shadow-black/20'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-primary blur-md opacity-30 transition-opacity duration-300 group-hover:opacity-60 animate-glow-pulse" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-lg transition-transform duration-300 group-hover:scale-105">
              🔒
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            {title}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-primary ${
              pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            href="/resilience"
            className={`flex items-center gap-1.5 transition-colors hover:text-primary ${
              pathname === '/resilience' ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" />
            DSQL Demo
          </Link>

          {savedBizId ? (
            // Logged-in state: show dashboard link + logout
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/${savedBizId}`}
                className="rounded-lg bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs text-primary transition-all hover:bg-primary hover:text-primary-foreground font-semibold"
              >
                {savedBizName ? `${savedBizName.split(' ')[0]}'s Dashboard` : 'My Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-white transition-colors px-1"
                title="Sign out"
              >
                ✕
              </button>
            </div>
          ) : (
            // Logged-out state: show Register button
            <Link
              href="/signup"
              className="rounded-lg bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs text-primary transition-all hover:bg-primary hover:text-primary-foreground font-semibold"
            >
              Register Business
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
