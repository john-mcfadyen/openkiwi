import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

export default {
    definition: {
        name: 'glob',
        displayName: 'Glob/Find Files',
        pluginType: 'tool',
        description: 'Finds files based on pattern matching (e.g., "*.js", "**/*.ts")',
        requiresApproval: false,
        parameters: {
            type: 'object',
            properties: {
                pattern: {
                    type: 'string',
                    description: 'The glob pattern or filename to search for'
                },
                path: {
                    type: 'string',
                    description: 'Fully qualified absolute path to the directory to search within. Defaults to root.'
                }
            },
            required: ['pattern']
        }
    },
    handler: async ({ pattern, path: searchPath = '' }: { pattern: string, path?: string }) => {
        const targetDir = path.resolve(WORKSPACE_DIR, searchPath);
        if (targetDir !== WORKSPACE_DIR && !targetDir.startsWith(WORKSPACE_DIR + path.sep)) {
            return { error: 'Access denied: Directory is outside of workspace' };
        }
        if (!fs.existsSync(targetDir)) {
            return { error: `Directory not found: ${searchPath}` };
        }
        try {
            // Very simple find wrapper since node lacks native glob unless using external libraries
            // and we want this script to be zero-config.
            // Escape single quotes for shell safety
            const safePattern = pattern.replace(/'/g, "'\\''");
            const { stdout, stderr } = await execAsync(`find . -name '${safePattern}'`, {
                cwd: targetDir,
                timeout: 5000
            });
            if (stderr) console.warn('[glob] stderr:', stderr);
            return { files: stdout.trim().split('\n').filter(Boolean) };
        } catch (e: any) {
            if (e.code === 1) return { files: [] }; // find can return 1 if directory is empty or nothing found depending on platform
            return { error: `Glob failed: ${e.message}` };
        }
    }
};
