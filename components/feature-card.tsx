'use client';

import { useEffect, useRef, useState } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
  iconColor: 'primary' | 'accent';
}

export function FeatureCard({ icon, title, description, delay = 0, iconColor }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const colorClasses = {
    primary: 'from-primary/20 to-primary/10 text-primary',
    accent: 'from-accent/20 to-accent/10 text-accent',
  };

  return (
    <div
      ref={ref}
      className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-ring hover:shadow-lg"
      style={{
        animation: isVisible ? `fade-up 0.6s ease-out ${delay}ms backwards` : 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glowing icon circle */}
      <div className="mb-6 relative">
        {/* Background blur glow */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl bg-gradient-to-br ${colorClasses[iconColor]} opacity-40 transition-all duration-300 ${
            isHovered ? 'scale-125 opacity-60' : 'scale-100'
          }`}
          style={{ width: '64px', height: '64px' }}
        />

        {/* Icon container */}
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${colorClasses[iconColor]} text-2xl font-bold transition-all duration-300 ${
            isHovered ? 'scale-110 shadow-lg' : 'scale-100'
          }`}
          style={{
            boxShadow: isHovered
              ? `0 0 30px rgba(var(--ring-rgb), 0.5)`
              : `0 0 15px rgba(var(--ring-rgb), 0.2)`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground transition-all duration-300">
        {title}
      </h3>
      <p className="mt-2 text-muted-foreground">{description}</p>

      {/* Hover effect: subtle border glow */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300"
        style={{
          border: '1px solid transparent',
          opacity: isHovered ? 1 : 0,
          boxShadow: `inset 0 0 20px rgba(var(--ring-rgb), 0.2)`,
        }}
      />
    </div>
  );
}
