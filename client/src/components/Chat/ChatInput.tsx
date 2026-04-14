'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled: boolean;
  isRunning: boolean;
  queuedCount?: number;
}

export function ChatInput({ onSend, onStop, disabled, isRunning, queuedCount = 0 }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex gap-2">
        <textarea
          className="flex-1 px-4 py-3 rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          placeholder={isRunning ? "Claude is working... (message will be queued)" : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
        />
        <div className="flex flex-col gap-2">
          {isRunning ? (
            <>
              <Button variant="destructive" onPress={onStop}>⏹ Stop</Button>
              {queuedCount > 0 && (
                <div className="text-xs text-center text-yellow-500">{queuedCount} queued</div>
              )}
            </>
          ) : (
            <Button onPress={handleSend} isDisabled={disabled || !input.trim()}>Send</Button>
          )}
        </div>
      </div>
    </div>
  );
}
