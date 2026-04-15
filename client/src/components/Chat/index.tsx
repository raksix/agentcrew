'use client';

import { Session } from '@/lib/types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Button } from '@heroui/react';

interface ChatAreaProps {
  session: Session | null;
  streamingOutput: string;
  onSendMessage: (content: string) => void;
  onStop: () => void;
  queuedMessages?: number;
  isConnected?: boolean;
}

export function ChatArea({ session, streamingOutput, onSendMessage, onStop, queuedMessages = 0, isConnected = false }: ChatAreaProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">AgentCrew</h2>
          <p className="text-sm text-muted-foreground">Select a session to start</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    idle: { color: 'bg-green-500', text: 'Ready' },
    running: { color: 'bg-yellow-500', text: 'Working...' },
    done: { color: 'bg-purple-500', text: 'Completed' },
    error: { color: 'bg-red-500', text: 'Error' },
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div className="flex-1 flex flex-col bg-transparent min-h-0">
      {/* Header - centered, symmetric */}
      <div className="px-6 py-4 flex items-center justify-center gap-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${status.color} ${session.status === 'running' ? 'animate-pulse' : ''}`} />
          <h2 className="text-base font-semibold text-foreground">{session.name}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {queuedMessages > 0 && (
            <div className="text-xs bg-warning-100 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400 px-3 py-1 rounded-full">
              {queuedMessages} queued
            </div>
          )}
          
          {isConnected && (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={session.messages || []} streamingOutput={streamingOutput} className="min-h-0" />

      {/* Input */}
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
