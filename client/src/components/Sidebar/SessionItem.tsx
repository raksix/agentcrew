'use client';

import { Session } from '@/lib/types';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  const statusConfig = {
    idle: { color: 'bg-green-500', text: 'Ready', glow: 'shadow-green-500/30' },
    running: { color: 'bg-yellow-500', text: 'Working', glow: 'shadow-yellow-500/30 animate-pulse' },
    done: { color: 'bg-purple-500', text: 'Done', glow: 'shadow-purple-500/30' },
    error: { color: 'bg-red-500', text: 'Error', glow: 'shadow-red-500/30' },
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-primary/15 border border-primary/30 shadow-lg' 
          : 'hover:bg-accent border border-transparent hover:border-border/50'
      }`}
      onClick={onClick}
    >
      {/* Status indicator */}
      <div className={`w-2.5 h-2.5 rounded-full ${status.color} ${status.glow} flex-shrink-0`} />
      
      {/* Session info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {session.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {session.projectTag && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary/20 text-secondary-foreground">
              {session.projectTag}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {session.messages?.length || 0} msg
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          title="Delete session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
