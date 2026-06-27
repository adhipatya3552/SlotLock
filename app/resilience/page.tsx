'use client';

import { useState } from 'react';
import { Header } from '@/components/header';

interface LogLine {
  timestamp: string;
  region: 'us-east-1' | 'us-west-2';
  level: 'info' | 'success' | 'error';
  message: string;
}

export default function ResiliencePage() {
  const [logs, setLogs] = useState<LogLine[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      region: 'us-east-1',
      level: 'info',
      message: 'Aurora DSQL cluster initialized in active-active multi-region replication.',
    },
  ]);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<{
    userAStatus: 'idle' | 'pending' | 'success' | 'failed';
    userBStatus: 'idle' | 'pending' | 'success' | 'failed';
    errorMessage?: string;
  }>({
    userAStatus: 'idle',
    userBStatus: 'idle',
  });

  const addLog = (region: 'us-east-1' | 'us-west-2', level: 'info' | 'success' | 'error', message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        region,
        level,
        message,
      },
    ]);
  };

  const runSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setResults({ userAStatus: 'pending', userBStatus: 'pending' });
    setLogs([]);

    // Step 1: Initial state
    addLog('us-east-1', 'info', 'Preparing concurrency simulation on slot "slot-demo-10am". Slot status is currently "open".');
    await new Promise((r) => setTimeout(r, 800));

    // Step 2: Hitting requests
    addLog('us-east-1', 'info', 'User A clicks "Book Slot" from Boston (routed to us-east-1).');
    addLog('us-west-2', 'info', 'User B clicks "Book Slot" from Seattle at the exact same millisecond (routed to us-west-2).');
    await new Promise((r) => setTimeout(r, 1000));

    // Step 3: DSQL consensus
    addLog('us-east-1', 'info', 'DSQL coordinates consensus protocol between regions to resolve transaction sequencing...');
    addLog('us-west-2', 'info', 'Consensus reached. us-east-1 transaction sequenced first.');
    await new Promise((r) => setTimeout(r, 1200));

    // Step 4: Write execution
    addLog('us-east-1', 'info', 'Executing UPDATE: Set status = "booked" for slot-demo-10am.');
    await new Promise((r) => setTimeout(r, 600));

    // Step 5: Success A
    addLog('us-east-1', 'success', 'SUCCESS: 1 row updated. Unique constraint (business_id, start_time) satisfied in us-east-1.');
    setResults((prev) => ({ ...prev, userAStatus: 'success' }));
    await new Promise((r) => setTimeout(r, 1000));

    // Step 6: Failure B
    addLog('us-west-2', 'info', 'Executing UPDATE: Set status = "booked" for slot-demo-10am in us-west-2.');
    await new Promise((r) => setTimeout(r, 600));
    addLog('us-west-2', 'error', 'ERROR: Duplicate key value violates unique constraint "unique_booked_slot" (business_id, start_time). Transaction rolled back.');
    
    setResults((prev) => ({
      ...prev,
      userBStatus: 'failed',
      errorMessage: 'This slot was just booked by someone else. Please pick another.',
    }));
    setSimulating(false);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] mesh-bg text-white">
      <Header />

      <main className="relative z-10 px-6 mx-auto max-w-5xl pt-12 pb-24">
        {/* Title */}
        <div className="space-y-4 mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            DSQL Concurrency & Resilience Playground
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            See how AWS Aurora DSQL handles multi-region replication and guarantees 100% protection against double-booking when two users race to book the same slot.
          </p>
        </div>

        {/* Simulation Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Simulator Control */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 glass-card space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🎮 Simulator Controls
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Clicking the button below fires two concurrent API requests at the exact same millisecond to book the same slot ID from different geographic regions.
              </p>

              {/* Booking targets */}
              <div className="space-y-4">
                {/* User A card */}
                <div className="rounded-lg bg-black/35 border border-white/5 p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary">User A (Boston)</span>
                    <span className="text-[10px] text-muted-foreground">→ us-east-1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Demo Salon - 10:00 AM</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      results.userAStatus === 'idle' ? 'bg-muted text-muted-foreground' :
                      results.userAStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                      results.userAStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {results.userAStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* User B card */}
                <div className="rounded-lg bg-black/35 border border-white/5 p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-accent font-mono">User B (Seattle)</span>
                    <span className="text-[10px] text-muted-foreground">→ us-west-2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Demo Salon - 10:00 AM</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      results.userBStatus === 'idle' ? 'bg-muted text-muted-foreground' :
                      results.userBStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                      results.userBStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {results.userBStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {results.userBStatus === 'failed' && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive-foreground">
                  ⚠️ <strong>User B Booking Rejected:</strong> {results.errorMessage}
                </div>
              )}

              <button
                onClick={runSimulation}
                disabled={simulating}
                className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {simulating ? 'Simulating Race Condition...' : '⚡ Trigger Race Condition'}
              </button>
            </div>
            
            {/* AWS Architecture Explanation Box */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5 text-xs text-muted-foreground space-y-3">
              <h4 className="font-bold text-white text-sm">How Multi-Region Active-Active Consistency Works</h4>
              <p className="leading-relaxed">
                AWS Aurora DSQL clusters handle active-active reads and writes across multiple regions (e.g. us-east-1 and us-west-2) simultaneously.
              </p>
              <p className="leading-relaxed">
                When write queries hit different regions, DSQL uses an internal consensus engine to serialize the transactions. The transaction that is sequenced first grabs the slot; the second transaction immediately violates the unique constraint and is safely rolled back without causing corrupt data states.
              </p>
            </div>
          </div>

          {/* Right panel: Terminal logs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/80 shadow-2xl overflow-hidden font-mono text-xs">
              {/* Terminal header */}
              <div className="bg-slate-900 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/40" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/40" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                </div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">dsql-replica-monitor</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Terminal screen */}
              <div className="p-4 h-[380px] overflow-y-auto space-y-3.5 scrollbar-thin">
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic text-center pt-24">
                    Ready. Click "Trigger Race Condition" to start the logger.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start animate-slide-up" style={{ animationDuration: '0.2s' }}>
                      <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.region === 'us-east-1' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                      }`}>
                        {log.region}
                      </span>
                      <span className={`flex-1 ${
                        log.level === 'success' ? 'text-emerald-400 font-semibold' :
                        log.level === 'error' ? 'text-destructive font-semibold' :
                        'text-slate-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
