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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-card">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
            <span className="text-5xl">🤖</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 gradient-text">AgentCrew</h2>
          <p className="text-muted-foreground">Select a session to start</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    idle: { color: 'bg-green-500', text: 'Ready', glow: 'shadow-green-500/20' },
    running: { color: 'bg-yellow-500', text: 'Working...', glow: 'shadow-yellow-500/20' },
    done: { color: 'bg-purple-500', text: 'Completed', glow: 'shadow-purple-500/20' },
    error: { color: 'bg-red-500', text: 'Error', glow: 'shadow-red-500/20' },
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-card/50 min-h-0">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status.color} ${session.status === 'running' ? 'animate-pulse' : ''} shadow-lg ${status.glow}`} />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
              {session.name}
            </h2>
            <span className="text-xs text-muted-foreground capitalize">{status.text}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {queuedMessages > 0 && (
            <div className="text-xs sm:text-sm bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full border border-yellow-500/20">
              {queuedMessages} queued
            </div>
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
