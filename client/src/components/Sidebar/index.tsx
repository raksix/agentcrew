'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button, Input } from '@heroui/react';
import { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';

interface SidebarProps {
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (session: Session) => void;
  onCreateSession: (name: string, projectTag?: string) => void;
  onDeleteSession: (id: string) => void;
}

export function Sidebar({ sessions, activeSession, onSelectSession, onCreateSession, onDeleteSession }: SidebarProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newName, setNewName] = useState('');
  const [newProjectTag, setNewProjectTag] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateSession(newName.trim(), newProjectTag.trim() || undefined);
      setNewName('');
      setNewProjectTag('');
      onClose();
    }
  };

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">🤖 AgentCrew</h1>
        <p className="text-xs text-gray-500 mt-1">Multi-agent orchestration</p>
      </div>

      {/* New session button */}
      <div className="p-3">
        <button
          onClick={onOpen}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          + New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No sessions yet
          </div>
        ) : (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={activeSession?.id === session.id}
              onClick={() => onSelectSession(session)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400">
        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </div>

      {/* Create session modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create New Session</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Session Name"
                placeholder="My Agent Session"
                value={newName}
                onValueChange={setNewName}
              />
              <Input
                label="Project Tag (optional)"
                placeholder="e.g., sooliva, finder"
                value={newProjectTag}
                onValueChange={setNewProjectTag}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Create
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}