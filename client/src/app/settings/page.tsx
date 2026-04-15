'use client';

import { useState, useEffect } from 'react';
import { Button, Input, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

interface MCPServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}

interface MCPServers {
  [key: string]: MCPServer;
}

export default function SettingsPage() {
  const [servers, setServers] = useState<MCPServers>({});
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newName, setNewName] = useState('');
  const [newCommand, setNewCommand] = useState('');
  const [newEnv, setNewEnv] = useState('');

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/mcp');
      const data = await res.json();
      setServers(data.mcpServers || {});
    } catch (err) {
      console.error('Failed to fetch MCP servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleAddServer = async () => {
    if (!newName.trim() || !newCommand.trim()) return;

    const config: MCPServer = { command: newCommand };
    if (newEnv.trim()) {
      const envPairs = newEnv.split(',').map(s => s.trim());
      config.env = {};
      envPairs.forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) config.env![key] = value || '';
      });
    }

    try {
      await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, config })
      });
      setNewName('');
      setNewCommand('');
      setNewEnv('');
      onClose();
      fetchServers();
    } catch (err) {
      console.error('Failed to add MCP server:', err);
    }
  };

  const handleDeleteServer = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await fetch(`/api/mcp/${name}`, { method: 'DELETE' });
      fetchServers();
    } catch (err) {
      console.error('Failed to delete MCP server:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MCP Server Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your Model Context Protocol servers</p>
          </div>
          <Button color="primary" onPress={onOpen}>+ Add Server</Button>
        </div>

        {/* Server List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : Object.keys(servers).length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No MCP servers configured</p>
            <Button className="mt-4" variant="flat" onPress={onOpen}>Add your first server</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(servers).map(([name, config]) => (
              <div key={name} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Command:</span> {config.command}
                      </p>
                      {config.args && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Args:</span> {config.args.join(' ')}
                        </p>
                      )}
                      {config.env && Object.keys(config.env).length > 0 && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Env:</span>{' '}
                          {Object.entries(config.env).map(([k, v]) => `${k}=${v}`).join(', ')}
                        </p>
                      )}
                      {config.url && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">URL:</span> {config.url}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => handleDeleteServer(name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
          <h4 className="font-medium text-foreground mb-2">What is MCP?</h4>
          <p className="text-sm text-muted-foreground">
            Model Context Protocol (MCP) servers extend Claude Code's capabilities by connecting to external tools and services.
            Configure servers like MiniMax, Playwright, or custom MCP servers here.
          </p>
        </div>

        {/* Add Server Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Add MCP Server</ModalHeader>
            <ModalBody>
              <div className="space-y-4 py-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Server Name</label>
                  <input
                    type="text"
                    placeholder="e.g., minimax"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Command</label>
                  <input
                    type="text"
                    placeholder="e.g., minimax-mcp"
                    value={newCommand}
                    onChange={(e) => setNewCommand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Environment Variables (optional)</label>
                  <input
                    type="text"
                    placeholder="KEY1=value1, KEY2=value2"
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" onPress={handleAddServer} isDisabled={!newName.trim() || !newCommand.trim()}>
                Add Server
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
