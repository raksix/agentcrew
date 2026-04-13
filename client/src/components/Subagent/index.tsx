'use client';

import { useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from '@heroui/react';
import { Subagent } from '@/lib/types';
import { SubagentWindow } from './SubagentWindow';

interface SubagentPanelProps {
  sessionId: string | null;
  subagents: Subagent[];
  onAddSubagent: (name: string, task: string) => void;
  onUpdateSubagent: (id: string, data: Partial<Subagent>) => void;
}

export function SubagentPanel({ sessionId, subagents, onAddSubagent, onUpdateSubagent }: SubagentPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newName, setNewName] = useState('');
  const [newTask, setNewTask] = useState('');

  const handleCreate = () => {
    if (newName.trim() && newTask.trim()) {
      onAddSubagent(newName.trim(), newTask.trim());
      setNewName('');
      setNewTask('');
      onClose();
    }
  };

  if (!sessionId) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200">🤖 Subagents</h3>
          <p className="text-xs text-gray-500">{subagents.length} agent{subagents.length !== 1 ? 's' : ''} in this session</p>
        </div>
        <Button size="sm" onPress={onOpen} className="bg-purple-500 hover:bg-purple-600 text-white">
          + Add Agent
        </Button>
      </div>

      {/* Subagent grid */}
      <div className="p-4 overflow-x-auto">
        {subagents.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            <div className="text-2xl mb-2">🧩</div>
            <p className="text-sm">No subagents yet</p>
            <p className="text-xs">Add agents to work in parallel</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {subagents.map((subagent) => (
              <div key={subagent.id} className="w-72 flex-shrink-0">
                <SubagentWindow subagent={subagent} onUpdate={onUpdateSubagent} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add subagent modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add Subagent</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Agent Name"
                placeholder="e.g., Frontend Dev"
                value={newName}
                onValueChange={setNewName}
              />
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Task Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  placeholder="What should this agent do?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleCreate}>Add Agent</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}