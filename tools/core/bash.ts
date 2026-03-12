import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

export default {
    definition: {
        name: 'bash',
        displayName: 'Bash Command',
        pluginType: 'tool',
        description: 'Executes shell commands in the workspace environment',
        requiresApproval: true,
        parameters: {
            type: 'object',
            properties: {
                command: {
                    type: 'string',
                    description: 'The shell command to execute'
                },
                cwd: {
                    type: 'string',
                    description: 'The working directory to run inside (relative to workspace). Defaults to root.'
                }
            },
            required: ['command']
        }
    },
    handler: async ({ command, cwd = '' }: { command: string, cwd?: string }) => {
        if (!command || typeof command !== 'string') {
            return { error: 'Missing required parameter: command must be a non-empty string.' };
        }

        let targetDir = path.resolve(WORKSPACE_DIR, cwd);

        // If cwd resolves outside the workspace (e.g. agent passed an absolute path like /app/workspace),
        // fall back to the workspace root rather than hard-erroring.
        if (targetDir !== WORKSPACE_DIR && !targetDir.startsWith(WORKSPACE_DIR + path.sep)) {
            targetDir = WORKSPACE_DIR;
        }

        try {
            console.log(`[bash] Executing \`${command}\` in ${targetDir}`);
            const { stdout, stderr } = await execAsync(command, {
                cwd: targetDir,
                timeout: 30000 // 30 sec limit
            });
            return {
                stdout: stdout.trim(),
                stderr: stderr.trim()
            };
        } catch (e: any) {
            return {
                error: `Command failed: ${e.message}`,
                stdout: e.stdout ? e.stdout.toString().trim() : '',
                stderr: e.stderr ? e.stderr.toString().trim() : ''
            };
        }
    }
};
