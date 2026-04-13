'use client';

import { Session } from '@/lib/types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatAreaProps {
  session: Session | null;
  streamingOutput: string;
  onSendMessage: (content: string) => void;
  onStop: () => void;
}

export function ChatArea({ session, streamingOutput, onSendMessage, onStop }: ChatAreaProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">👈</div>
          <p className="text-lg">Select a session to start</p>
          <p className="text-sm">or create a new one from the sidebar</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    idle: 'text-green-500',
    running: 'text-yellow-500',
    done: 'text-purple-500',
    error: 'text-red-500',
  };

  const statusLabels = {
    idle: '🟢 Idle',
    running: '🟡 Running',
    done: '🟣 Done',
    error: '🔴 Error',
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{session.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-sm ${statusColors[session.status]}`}>
              {statusLabels[session.status]}
            </span>
            {session.projectTag && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                {session.projectTag}
              </span>
            )}
          </div>
        </div>
        {session.status === 'running' && (
          <div className="animate-pulse text-yellow-500 text-sm">
            Claude Code is working...
          </div>
        )}
      </div>

      {/* Messages */}
      <MessageList messages={session.messages} streamingOutput={streamingOutput} />

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStop}
        disabled={session.status === 'running'}
        isRunning={session.status === 'running'}
      />
    </div>
  );
}