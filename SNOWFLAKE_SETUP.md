# Snowflake Integration Setup

This guide explains how to connect your Radon Canvas App to Snowflake for data storage and querying.

## Overview

By connecting to Snowflake, you can:
- Store neighborhoods, addresses, and radon test data in Snowflake tables
- Query data using SQL (including your existing radon data queries)
- Use Snowflake's compute resources for analytics
- Leverage your existing Snowflake data warehouse infrastructure

## Architecture

The app supports a **hybrid approach**:
- **Frontend**: React app (unchanged)
- **Backend**: FastAPI (unchanged structure, but data storage switches to Snowflake)
- **Database**: Snowflake tables instead of JSON files

This gives you the best of both worlds: a modern web UI + Snowflake's powerful data infrastructure.

## Setup Steps

### 1. Install Snowflake Dependencies

```bash
cd backend
uv pip install -r requirements-snowflake.txt
```

### 2. Configure Snowflake Connection

1. Copy the example config file:
   ```bash
   cp snowflake_config.py.example snowflake_config.py
   ```

2. Edit `snowflake_config.py` with your Snowflake credentials:
   ```python
   SNOWFLAKE_ACCOUNT = 'your_account'
   SNOWFLAKE_USER = 'your_username'
   SNOWFLAKE_PASSWORD = 'your_password'
   SNOWFLAKE_WAREHOUSE = 'your_warehouse'
   SNOWFLAKE_DATABASE = 'your_database'
   SNOWFLAKE_SCHEMA = 'your_schema'
   SNOWFLAKE_ROLE = 'your_role'  # Optional
   ```

   **OR** use environment variables (recommended for production):
   ```bash
   export USE_SNOWFLAKE=true
   export SNOWFLAKE_ACCOUNT='your_account'
   export SNOWFLAKE_USER='your_username'
   export SNOWFLAKE_PASSWORD='your_password'
   export SNOWFLAKE_WAREHOUSE='your_warehouse'
   export SNOWFLAKE_DATABASE='your_database'
   export SNOWFLAKE_SCHEMA='your_schema'
   ```

### 3. Create Tables in Snowflake

Run the SQL script to create the necessary tables:

```bash
# Connect to Snowflake and run:
snowsql -c your_connection -f setup_snowflake.sql

# Or use the Snowflake web UI to execute setup_snowflake.sql
```

This creates:
- `neighborhoods` table
- `addresses` table
- Indexes for performance
- Example view for hot neighborhoods (commented, uncomment if you have radon_test_results table)

### 4. Enable Snowflake in the App

Set the environment variable to enable Snowflake:

```bash
export USE_SNOWFLAKE=true
```

Or add to `snowflake_config.py`:
```python
USE_SNOWFLAKE = True
```

### 5. Update Backend to Use Snowflake

The backend needs to be updated to use Snowflake queries. Currently, it uses JSON file storage. To switch:

1. The `snowflake_connection.py` module is ready to use
2. Update `main.py` to check `USE_SNOWFLAKE` and use Snowflake queries instead of JSON files
3. Examples:
   - `load_neighborhoods()` → Query `SELECT * FROM neighborhoods`
   - `save_neighborhoods()` → `INSERT INTO neighborhoods ...`
   - `load_addresses()` → Query with JOIN to neighborhoods
   - `get_hot_neighborhoods()` → Query from `RADON_TEST_RESULTS` table

### 6. Test the Connection

Start the backend and test an endpoint:

```bash
cd backend
python main.py
```

Test in another terminal:
```bash
curl http://localhost:8000/api/neighborhoods
```

If connected to Snowflake, it should return data from your Snowflake tables.

## Using Your Existing Radon Data

If you already have `RADON_TEST_RESULTS` table in Snowflake (from your SQL file), you can:

1. Create a view or query that joins neighborhoods with radon test results
2. Use it in the `/api/radon/hot-neighborhoods` endpoint
3. The query structure is already documented in `backend/main.py` and `setup_snowflake.sql`

Example query (already in `setup_snowflake.sql`):
```sql
SELECT 
    n.name AS neighborhood,
    n.zip_code,
    n.ward,
    COUNT(r.object_id) AS test_count,
    AVG(r.final_result) AS average_radon_level,
    SUM(CASE WHEN r.final_result >= 4.0 THEN 1 ELSE 0 END) AS high_risk_count,
    (SUM(CASE WHEN r.final_result >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(r.object_id)) AS percent_above_action_level
FROM RADON_TEST_RESULTS r
JOIN neighborhood_reference n ON r.zip_code::STRING = n.zip_code::STRING
WHERE r.valid_test = 'Y' AND r.city = 'St. Louis'
GROUP BY n.name, n.zip_code, n.ward
HAVING COUNT(r.object_id) >= 5
ORDER BY average_radon_level DESC;
```

## Migration from JSON to Snowflake

If you have existing data in JSON files:

1. Export data from JSON files:
   ```bash
   python -c "
   import json
   with open('data/neighborhoods.json') as f:
       neighborhoods = json.load(f)
   print(json.dumps(neighborhoods, indent=2))
   "
   ```

2. Insert into Snowflake:
   ```sql
   INSERT INTO neighborhoods (id, name, description, risk_level, messaging_template, created_at)
   VALUES (...);
   ```

Or create a migration script to transfer data.

## Fallback Behavior

If Snowflake is not configured or connection fails:
- The app falls back to JSON file storage automatically
- No changes needed to the frontend
- Data operations continue to work

This ensures the app works in both modes.

## Next Steps

1. **Connect to Snowflake**: Follow steps 1-4 above
2. **Update backend queries**: Modify `main.py` to use Snowflake (I can help with this)
3. **Test with real data**: Verify all endpoints work with Snowflake
4. **Deploy**: Deploy the backend with `USE_SNOWFLAKE=true` environment variable

Would you like me to update the backend code (`main.py`) to automatically use Snowflake when configured? This would make it seamless to switch between JSON and Snowflake storage.
