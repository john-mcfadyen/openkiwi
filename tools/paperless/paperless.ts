const BASE_URL = (process.env.PAPERLESS_URL || '').replace(/\/$/, '');
const TOKEN = process.env.PAPERLESS_TOKEN || '';

const DEBUG = process.env.PAPERLESS_DEBUG === 'true' || process.env.PAPERLESS_DEBUG === '1';
function debug(...args: unknown[]) {
    if (DEBUG) console.log('[Paperless:DEBUG]', ...args);
}

type Json = Record<string, any>;

async function pxFetch(path: string, init: RequestInit = {}): Promise<any> {
    if (!BASE_URL) throw new Error('PAPERLESS_URL is not set');
    if (!TOKEN) throw new Error('PAPERLESS_TOKEN is not set');

    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const headers: Record<string, string> = {
        'Authorization': `Token ${TOKEN}`,
        'Accept': 'application/json; version=5',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers as Record<string, string> | undefined)
    };

    debug(init.method || 'GET', url);
    const res = await fetch(url, { ...init, headers });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Paperless ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
    }
    return text ? JSON.parse(text) : null;
}

function trimContent(doc: Json, max = 8000): Json {
    if (typeof doc?.content === 'string' && doc.content.length > max) {
        return { ...doc, content: doc.content.slice(0, max), content_truncated: true, original_content_length: doc.content.length };
    }
    return doc;
}

export default {
    definition: {
        name: 'paperless',
        displayName: 'Paperless NGX',
        pluginType: 'tool',
        description:
            'Read and update documents in a Paperless NGX instance. Supports listing/searching documents, fetching OCR content, updating title/tags/correspondent/document_type, and creating new tags/correspondents/types. ' +
            'Typical workflow for cleaning up metadata: call "list" (optionally with query) to find documents, then "get" to read the OCR content for one, then "update" with a better title and relevant tag IDs inferred from the content. ' +
            'Requires PAPERLESS_URL and PAPERLESS_TOKEN environment variables.',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: [
                        'list', 'get', 'update',
                        'list_tags', 'create_tag',
                        'list_correspondents', 'create_correspondent',
                        'list_document_types', 'create_document_type'
                    ],
                    description:
                        'list: search/list documents (params: query, page, page_size, ordering). ' +
                        'get: fetch one document including OCR content (params: id). ' +
                        'update: patch document metadata (params: id, title?, tags?, correspondent?, document_type?, archive_serial_number?, created?). ' +
                        'list_tags/list_correspondents/list_document_types: enumerate metadata (optional: query). ' +
                        'create_tag/create_correspondent/create_document_type: create a new one (params: name, optional color for tag).'
                },
                id: { type: 'number', description: 'Document (or entity) ID for get/update.' },
                query: { type: 'string', description: 'Full-text search query for list, or name filter for list_tags/etc.' },
                page: { type: 'number', description: 'Page number (list actions, default 1).' },
                page_size: { type: 'number', description: 'Results per page (list actions, default 25, max 100).' },
                ordering: { type: 'string', description: 'Ordering field, e.g. "-created" or "title".' },
                title: { type: 'string', description: 'New title for update.' },
                tags: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Full replacement list of tag IDs for update. Use list_tags to discover IDs.'
                },
                correspondent: { type: ['number', 'null'], description: 'Correspondent ID (or null to clear) for update.' },
                document_type: { type: ['number', 'null'], description: 'Document type ID (or null to clear) for update.' },
                archive_serial_number: { type: ['string', 'null'], description: 'Optional ASN for update.' },
                created: { type: 'string', description: 'ISO date (YYYY-MM-DD) representing document date for update.' },
                name: { type: 'string', description: 'Name for create_tag/create_correspondent/create_document_type.' },
                color: { type: 'string', description: 'Optional hex color (e.g. "#ff0000") for create_tag.' },
                max_content_chars: { type: 'number', description: 'Truncate OCR content in get responses (default 8000).' }
            },
            required: ['action']
        }
    },

    handler: async (args: Json) => {
        const {
            action, id, query, page, page_size, ordering,
            title, tags, correspondent, document_type, archive_serial_number, created,
            name, color, max_content_chars
        } = args;

        try {
            switch (action) {
                case 'list': {
                    const params = new URLSearchParams();
                    if (query) params.set('query', query);
                    params.set('page', String(page ?? 1));
                    params.set('page_size', String(Math.min(page_size ?? 25, 100)));
                    if (ordering) params.set('ordering', ordering);
                    const data = await pxFetch(`/api/documents/?${params.toString()}`);
                    const results = (data.results || []).map((d: Json) => ({
                        id: d.id,
                        title: d.title,
                        created: d.created,
                        added: d.added,
                        correspondent: d.correspondent,
                        document_type: d.document_type,
                        tags: d.tags,
                        archive_serial_number: d.archive_serial_number
                    }));
                    return { count: data.count, next: !!data.next, previous: !!data.previous, results };
                }

                case 'get': {
                    if (!id) return { error: 'id is required' };
                    const doc = await pxFetch(`/api/documents/${id}/`);
                    return trimContent(doc, max_content_chars);
                }

                case 'update': {
                    if (!id) return { error: 'id is required' };
                    const body: Json = {};
                    if (title !== undefined) body.title = title;
                    if (tags !== undefined) body.tags = tags;
                    if (correspondent !== undefined) body.correspondent = correspondent;
                    if (document_type !== undefined) body.document_type = document_type;
                    if (archive_serial_number !== undefined) body.archive_serial_number = archive_serial_number;
                    if (created !== undefined) body.created = created;
                    if (Object.keys(body).length === 0) return { error: 'no update fields provided' };
                    const updated = await pxFetch(`/api/documents/${id}/`, {
                        method: 'PATCH',
                        body: JSON.stringify(body)
                    });
                    return {
                        id: updated.id,
                        title: updated.title,
                        tags: updated.tags,
                        correspondent: updated.correspondent,
                        document_type: updated.document_type,
                        archive_serial_number: updated.archive_serial_number,
                        created: updated.created
                    };
                }

                case 'list_tags':
                case 'list_correspondents':
                case 'list_document_types': {
                    const path = action === 'list_tags'
                        ? '/api/tags/'
                        : action === 'list_correspondents'
                            ? '/api/correspondents/'
                            : '/api/document_types/';
                    const params = new URLSearchParams();
                    if (query) params.set('name__icontains', query);
                    params.set('page_size', String(Math.min(page_size ?? 100, 100)));
                    const data = await pxFetch(`${path}?${params.toString()}`);
                    return {
                        count: data.count,
                        results: (data.results || []).map((r: Json) => ({
                            id: r.id,
                            name: r.name,
                            ...(r.colour !== undefined ? { colour: r.colour } : {}),
                            document_count: r.document_count
                        }))
                    };
                }

                case 'create_tag':
                case 'create_correspondent':
                case 'create_document_type': {
                    if (!name) return { error: 'name is required' };
                    const path = action === 'create_tag'
                        ? '/api/tags/'
                        : action === 'create_correspondent'
                            ? '/api/correspondents/'
                            : '/api/document_types/';
                    const body: Json = { name };
                    if (action === 'create_tag' && color) body.color = color;
                    const created = await pxFetch(path, { method: 'POST', body: JSON.stringify(body) });
                    return { id: created.id, name: created.name };
                }

                default:
                    return { error: `Unknown action: ${action}` };
            }
        } catch (error: any) {
            console.error('[Paperless] Error:', error);
            return { error: error.message || String(error) };
        }
    }
};
