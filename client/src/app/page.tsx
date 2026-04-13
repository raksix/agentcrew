'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/Chat';
import { SubagentPanel } from '@/components/Subagent';
import { Session, SessionEvent } from '@/lib/types';
import * as api from '@/lib/api';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Setup SSE when active session changes
  useEffect(() => {
    if (activeSession) {
      setupEventSource(activeSession.id);
    }
    return () => {
      eventSource?.close();
    };
  }, [activeSession?.id]);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
  };

  const setupEventSource = (sessionId: string) => {
    eventSource?.close();
    
    const es = api.createSessionEventSource(sessionId);
    
    es.onmessage = (event) => {
      const data: SessionEvent = JSON.parse(event.data);
      
      switch (data.type) {
        case 'output':
          setStreamingOutput(prev => prev + data.data);
          break;
        case 'status':
          // Could show status updates
          break;
        case 'done':
          setStreamingOutput(prev => prev + '\n[Done]');
          // Reload session to get updated messages
          loadSessions();
          break;
        case 'error':
          setStreamingOutput(prev => prev + `\n[Error] ${data.data}`);
          loadSessions();
          break;
      }
    };

    es.onerror = (err) => {
      console.error('SSE error:', err);
    };

    setEventSource(es);
  };

  const handleCreateSession = async (name: string, projectTag?: string) => {
    try {
      const session = await api.createSession({ name, projectTag });
      setSessions(prev => [...prev, session]);
      setActiveSession(session);
    } catch (e) {
      console.error('Failed to create session:', e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
      }
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSession) return;
    
    setStreamingOutput('');
    
    try {
      await api.sendMessage(activeSession.id, { content });
      // Session will be reloaded when we get the 'done' event
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    
    try {
      await api.stopSession(activeSession.id);
      setStreamingOutput(prev => prev + '\n[Stopped by user]');
    } catch (e) {
      console.error('Failed to stop:', e);
    }
  };

  const handleAddSubagent = (name: string, task: string) => {
    // TODO: Implement subagent creation via API
    console.log('Add subagent:', name, task);
  };

  const handleUpdateSubagent = (id: string, data: Partial<Session>) => {
    // TODO: Implement subagent update via API
    console.log('Update subagent:', id, data);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={(session) => {
          setActiveSession(session);
          setStreamingOutput('');
        }}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatArea
          session={activeSession}
          streamingOutput={streamingOutput}
          onSendMessage={handleSendMessage}
          onStop={handleStop}
        />
        
        {activeSession && (
          <SubagentPanel
            sessionId={activeSession.id}
            subagents={activeSession.subagents}
            onAddSubagent={handleAddSubagent}
            onUpdateSubagent={handleUpdateSubagent}
          />
        )}
      </div>
    </div>
  );
}