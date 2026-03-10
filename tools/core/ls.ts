import * as path from 'path';
import * as fs from 'fs';

const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

export default {
    definition: {
        name: 'ls',
        displayName: 'List Files',
        pluginType: 'tool',
        description: 'Lists files and directories',
        requiresApproval: false,
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Fully qualified absolute path of the directory to list. Leave empty for root.'
                }
            }
        }
    },
    handler: async ({ path: dirPath = '' }: { path?: string }) => {
        const targetDir = path.resolve(WORKSPACE_DIR, dirPath);

        if (targetDir !== WORKSPACE_DIR && !targetDir.startsWith(WORKSPACE_DIR + path.sep)) {
            return { error: 'Access denied: Directory is outside of workspace' };
        }
        if (!fs.existsSync(targetDir)) {
            return { error: `Directory not found: ${dirPath}` };
        }
        if (!fs.statSync(targetDir).isDirectory()) {
            return { error: `Target is not a directory: ${dirPath}` };
        }
        try {
            const results = fs.readdirSync(targetDir, { withFileTypes: true });
            return {
                files: results.map(dirent => ({
                    name: dirent.name,
                    type: dirent.isDirectory() ? 'directory' : 'file'
                }))
            };
        } catch (e: any) {
            return { error: `Failed to list directory: ${e.message}` };
        }
    }
};
