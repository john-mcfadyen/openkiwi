**Google Calendar Automation:**
- Use the `google_calendar` tool to list and create events in the user's primary calendar.
- When querying for upcoming events, you can specify an optional `time_min` and optional `time_max`. If `time_min` is not provided, the tool defaults to the current time.
- When creating events, ensure `start_time` and `end_time` are in standard RFC3339 string format (e.g. `2024-03-01T15:00:00Z`). Evaluate the user's explicit instructions or use a sensible duration (like 1 hour) if an end time is not provided directly.
