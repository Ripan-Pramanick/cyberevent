import React from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';

interface CyberLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const CyberLogo: React.FC<CyberLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  const innerIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Event Management Emblem */}
      <div className="relative group shrink-0">
        {/* Ambient Gradient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300" />
        
        {/* Core Icon Container */}
        <div className={`relative ${iconSizes[size]} rounded-xl bg-slate-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/40 overflow-hidden`}>
          {/* Subtle Grid lines behind */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:6px_6px]" />
          
          {/* Event Calendar & Sparkle Icon */}
          <div className="relative z-10 flex items-center justify-center">
            <CalendarDays className={`${innerIconSizes[size]} text-cyan-400 stroke-[2]`} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400">Flow</span>
          </span>
          <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 uppercase">
            OS
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate">
            Event Management & Production Suite
          </p>
        )}
      </div>
    </div>
  );
};
