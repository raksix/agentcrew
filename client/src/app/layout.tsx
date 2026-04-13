import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'AgentCrew - Multi-Agent Orchestration',
  description: 'Chat UI for orchestrating multiple Claude Code agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-white dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}