# Qwen3-TTS API Specification

## Overview
The Qwen3-TTS API is a FastAPI-based service that provides text-to-speech generation capabilities using Qwen3 models. It supports voice cloning (from local datasets) and voice design (via prompts) features via RESTful endpoints.

## Purpose
Expose a simple HTTP API for generating speech from text, enabling integration with other applications, web interfaces, or CLI tools.

## Base URL
`http://localhost:8000`

## Endpoints
### GET /api/dataset/characters
Returns a list of all character names available in the dataset.

- **Response**: JSON object with a `characters` array.
- **Status**: `200 OK`.

### GET /api/languages
Returns a list of supported languages for text-to-speech generation.

- **Response**: JSON object with a `languages` array.
- **Status**: `200 OK`.

## Conventions
- All routes are prefixed with `/api`.
- All responses are JSON.
- Route tags are used for OpenAPI documentation grouping at `/docs`.