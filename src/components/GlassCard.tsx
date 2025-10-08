import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div className={`
      relative backdrop-blur-xl bg-white/80 dark:bg-black/40 
      border border-white/20 dark:border-white/10 
      rounded-3xl shadow-xl dark:shadow-2xl
      ${hover ? 'hover:bg-white/90 dark:hover:bg-black/50 hover:shadow-2xl dark:hover:shadow-purple-500/10' : ''}
      transition-all duration-500 ease-out
      ${className}
    `}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none" />
      {children}
    </div>
  );
};

export default GlassCard;