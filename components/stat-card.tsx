'use client';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: 'primary' | 'accent' | 'muted';
  delay?: number;
}

export function StatCard({ label, value, icon, color, delay = 0 }: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    muted: 'from-muted to-muted/40 text-muted-foreground',
  };

  return (
    <div
      className="group rounded-lg border border-border bg-card p-4 sm:p-6 transition-all duration-300 hover:border-ring/50 hover:shadow-md hover:-translate-y-0.5"
      style={{ animation: `fade-up 0.5s ease-out ${delay}ms backwards` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${colorClasses[color]} text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
