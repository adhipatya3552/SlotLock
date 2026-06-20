import Link from 'next/link';

export function Header({ title = 'SlotLock' }: { title?: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            S
          </div>
          <span className="text-xl font-semibold text-foreground">{title}</span>
        </Link>
      </div>
    </header>
  );
}
