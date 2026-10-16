import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (priority) {
    case 'Kritis':
      badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
      break;
    case 'Tinggi':
      badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'Sedang':
      badgeStyle = 'bg-[#EFF8FF] text-[#1765B3] border-[#B8DEFF]';
      break;
    case 'Rendah':
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${badgeStyle} ${sizeClasses} whitespace-nowrap`}
    >
      {priority}
    </span>
  );
};
