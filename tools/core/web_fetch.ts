import webBrowser from '../web_browser/web_browser.js';

export default {
    definition: {
        name: 'web_fetch',
        displayName: 'Web Fetch',
        pluginType: 'tool',
        description: 'Fetches content from a specified URL',
        requiresApproval: true,
        parameters: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'The URL to fetch'
                }
            },
            required: ['url']
        }
    },
    handler: async ({ url }: { url: string }) => {
        return webBrowser.handler({ action: 'browse', input: url });
    }
};
