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
    color: 'from-yellow-300 via-yellow-400 to-yellow-500',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-400',
    shadowColor: 'shadow-yellow-400/40',
    title: 'Administrateur',
    glowColor: 'shadow-yellow-300/60'
  },
  moderator: {
    label: 'M',
    color: 'from-gray-200 via-gray-300 to-gray-400',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    shadowColor: 'shadow-gray-400/40',
    title: 'Modérateur',
    glowColor: 'shadow-gray-300/60'
  },
  user: {
    label: '',
    color: '',
    textColor: '',
    borderColor: '',
    shadowColor: '',
    title: '',
    glowColor: ''
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
        "relative inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
        "bg-gradient-to-br",
        config.color,
        config.textColor,
        config.borderColor,
        config.shadowColor,
        "border-2 shadow-lg",
        "transition-all duration-300 hover:scale-110 hover:rotate-12",
        "animate-pulse hover:animate-none",
        // Add cute glow effect
        `hover:${config.glowColor}`,
        className
      )}
      title={config.title}
      style={{
        filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.3))',
      }}
    >
      {config.label}
      {/* Cute sparkle effect */}
      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-80 animate-ping" />
    </div>
  );
}

export default RoleBadge;
