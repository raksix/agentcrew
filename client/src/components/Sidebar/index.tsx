'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button, Input } from '@heroui/react';
import { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-sidebar-foreground">🤖 AgentCrew</h1>
          <p className="text-xs text-muted-foreground mt-1">Multi-agent orchestration</p>
        </div>
        <ThemeToggle />
      </div>

      {/* New session button */}
      <div className="p-3">
        <Button onPress={onOpen} className="w-full" color="primary">+ New Session</Button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
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
      <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground">
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
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleCreate}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}