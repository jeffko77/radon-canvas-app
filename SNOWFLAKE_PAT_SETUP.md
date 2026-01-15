# Snowflake PAT (Personal Access Token) Setup Guide

This guide explains how to configure the Radon Canvas App to use a Personal Access Token (PAT) for Snowflake authentication instead of a password.

## What is a PAT?

A Personal Access Token (PAT) is a secure alternative to password authentication for Snowflake. It provides:
- Better security (no password in config files)
- Token expiration and revocation capabilities
- Easier integration with CI/CD pipelines

## Setup Steps

### 1. Configure the PAT in `backend/snowflake_config.py`

Open `backend/snowflake_config.py` and set your PAT:

```python
SNOWFLAKE_PAT = 'your-pat-token-here'  # Set your PAT here
SNOWFLAKE_PASSWORD = ''  # Leave empty when using PAT
```

**Important:** Replace `'your-pat-token-here'` with your actual PAT token.

### 2. Or Use Environment Variable (Recommended for Production)

Set the PAT as an environment variable:

```bash
export SNOWFLAKE_PAT='your-pat-token-here'
```

Then in `snowflake_config.py`, use:

```python
import os
SNOWFLAKE_PAT = os.getenv('SNOWFLAKE_PAT', '')
```

### 3. Restart the Backend Server

After setting the PAT, restart your backend server:

```bash
cd backend
# If using start-backend.sh
./start-backend.sh

# Or manually
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## How It Works

The connection code will automatically:
1. Check if `SNOWFLAKE_PAT` is set
2. If PAT is present, use OAuth authenticator with the token
3. If PAT is not set, fall back to password authentication

## Verify Connection

Check the connection status:

```bash
curl http://localhost:8000/api/status
```

You should see:
```json
{
  "status": "running",
  "data_source": {
    "snowflake_enabled": true,
    "snowflake_connected": true,
    "using_sample_data": false
  }
}
```

## Security Best Practices

1. **Never commit PAT to git**: Add `snowflake_config.py` to `.gitignore`
2. **Use environment variables** in production
3. **Rotate tokens regularly**
4. **Use least privilege roles** for the PAT

## Troubleshooting

### Connection fails with PAT

1. Verify the PAT is correct (no extra spaces)
2. Check that the PAT hasn't expired
3. Verify the user has the necessary permissions
4. Check backend logs for specific error messages

### Falls back to password authentication

- The code will automatically use password if PAT is not set or empty
- Check that `SNOWFLAKE_PAT` is not an empty string

## Example Configuration

```python
# backend/snowflake_config.py
SNOWFLAKE_ACCOUNT = 'your-account'
SNOWFLAKE_USER = 'your-user'
SNOWFLAKE_PAT = 'eyJ...'  # Your PAT token
SNOWFLAKE_PASSWORD = ''  # Leave empty
SNOWFLAKE_WAREHOUSE = 'COMPUTE_WH'
SNOWFLAKE_DATABASE = 'ARCHDATA'
SNOWFLAKE_SCHEMA = 'RAW'
SNOWFLAKE_ROLE = 'ACCOUNTADMIN'
```
