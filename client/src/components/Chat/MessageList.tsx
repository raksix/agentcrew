'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  streamingOutput?: string;
}

export function MessageList({ messages, streamingOutput }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingOutput]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && !streamingOutput && (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">Send a message to run Claude Code</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {/* Streaming output */}
      {streamingOutput && (
        <div className="flex justify-start mb-4">
          <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-2">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200">
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