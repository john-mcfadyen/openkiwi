import * as path from 'path';
import * as fs from 'fs';

const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

export default {
    definition: {
        name: 'write',
        displayName: 'Write File',
        pluginType: 'tool',
        description: 'Creates or overwrites files',
        requiresApproval: true,
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Fully qualified absolute path of the file to write'
                },
                content: {
                    type: 'string',
                    description: 'The complete content to write to the file'
                }
            },
            required: ['path', 'content']
        }
    },
    handler: async ({ path: filePath, content }: { path: string, content: string }) => {
        const safePath = path.resolve(WORKSPACE_DIR, filePath);
        if (safePath !== WORKSPACE_DIR && !safePath.startsWith(WORKSPACE_DIR + path.sep)) {
            return { error: 'Access denied: Path is outside of workspace' };
        }
        try {
            const parentDir = path.dirname(safePath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(safePath, content, 'utf-8');
            return { success: true, message: `File ${filePath} written successfully` };
        } catch (e: any) {
            return { error: `Failed to write file: ${e.message}` };
        }
    }
};
