import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';
  let indicator = 'bg-slate-500';

  switch (priority) {
    case 'Kritis':
      badgeStyle = 'bg-rose-50 text-rose-950 border-rose-300 font-bold';
      indicator = 'bg-rose-600';
      break;
    case 'Tinggi':
      badgeStyle = 'bg-orange-50 text-orange-950 border-orange-300 font-semibold';
      indicator = 'bg-orange-500';
      break;
    case 'Sedang':
      badgeStyle = 'bg-[#EFF8FF] text-[#0A3D73] border-[#B8DEFF] font-semibold';
      indicator = 'bg-[#2589E8]';
      break;
    case 'Rendah':
      badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
      indicator = 'bg-slate-400';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${badgeStyle} ${sizeClasses} whitespace-nowrap shadow-2xs select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${indicator} shrink-0`} />
      <span>{priority}</span>
    </span>
  );
};
