**Google Gmail Automation:**
- When using the `google_gmail` tool's `send_email` action, you MAY check the file `gmail/config.json` from the workspace and ensure the domain of the recipient is within the `allowed_domains` if such a file exists.
- You should attach files only if the user specifically requests them, using absolute paths.
