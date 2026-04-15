'use client';

import { Session } from '@/lib/types';
import { Button } from '@heroui/react';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  const statusColors = {
    idle: 'bg-green-500',
    running: 'bg-yellow-500',
    done: 'bg-purple-500',
    error: 'bg-red-500',
  };

  const status = statusColors[session.status as keyof typeof statusColors] || statusColors.idle;

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
        isActive 
          ? 'bg-primary/10 border-primary/40' 
          : 'hover:bg-muted border-transparent'
      }`}
      onClick={onClick}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${status} flex-shrink-0`} />
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {session.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {session.messages?.length || 0} messages
        </p>
      </div>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </Button>
    </div>
  );
}
