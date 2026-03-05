import { google } from 'googleapis';

type Action = 'list_events' | 'create_event';

interface GoogleCalendarArgs {
    action: Action;
    time_min?: string;
    time_max?: string;
    max_results?: number;
    summary?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
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
    return google.calendar({ version: 'v3', auth: oauth2Client });
}

export default {
    definition: {
        name: 'google_calendar',
        displayName: 'Google Calendar',
        pluginType: 'tool',
        description: 'Read and schedule events using Google Calendar.',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['list_events', 'create_event'],
                    description: 'The action to perform: list_events or create_event.'
                },
                time_min: {
                    type: 'string',
                    description: 'Lower bound (inclusive) for an event\'s end time to filter by. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Optional.'
                },
                time_max: {
                    type: 'string',
                    description: 'Upper bound (exclusive) for an event\'s start time to filter by. Must be an RFC3339 timestamp. Optional.'
                },
                max_results: {
                    type: 'number',
                    description: 'Maximum number of events returned on one result page. Optional.'
                },
                summary: {
                    type: 'string',
                    description: 'Title of the event. Required for create_event.'
                },
                start_time: {
                    type: 'string',
                    description: 'Start time of the event. Must be an RFC3339 timestamp. Required for create_event.'
                },
                end_time: {
                    type: 'string',
                    description: 'End time of the event. Must be an RFC3339 timestamp. Required for create_event.'
                },
                description: {
                    type: 'string',
                    description: 'Description of the event. Optional for create_event.'
                }
            },
            required: ['action']
        }
    },
    handler: async (args: GoogleCalendarArgs) => {
        try {
            const calendarApi = getClient();

            switch (args.action) {
                case 'list_events': {
                    const timeMin = args.time_min || new Date().toISOString();
                    const maxResults = args.max_results || 10;

                    const res = await calendarApi.events.list({
                        calendarId: 'primary',
                        timeMin: timeMin,
                        timeMax: args.time_max,
                        maxResults: maxResults,
                        singleEvents: true,
                        orderBy: 'startTime',
                    });

                    const events = res.data.items || [];
                    const eventDetails = events.map(event => ({
                        id: event.id,
                        summary: event.summary,
                        description: event.description,
                        start: event.start?.dateTime || event.start?.date,
                        end: event.end?.dateTime || event.end?.date,
                    }));

                    return {
                        events: eventDetails
                    };
                }

                case 'create_event': {
                    if (!args.summary) return { error: 'summary is required for create_event' };
                    if (!args.start_time) return { error: 'start_time is required for create_event' };
                    if (!args.end_time) return { error: 'end_time is required for create_event' };

                    const res = await calendarApi.events.insert({
                        calendarId: 'primary',
                        requestBody: {
                            summary: args.summary,
                            description: args.description,
                            start: {
                                dateTime: args.start_time,
                            },
                            end: {
                                dateTime: args.end_time,
                            },
                        }
                    });

                    return {
                        created_event: {
                            id: res.data.id,
                            summary: res.data.summary,
                            start: res.data.start?.dateTime,
                            end: res.data.end?.dateTime,
                            link: res.data.htmlLink
                        }
                    };
                }

                default:
                    return { error: `Unknown action: ${args.action}` };
            }
        } catch (err: any) {
            return { error: err.message || 'Calendar API error' };
        }
    }
};
