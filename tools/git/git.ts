import { resolveWorkspacePath, WORKSPACE_DIR } from '../lib/workspace.js';
import { execInWorkspace } from '../lib/exec.js';

export default {
    definition: {
        name: 'git',
        displayName: 'Git',
        pluginType: 'tool',
        description: 'Run any git command inside the workspace (e.g. clone, log, diff, status).',
        requiresApproval: true,
        parameters: {
            type: 'object',
            properties: {
                args: {
                    type: 'string',
                    description:
                        'Git arguments exactly as you would type them after "git " ' +
                        '(e.g. "clone https://github.com/owner/repo --depth 1", "log --oneline -10", "status").'
                },
                cwd: {
                    type: 'string',
                    description: 'Working directory relative to the workspace root. Defaults to workspace root.'
                }
            },
            required: ['args']
        }
    },
    handler: async ({ args, cwd = '' }: { args: string; cwd?: string }) => {
        if (!args || typeof args !== 'string') {
            return { error: 'Missing required parameter: args must be a non-empty string.' };
        }

        // Fall back to workspace root if the path escapes the sandbox
        const { safe } = resolveWorkspacePath(cwd);
        const targetDir = safe || WORKSPACE_DIR;

        const command = `git ${args}`;
        console.log(`[git] Executing \`${command}\` in ${targetDir}`);

        const result = await execInWorkspace(command, targetDir, { timeout: 120_000 });

        if (result.error) {
            return { error: `git ${args.split(' ')[0]} failed: ${result.stderr || result.error}`, stdout: result.stdout, stderr: result.stderr };
        }
        return { stdout: result.stdout, stderr: result.stderr };
    }
};
