# Qwen3-TTS API Specification

## Base URL

`http://localhost:8000`

## Endpoints

### GET /api/languages/

Returns all supported languages for text-to-speech generation.

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `languages` | `string[]` | List of supported language names |

**Example Response:**

```json
{
  "languages": [
    "Japanese",
    "English",
    "Chinese",
    "Korean",
    "German",
    "French",
    "Spanish",
    "Italian"
  ]
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Successful response |

## Conventions

- Routes are prefixed with `/api`
- All responses are JSON
- Route tags are used for OpenAPI documentation grouping at `/docs`
