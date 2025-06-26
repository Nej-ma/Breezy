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
    color: 'text-red-600',
    title: 'Administrateur'
  },
  moderator: {
    label: 'M',
    color: 'text-blue-600',
    title: 'Modérateur'
  },
  user: {
    label: '',
    color: '',
    title: ''
  }
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (role === 'user') {
    return null;
  }

  const config = roleConfig[role];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded-full bg-gray-100",
        config.color,
        className
      )}
      title={config.title}
    >
      {config.label}
    </span>
  );
}

export default RoleBadge;