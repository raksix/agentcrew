'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/Chat';
import { SubagentPanel } from '@/components/Subagent';
import { Session, SessionEvent } from '@/lib/types';
import * as api from '@/lib/api';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [es, setEs] = useState<EventSource | null>(null);

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    if (activeSession) {
      es?.close();
      const eventSource = api.createSessionEventSource(activeSession.id);
      eventSource.onmessage = (e) => {
        const data: SessionEvent = JSON.parse(e.data);
        if (data.type === 'output') setStreamingOutput(prev => prev + data.data);
        else if (data.type === 'done' || data.type === 'error') { loadSessions(); }
      };
      setEs(eventSource);
    }
    return () => { es?.close(); };
  }, [activeSession?.id]);

  const loadSessions = async () => {
    try { setSessions(await api.getSessions()); } catch (e) { console.error(e); }
  };

  const handleCreateSession = async (name: string, projectTag?: string) => {
    try {
      const session = await api.createSession({ name, projectTag });
      setSessions(prev => [...prev, session]);
      setActiveSession(session);
    } catch (e) { console.error(e); }
  };

  const handleDeleteSession = async (id: string) => {
    try { await api.deleteSession(id); setSessions(prev => prev.filter(s => s.id !== id)); if (activeSession?.id === id) setActiveSession(null); } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSession) return;
    setStreamingOutput('');
    try { await api.sendMessage(activeSession.id, content); } catch (e) { console.error(e); }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try { await api.stopSession(activeSession.id); setStreamingOutput(prev => prev + '\n[Stopped]'); } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-screen">
      <Sidebar sessions={sessions} activeSession={activeSession} onSelectSession={setActiveSession} onCreateSession={handleCreateSession} onDeleteSession={handleDeleteSession} />
      <div className="flex-1 flex flex-col">
        <ChatArea session={activeSession} streamingOutput={streamingOutput} onSendMessage={handleSendMessage} onStop={handleStop} />
        {activeSession && <SubagentPanel sessionId={activeSession.id} subagents={activeSession.subagents || []} />}
      </div>
    </div>
  );
}