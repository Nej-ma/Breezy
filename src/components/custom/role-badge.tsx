import React from 'react';
import { cn } from '@/lib/utils';

export type Role = 'user' | 'moderator' | 'admin';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'A',
    color: 'from-yellow-400 via-yellow-500 to-yellow-600',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-300',
    shadowColor: 'shadow-yellow-500/30',
    title: 'Administrateur'
  },
  moderator: {
    label: 'M',
    color: 'from-slate-300 via-slate-400 to-slate-500',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-300',
    shadowColor: 'shadow-slate-500/30',
    title: 'Modérateur'
  },
  user: {
    label: '',
    color: '',
    textColor: '',
    borderColor: '',
    shadowColor: '',
    title: ''
  }
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (role === 'user') {
    return null; // Pas de badge pour les utilisateurs normaux
  }

  const config = roleConfig[role];
  
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
        "bg-gradient-to-br",
        config.color,
        config.textColor,
        config.borderColor,
        config.shadowColor,
        "border-2 shadow-lg",
        "transition-all duration-200 hover:scale-110",
        className
      )}
      title={config.title}
    >
      {config.label}
    </div>
  );
}

export default RoleBadge;
