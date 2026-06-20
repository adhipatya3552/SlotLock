'use client';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: 'primary' | 'accent' | 'muted';
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    muted: 'bg-muted/50 text-muted-foreground',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]} text-xl sm:text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
