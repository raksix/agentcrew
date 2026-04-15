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
  const statusConfig = {
    idle: { color: 'bg-green-500', label: 'Ready' },
    running: { color: 'bg-yellow-500', label: 'Working' },
    done: { color: 'bg-purple-500', label: 'Done' },
    error: { color: 'bg-red-500', label: 'Error' },
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive 
          ? 'bg-primary/20 border border-primary/40' 
          : 'hover:bg-muted border border-transparent'
      }`}
      onClick={onClick}
    >
      {/* Status indicator */}
      <div className={`w-2.5 h-2.5 rounded-full ${status.color} flex-shrink-0`} />
      
      {/* Session info - centered */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {session.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {session.projectTag && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary/20 text-secondary-foreground">
              {session.projectTag}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {session.messages?.length || 0}
          </span>
        </div>
      </div>

      {/* Delete button - centered */}
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className={`opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
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
