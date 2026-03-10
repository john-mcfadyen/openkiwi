import fs from 'node:fs';
import path from 'node:path';

const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

// Ensure workspace exists
if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

export default {
    definition: {
        name: 'file_manager',
        displayName: 'File Operations',
        pluginType: 'tool',
        description: 'Perform structural file system operations: delete files or directories, create directories, move/rename, and copy.',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['delete', 'mkdir', 'move', 'copy'],
                    description: 'The file operation to perform.'
                },
                path: {
                    type: 'string',
                    description: 'The fully qualified absolute path of the file or directory.'
                },
                newPath: {
                    type: 'string',
                    description: 'The destination path for "move" or "copy" actions.'
                }
            },
            required: ['action', 'path']
        }
    },
    handler: async ({ action, path: filePath, newPath }: { action: string; path: string; newPath?: string }) => {
        try {
            const safePath = path.resolve(WORKSPACE_DIR, filePath);
            if (safePath !== WORKSPACE_DIR && !safePath.startsWith(WORKSPACE_DIR + path.sep)) {
                throw new Error('Access denied: Path is outside of workspace');
            }

            switch (action) {
                case 'delete':
                    if (!fs.existsSync(safePath)) throw new Error('Path not found');
                    const stats = fs.statSync(safePath);
                    if (stats.isDirectory()) {
                        fs.rmSync(safePath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(safePath);
                    }
                    return { success: true, message: `${stats.isDirectory() ? 'Directory' : 'File'} ${filePath} deleted successfully` };

                case 'mkdir':
                    if (fs.existsSync(safePath)) throw new Error('Path already exists');
                    fs.mkdirSync(safePath, { recursive: true });
                    return { success: true, message: `Directory ${filePath} created successfully` };

                case 'move':
                    if (!fs.existsSync(safePath)) throw new Error('Source path not found');
                    if (!newPath) throw new Error('newPath is required for "move" action');
                    const destPath = path.resolve(WORKSPACE_DIR, newPath);
                    if (destPath !== WORKSPACE_DIR && !destPath.startsWith(WORKSPACE_DIR + path.sep)) {
                        throw new Error('Access denied: Destination is outside of workspace');
                    }
                    const destParentDir = path.dirname(destPath);
                    if (!fs.existsSync(destParentDir)) {
                        fs.mkdirSync(destParentDir, { recursive: true });
                    }
                    fs.renameSync(safePath, destPath);
                    return { success: true, message: `Moved ${filePath} to ${newPath}` };

                case 'copy':
                    if (!fs.existsSync(safePath)) throw new Error('Source path not found');
                    if (!newPath) throw new Error('newPath is required for "copy" action');
                    const copyDestPath = path.resolve(WORKSPACE_DIR, newPath);
                    if (copyDestPath !== WORKSPACE_DIR && !copyDestPath.startsWith(WORKSPACE_DIR + path.sep)) {
                        throw new Error('Access denied: Destination is outside of workspace');
                    }
                    const copyDestParentDir = path.dirname(copyDestPath);
                    if (!fs.existsSync(copyDestParentDir)) {
                        fs.mkdirSync(copyDestParentDir, { recursive: true });
                    }
                    if (fs.statSync(safePath).isDirectory()) {
                        fs.cpSync(safePath, copyDestPath, { recursive: true });
                    } else {
                        fs.copyFileSync(safePath, copyDestPath);
                    }
                    return { success: true, message: `Copied ${filePath} to ${newPath}` };

                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error: any) {
            return { error: error.message };
        }
    }
};
