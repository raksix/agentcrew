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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      setSidebarOpen(false);
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

  const handleSelectSession = (session: Session) => {
    setActiveSession(session);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        fixed lg:relative z-50 h-full transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
      `}>
        <Sidebar 
          sessions={sessions} 
          activeSession={activeSession} 
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden flex items-center p-3 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
          <div className="ml-3 font-medium">
            {activeSession ? activeSession.name : 'AgentCrew'}
          </div>
        </div>
        
        <ChatArea 
          session={activeSession} 
          streamingOutput={streamingOutput} 
          onSendMessage={handleSendMessage} 
          onStop={handleStop}
        />
        {activeSession && <SubagentPanel sessionId={activeSession.id} subagents={activeSession.subagents || []} />}
      </div>
    </div>
  );
}