'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SessionCTA() {
  const [bizId, setBizId] = useState<string | null>(null);
  const [bizName, setBizName] = useState<string | null>(null);

  useEffect(() => {
    setBizId(localStorage.getItem('slotlock_business_id'));
    setBizName(localStorage.getItem('slotlock_business_name'));
  }, []);

  if (bizId) {
    return (
      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href={`/dashboard/${bizId}`}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to My Dashboard →
        </Link>
        <p className="self-center text-xs text-muted-foreground">
          Signed in as <span className="text-white font-medium">{bizName}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 pt-2">
      <Link
        href="/signup"
        className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98]"
      >
        Create Your Account
      </Link>
      <Link
        href="/resilience"
        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-semibold transition-all hover:border-white/20 hover:scale-[1.02]"
      >
        Explore DSQL Resilience
      </Link>
    </div>
  );
}
