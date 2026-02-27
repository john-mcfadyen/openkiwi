import { Router } from 'express';
import { ToolManager } from '../tool-manager.js';
import path from 'node:path';
import fs from 'node:fs';

const router = Router();

router.get('/', (req, res) => {
    const definitions = ToolManager.getToolDefinitions();
    const availableFiles = ToolManager.getAvailableToolFiles();
    res.json({ definitions, availableFiles });
});

router.get('/readme', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'Path is required' });

    const content = ToolManager.getToolReadme(filePath);
    if (content === null) return res.status(404).json({ error: 'README not found' });

    res.json({ content });
});

router.get('/files', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'Path is required' });

    const TOOLS_DIR = path.resolve(process.cwd(), 'tools');
    const fullPath = path.resolve(TOOLS_DIR, filePath);

    if (!fullPath.startsWith(TOOLS_DIR + path.sep) && fullPath !== TOOLS_DIR) {
        return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(fullPath);
});

export default router;
