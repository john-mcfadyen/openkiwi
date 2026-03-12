import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

export default {
    definition: {
        name: 'grep',
        displayName: 'Grep Search',
        pluginType: 'tool',
        description: 'Searches for text patterns inside files in the workspace using grep',
        requiresApproval: false,
        parameters: {
            type: 'object',
            properties: {
                pattern: {
                    type: 'string',
                    description: 'The search pattern or literal string to look for'
                },
                directory: {
                    type: 'string',
                    description: 'The root directory to search inside (relative to workspace). Leave empty for workspace root.'
                },
                options: {
                    type: 'array',
                    description: 'Grep CLI flags (e.g. "-i" for case insensitive, "-n" for line numbers)',
                    items: { type: 'string' }
                }
            },
            required: ['pattern']
        }
    },
    handler: async ({ pattern, directory = '', options = ['-rn'] }: { pattern: string, directory?: string, options?: string[] }) => {
        const targetDir = path.resolve(WORKSPACE_DIR, directory);
        if (targetDir !== WORKSPACE_DIR && !targetDir.startsWith(WORKSPACE_DIR + path.sep)) {
            return { error: 'Access denied: Directory is outside of workspace' };
        }
        if (!fs.existsSync(targetDir)) {
            return { error: `Directory not found: ${directory}` };
        }
        try {
            // Very simple grep injection prevention - only allow expected flags like -i, -n, -r
            const safeOpts = options.filter(opt => /^-[A-Za-z]+$/.test(opt)).join(' ');
            const { stdout, stderr } = await execAsync(`grep ${safeOpts} ${JSON.stringify(pattern)} .`, {
                cwd: targetDir,
                timeout: 5000 // 5 second timeout to prevent runaway searches
            });
            if (stderr) {
                console.warn('[grep] stderr:', stderr);
            }
            return { results: stdout.trim().split('\n').filter(Boolean) };
        } catch (e: any) {
            if (e.code === 1) return { results: [] }; // grep returns 1 on no match
            return { error: `Grep failed: ${e.message}` };
        }
    }
};
