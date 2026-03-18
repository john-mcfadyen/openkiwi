# Web Fetch

Fetches the content of a webpage or URL and returns it as text. Use this tool to retrieve documentation, API responses, raw files from the internet, or any other web resource by its direct URL.

## Parameters

- `url` — The full URL to fetch (e.g. `"https://api.github.com/repos/owner/repo"`).

## Example

```json
{
  "url": "https://raw.githubusercontent.com/nicedoc/project/main/README.md"
}
```

## Notes

- Returns the page content as text. HTML pages are returned as-is; use your judgment to extract the relevant parts.
- For discovering content without a known URL, use **Web Search** instead.
- This tool requires approval before execution.
