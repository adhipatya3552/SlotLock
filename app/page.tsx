import Link from 'next/link';
import { SessionCTA } from '@/components/session-cta';
import { Header } from '@/components/header';
import { BookingDemo } from '@/components/booking-demo';
import { FeatureCard } from '@/components/feature-card';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080A0F] mesh-bg text-white selection:bg-primary/30 selection:text-white">
      <Header />
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-float-orb-1" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/8 blur-[150px] pointer-events-none animate-float-orb-2" />

      <main className="relative z-10 px-6 mx-auto max-w-5xl pt-16 pb-24">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left animate-slide-up">
            {/* AWS Aurora DSQL Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Powered by AWS Aurora DSQL
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-[1.1]">
              Appointments that <span className="bg-gradient-to-r from-primary via-[#5EEAD4] to-primary bg-clip-text text-transparent animate-pulse-glow">never double-book.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Fast, global scheduling with absolute consistency. Powered by Amazon Aurora DSQL to make race conditions physically impossible.
            </p>

            <SessionCTA />
            
            {/* Value Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 text-sm">
              <div>
                <p className="font-bold text-white text-lg">0ms</p>
                <p className="text-muted-foreground text-xs mt-0.5">Double-Booking Risk</p>
              </div>
              <div>
                <p className="font-bold text-white text-lg">100%</p>
                <p className="text-muted-foreground text-xs mt-0.5">Strongly Consistent</p>
              </div>
              <div>
                <p className="font-bold text-white text-lg">Multi-Region</p>
                <p className="text-muted-foreground text-xs mt-0.5">Active-Active Sync</p>
              </div>
            </div>
          </div>

          {/* Hero Right Interactive Demo */}
          <div className="lg:col-span-5 flex justify-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-30 pointer-events-none rounded-full" />
              <BookingDemo />
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="features" className="pt-32 pb-16">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Why traditional scheduling is broken
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Most apps check availability in code before booking. If two clients click "book" at the exact same millisecond, both succeed, causing embarrassing double-bookings.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon="⚡"
              title="Postgres Compatible"
              description="Built on SQL constraints. Instead of flaky app checks, we run a single, atomic database update query."
              delay={0}
              iconColor="primary"
            />
            <FeatureCard
              icon="🔒"
              title="AWS Aurora DSQL"
              description="A multi-region serverless SQL engine that distributes transactions globally with strict ACID properties."
              delay={100}
              iconColor="accent"
            />
            <FeatureCard
              icon="💸"
              title="Guaranteed Checkout"
              description="Accept security deposits via integrated mock credit card checkout. Lock the slot only upon successful deposit."
              delay={200}
              iconColor="primary"
            />
          </div>
        </section>

        {/* Technical Deep Dive section */}
        <section className="mt-20 border border-white/5 rounded-2xl bg-white/[0.02] p-8 md:p-12 relative overflow-hidden glass-card">
          <div className="absolute top-[-50%] right-[-30%] w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="text-primary font-bold text-xs uppercase tracking-wider">
                Under the Hood
              </div>
              <h3 className="text-2xl font-bold text-white">
                How DSQL physically guarantees 100% lock safety
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                SlotLock uses a database-level unique constraint on `(business_id, start_time)` when a slot is booked. Even if two transactions run simultaneously across opposite sides of the planet, AWS Aurora DSQL coordinates consensus synchronously, allowing exactly one query to update the slot while raising a constraint violation error for the other.
              </p>
              <div className="pt-2">
                <Link
                  href="/resilience"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline hover:text-primary-foreground hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-all"
                >
                  Simulate a race condition →
                </Link>
              </div>
            </div>
            
            <div className="md:col-span-5">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-300 shadow-inner">
                <p className="text-slate-500 mb-2">// Atomic transaction query</p>
                <p className="text-emerald-400">UPDATE</p> <p className="text-slate-100">slots</p>
                <p className="text-emerald-400">SET</p> <p className="text-slate-100">status = <span className="text-amber-300">'booked'</span>,</p>
                <p className="text-slate-100">    customer_name = $1,</p>
                <p className="text-slate-100">    customer_contact = $2</p>
                <p className="text-emerald-400">WHERE</p> <p className="text-slate-100">id = $3</p>
                <p className="text-emerald-400">AND</p> <p className="text-slate-100">status = <span className="text-amber-300">'open'</span>;</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
