'use client';

import { Subagent } from '@/lib/types';
import { Card, CardBody, Progress } from '@heroui/react';

interface SubagentWindowProps {
  subagent: Subagent;
  onUpdate: (id: string, data: Partial<Subagent>) => void;
}

export function SubagentWindow({ subagent, onUpdate }: SubagentWindowProps) {
  const statusConfig = {
    idle: { color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
    running: { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    done: { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    error: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  const config = statusConfig[subagent.status];

  return (
    <Card className={`${config.bg} border border-transparent hover:border-gray-200 dark:hover:border-gray-700`}>
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              subagent.status === 'idle' ? 'bg-gray-400' :
              subagent.status === 'running' ? 'bg-yellow-500 animate-pulse' :
              subagent.status === 'done' ? 'bg-purple-500' : 'bg-red-500'
            }`} />
            <span className="font-medium text-sm">{subagent.name}</span>
          </div>
          <span className={`text-xs ${config.color}`}>{subagent.status}</span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {subagent.task || 'No task assigned'}
        </div>

        {/* Output area */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {subagent.output || (subagent.status === 'running' ? '⏳ Working...' : 'No output yet')}
          </pre>
        </div>

        {subagent.status === 'running' && (
          <Progress 
            size="sm" 
            isIndeterminate 
            className="mt-3" 
            color="warning"
          />
        )}
      </CardBody>
    </Card>
  );
}