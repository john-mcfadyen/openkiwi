import * as path from 'path';

export const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

/**
 * Resolve an agent-supplied path to an absolute path within the workspace.
 * Returns { safe } on success, or { safe: '', error } if the resolved path
 * escapes the workspace sandbox.
 */
export function resolveWorkspacePath(inputPath: string): { safe: string; error?: string } {
    const safe = path.resolve(WORKSPACE_DIR, inputPath);
    if (safe !== WORKSPACE_DIR && !safe.startsWith(WORKSPACE_DIR + path.sep)) {
        return { safe: '', error: 'Access denied: Path is outside of workspace' };
    }
    return { safe };
}
