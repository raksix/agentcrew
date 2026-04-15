import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const SETTINGS_PATH = path.join(process.env.HOME || '/root', '.claude', 'settings.json');

// Get MCP servers
router.get('/', (_req, res) => {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      return res.json({ mcpServers: {} });
    }
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    res.json({ mcpServers: settings.mcpServers || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

// Add/Update MCP server
router.post('/', (req, res) => {
  try {
    const { name, config } = req.body;
    if (!name || !config) {
      return res.status(400).json({ error: 'name and config required' });
    }

    const settings = fs.existsSync(SETTINGS_PATH)
      ? JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
      : { env: {}, mcpServers: {} };

    if (!settings.mcpServers) settings.mcpServers = {};
    settings.mcpServers[name] = config;

    fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

    res.json({ success: true, mcpServers: settings.mcpServers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Delete MCP server
router.delete('/:name', (req, res) => {
  try {
    const { name } = req.params;

    const settings = fs.existsSync(SETTINGS_PATH)
      ? JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
      : { env: {}, mcpServers: {} };

    if (settings.mcpServers && settings.mcpServers[name]) {
      delete settings.mcpServers[name];
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    }

    res.json({ success: true, mcpServers: settings.mcpServers || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete MCP server' });
  }
});

export default router;
