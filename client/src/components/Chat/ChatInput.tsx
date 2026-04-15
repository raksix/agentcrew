'use client';

import { useState } from 'react';
import { Button, Textarea } from '@heroui/react';

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
    <div className="border-t border-border p-4 bg-card">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <Textarea
          className="flex-1"
          placeholder={isRunning ? "Claude is working..." : "Type a message..."}
          value={input}
          onValueChange={setInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          minRows={1}
          maxRows={4}
          variant="bordered"
          disabled={disabled}
        />
        
        <div className="flex flex-col gap-2">
          {isRunning ? (
            <Button color="danger" onPress={onStop} size="lg">
              Stop
            </Button>
          ) : (
            <Button color="primary" onPress={handleSend} isDisabled={disabled || !input.trim()} size="lg">
              Send
            </Button>
          )}
          
          {queuedCount > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              {queuedCount} queued
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
