'use client';

import { useState } from 'react';
import { Session } from '@/lib/types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatAreaProps {
  session: Session | null;
  streamingOutput: string;
  thinkingContent?: string;
  showThinking?: boolean;
  onToggleThinking?: () => void;
  onSendMessage: (content: string) => void;
  onStop: () => void;
  queuedMessages?: number;
  isConnected?: boolean;
}

export function ChatArea({ 
  session, 
  streamingOutput, 
  thinkingContent = '',
  showThinking = false,
  onToggleThinking,
  onSendMessage, 
  onStop, 
  queuedMessages = 0, 
  isConnected = false 
}: ChatAreaProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary">A</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">AgentCrew</h2>
          <p className="text-sm text-muted-foreground">Select a session or create new one</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    idle: { color: 'bg-green-500', text: 'Ready' },
    running: { color: 'bg-yellow-500 animate-pulse', text: 'Working...' },
    writing: { color: 'bg-blue-500 animate-pulse', text: 'Writing...' },
    done: { color: 'bg-purple-500', text: 'Done' },
    error: { color: 'bg-red-500', text: 'Error' },
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.idle;

  const showTyping = (session.status === 'running' || session.status === 'writing') && !streamingOutput && session.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
          <h2 className="text-base font-semibold text-foreground">{session.name}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Thinking toggle */}
          {thinkingContent && onToggleThinking && (
            <button
              onClick={onToggleThinking}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                showThinking 
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              💭 Thinking {showThinking ? '▼' : '▶'}
            </button>
          )}
          
          {queuedMessages > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              {queuedMessages} queued
            </span>
          )}
          
          {isConnected && (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
          )}
        </div>
      </div>

      {/* Thinking panel */}
      {thinkingContent && showThinking && (
        <div className="px-6 py-3 bg-purple-50/50 border-b border-purple-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-600 text-sm font-medium">💭 Thinking Process</span>
            </div>
            <div className="bg-white rounded-lg border border-purple-100 p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{thinkingContent}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={session.messages || []} streamingOutput={streamingOutput} showTyping={showTyping} className="min-h-0" />

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStop}
        disabled={false}
        isRunning={session.status === 'running' || session.status === 'writing'}
        queuedCount={queuedMessages}
      />
    </div>
  );
}
