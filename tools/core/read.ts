import * as path from 'path';
import * as fs from 'fs';

const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

export default {
    definition: {
        name: 'read',
        displayName: 'Read File',
        pluginType: 'tool',
        description: 'Read the contents of files',
        requiresApproval: false,
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Fully qualified absolute path to the file to read'
                }
            },
            required: ['path']
        }
    },
    handler: async ({ path: filePath }: { path: string }) => {
        const safePath = path.resolve(WORKSPACE_DIR, filePath);
        if (safePath !== WORKSPACE_DIR && !safePath.startsWith(WORKSPACE_DIR + path.sep)) {
            return { error: 'Access denied: File is outside of workspace' };
        }
        if (!fs.existsSync(safePath)) {
            return { error: `File not found: ${filePath}` };
        }
        try {
            return { content: fs.readFileSync(safePath, 'utf-8') };
        } catch (e: any) {
            return { error: `Failed to read file: ${e.message}` };
        }
    }
};
