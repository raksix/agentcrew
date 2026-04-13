'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  streamingOutput?: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        }`}
      >
        <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
      </div>
    </div>
  );
}

export function MessageList({ messages, streamingOutput }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingOutput]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && !streamingOutput && (
        <div className="text-center text-muted-foreground py-12">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">Send a message to run Claude Code</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming output */}
      {streamingOutput && (
        <div className="flex justify-start mb-4">
          <div className="max-w-[80%] bg-muted rounded-2xl rounded-bl-md px-4 py-2">
            <pre className="whitespace-pre-wrap text-sm font-sans">
              {streamingOutput}
              <span className="animate-pulse">▌</span>
            </pre>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}