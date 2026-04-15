'use client';

import { Session } from '@/lib/types';

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

  const statusLabels = {
    idle: 'Idle',
    running: 'Running',
    done: 'Done',
    error: 'Error',
  };

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
        isActive 
          ? 'bg-blue-500/20 border border-blue-500/50' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full ${statusColors[session.status]}`} />
      
      {/* Session name and tag */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{session.name}</div>
        {session.projectTag && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {session.projectTag}
          </div>
        )}
      </div>

      {/* Status label */}
      <div className="text-xs text-gray-400 dark:text-gray-500 hidden group-hover:block">
        {statusLabels[session.status]}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}