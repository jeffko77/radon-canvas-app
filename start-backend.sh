#!/bin/bash
cd backend
# Use uv run to ensure dependencies are available
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
