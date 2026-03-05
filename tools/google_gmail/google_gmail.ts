import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

type Action = 'get_unread' | 'send_email';

interface GoogleGmailArgs {
    action: Action;
    to?: string;
    subject?: string;
    body?: string;
    attachment_path?: string;
    max_results?: number;
}

function getClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Google credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.gmail({ version: 'v1', auth: oauth2Client });
}

function createMimeMessage(to: string, subject: string, bodyText: string, attachmentPath?: string): string {
    const boundary = 'foo_bar_baz';
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
    ];

    if (attachmentPath && fs.existsSync(attachmentPath)) {
        messageParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        messageParts.push('');
        messageParts.push(`--${boundary}`);
        messageParts.push('Content-Type: text/plain; charset="UTF-8"');
        messageParts.push('MIME-Version: 1.0');
        messageParts.push('Content-Transfer-Encoding: 7bit');
        messageParts.push('');
        messageParts.push(bodyText);
        messageParts.push('');

        const filename = path.basename(attachmentPath);
        const fileData = fs.readFileSync(attachmentPath).toString('base64');
        messageParts.push(`--${boundary}`);
        messageParts.push(`Content-Type: application/octet-stream; name="${filename}"`);
        messageParts.push('Content-Transfer-Encoding: base64');
        messageParts.push(`Content-Disposition: attachment; filename="${filename}"`);
        messageParts.push('');
        messageParts.push(fileData);
        messageParts.push('');
        messageParts.push(`--${boundary}--`);
    } else {
        messageParts.push('Content-Type: text/plain; charset="UTF-8"');
        messageParts.push('');
        messageParts.push(bodyText);
    }

    // Convert to base64url format
    const message = messageParts.join('\r\n');
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export default {
    definition: {
        name: 'google_gmail',
        displayName: 'Google Gmail',
        pluginType: 'tool',
        description: 'Read and send emails using Google Gmail.',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['get_unread', 'send_email'],
                    description: 'The action to perform: get_unread or send_email.'
                },
                to: {
                    type: 'string',
                    description: 'Recipient email address. Required for send_email.'
                },
                subject: {
                    type: 'string',
                    description: 'Email subject. Required for send_email.'
                },
                body: {
                    type: 'string',
                    description: 'Email body text. Required for send_email.'
                },
                attachment_path: {
                    type: 'string',
                    description: 'Absolute path to an attachment file. Optional for send_email.'
                },
                max_results: {
                    type: 'number',
                    description: 'Maximum number of emails to return for get_unread (default 10).'
                }
            },
            required: ['action']
        }
    },
    handler: async (args: GoogleGmailArgs) => {
        try {
            const gmailApi = getClient();

            switch (args.action) {
                case 'get_unread': {
                    const maxResults = args.max_results || 10;
                    const res = await gmailApi.users.messages.list({
                        userId: 'me',
                        q: 'is:unread in:inbox',
                        maxResults: maxResults
                    });

                    const messages = res.data.messages || [];
                    const emailDetails = [];
                    for (const msg of messages) {
                        if (msg.id) {
                            const detail = await gmailApi.users.messages.get({
                                userId: 'me',
                                id: msg.id,
                                format: 'metadata',
                                metadataHeaders: ['Subject', 'From', 'Date']
                            });
                            const headers = detail.data.payload?.headers || [];
                            const getHeader = (name: string) => headers.find(h => h.name === name)?.value || '';

                            emailDetails.push({
                                id: detail.data.id,
                                snippet: detail.data.snippet,
                                subject: getHeader('Subject'),
                                from: getHeader('From'),
                                date: getHeader('Date')
                            });
                        }
                    }

                    return {
                        unread_emails: emailDetails
                    };
                }

                case 'send_email': {
                    if (!args.to) return { error: 'to is required for send_email' };
                    if (!args.subject) return { error: 'subject is required for send_email' };
                    if (!args.body) return { error: 'body is required for send_email' };

                    const rawMessage = createMimeMessage(args.to, args.subject, args.body, args.attachment_path);

                    const res = await gmailApi.users.messages.send({
                        userId: 'me',
                        requestBody: {
                            raw: rawMessage
                        }
                    });

                    return {
                        sent: {
                            id: res.data.id,
                            to: args.to,
                            subject: args.subject,
                            attachment: !!args.attachment_path
                        }
                    };
                }

                default:
                    return { error: `Unknown action: ${args.action}` };
            }
        } catch (err: any) {
            return { error: err.message || 'Gmail API error' };
        }
    }
};
