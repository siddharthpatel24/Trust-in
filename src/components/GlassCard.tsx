import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div className={`
      relative backdrop-blur-2xl
      bg-white/70 dark:bg-slate-900/60
      border border-rose-200/40 dark:border-rose-500/20
      rounded-3xl
      shadow-xl dark:shadow-2xl dark:shadow-black/40
      ${hover ? 'hover:bg-white/80 dark:hover:bg-slate-800/70 hover:shadow-2xl hover:shadow-rose-500/10 dark:hover:shadow-rose-500/20 hover:scale-[1.01]' : ''}
      transition-all duration-500 ease-out animate-slide-up
      ${className}
    `}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-100/30 via-transparent to-amber-100/20 dark:from-rose-500/10 dark:to-amber-500/5 pointer-events-none" />
      {children}
    </div>
  );
};

export default GlassCard;
