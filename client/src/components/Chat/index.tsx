'use client';

import { Session } from '@/lib/types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatAreaProps {
  session: Session | null;
  streamingOutput: string;
  onSendMessage: (content: string) => void;
  onStop: () => void;
  queuedMessages?: number;
}

export function ChatArea({ session, streamingOutput, onSendMessage, onStop, queuedMessages = 0 }: ChatAreaProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
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

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{session.name}</h2>
          <span className={`text-sm ${statusColors[session.status as keyof typeof statusColors]}`}>
            {session.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {queuedMessages > 0 && (
            <div className="text-sm bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full">
              {queuedMessages} message{queuedMessages > 1 ? 's' : ''} queued
            </div>
          )}
          {session.status === 'running' && (
            <div className="animate-pulse text-yellow-500">Claude Code is working...</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={session.messages || []} streamingOutput={streamingOutput} />

      {/* Input - always enabled, shows queue count if running */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStop}
        disabled={false}
        isRunning={session.status === 'running'}
        queuedCount={queuedMessages}
      />
    </div>
  );
}
