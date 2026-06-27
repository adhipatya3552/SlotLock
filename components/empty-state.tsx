'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 py-12 px-4"
      style={{ animation: 'fade-up 0.5s ease-out' }}
    >
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-lg" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-3xl">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-center text-muted-foreground max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
