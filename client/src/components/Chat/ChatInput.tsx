'use client';

import { useState, KeyboardEvent } from 'react';
import { Button, Textarea } from '@heroui/react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled: boolean;
  isRunning: boolean;
}

export function ChatInput({ onSend, onStop, disabled, isRunning }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
      <div className="flex gap-2">
        <Textarea
          className="flex-1"
          placeholder={isRunning ? "Claude Code is running..." : "Type your message..."}
          value={input}
          onValueChange={setInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isRunning}
          minRows={1}
          maxRows={6}
          classNames={{
            input: "resize-none",
          }}
        />
        <div className="flex flex-col gap-2">
          {isRunning ? (
            <Button
              color="danger"
              onPress={onStop}
              className="px-6"
            >
              ⏹ Stop
            </Button>
          ) : (
            <Button
              color="primary"
              onPress={handleSend}
              isDisabled={disabled || !input.trim()}
              className="px-6"
            >
              Send
            </Button>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}