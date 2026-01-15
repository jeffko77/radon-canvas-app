# Finding Your Correct Snowflake Account Identifier

## The Problem

You're getting a 404 error when connecting, which usually means the account identifier format is incorrect.

## How to Find Your Correct Account Format

### Method 1: From Snowflake Web UI
1. Log into your Snowflake web interface
2. Look at the URL in your browser
3. It will show something like: `https://rrb96941.us-east-1.snowflakecomputing.com`
4. The account identifier is the part before `.snowflakecomputing.com`

### Method 2: Using SQL Query
If you can connect another way, run:
```sql
SELECT CURRENT_ACCOUNT(), CURRENT_REGION();
```

This will show:
- Account locator (e.g., `RRB96941`)
- Region (e.g., `US_EAST_1`)

Then your account identifier should be: `rrb96941.us-east-1`

### Method 3: Check Your Organization
- Go to Admin → Organizations
- Look for the account locator and region

## Common Account Formats

Based on the region, your account might be:
- `rrb96941.us-east-1` (US East - Virginia)
- `rrb96941.us-west-2` (US West - Oregon)
- `rrb96941.eu-west-1` (EU - Ireland)
- `rrb96941.ap-southeast-1` (Asia Pacific - Singapore)

## Update Your Config

Once you find the correct format, update `backend/snowflake_config.py`:

```python
SNOWFLAKE_ACCOUNT = 'rrb96941.us-east-1'  # Update with your correct region
```

## Testing

After updating, test the connection:
```bash
cd backend
uv run python3 -c "from snowflake_connection import get_snowflake_connection; conn = get_snowflake_connection(); print('Connected!' if conn else 'Failed')"
```
