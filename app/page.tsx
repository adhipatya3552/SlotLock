import Link from 'next/link';
import { Header } from '@/components/header';
import { BookingDemo } from '@/components/booking-demo';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gradient-to-br from-background via-secondary to-background px-4 relative overflow-hidden">
        {/* Animated gradient orb background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-float-orb opacity-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl relative z-10">
          {/* Left side: Text */}
          <div className="text-left lg:text-left">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Book appointments that never double-book
            </h1>
            <p className="mt-6 text-xl text-muted-foreground sm:text-2xl">
              Simple, reliable scheduling for salons, tutors, and doctors.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-primary px-8 py-3 font-semibold text-primary transition hover:bg-primary/5"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right side: Interactive demo */}
          <div className="hidden lg:flex justify-center">
            <BookingDemo />
          </div>
        </div>

        <div id="features" className="mt-20 w-full max-w-4xl py-20">
          <h2 className="text-center text-3xl font-bold text-foreground mb-12">Why SlotLock?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Double-Booking</h3>
              <p className="mt-2 text-muted-foreground">Each slot can only be booked once. Scheduling conflicts are impossible.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent font-bold">
                ⚡
              </div>
              <h3 className="text-lg font-semibold text-foreground">Instant Setup</h3>
              <p className="mt-2 text-muted-foreground">Create an account and share your booking link in minutes. No complex configuration.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                📱
              </div>
              <h3 className="text-lg font-semibold text-foreground">Mobile-Friendly</h3>
              <p className="mt-2 text-muted-foreground">Beautiful on any device. Your customers can book from anywhere, anytime.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
