"""
Snowflake connection utilities for the Radon Canvas App.

To use Snowflake instead of JSON file storage:
1. Install snowflake-connector-python: uv pip install snowflake-connector-python
2. Configure credentials in snowflake_config.py (copy from snowflake_config.py.example)
3. Set USE_SNOWFLAKE=True in environment or config
4. Create tables in Snowflake using the SQL in setup_snowflake.sql
"""

import os
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Auto-enable Snowflake if credentials are available, or use environment variable
USE_SNOWFLAKE_ENV = os.getenv('USE_SNOWFLAKE', '').lower() == 'true'

# Try to auto-detect if credentials are configured
USE_SNOWFLAKE = False
try:
    from snowflake_config import (
        SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_PAT
    )
    # If we can import credentials and have either password or PAT, enable Snowflake
    has_credentials = (
        SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER and 
        (bool(SNOWFLAKE_PASSWORD and SNOWFLAKE_PASSWORD.strip()) or bool(SNOWFLAKE_PAT and SNOWFLAKE_PAT.strip()))
    )
    USE_SNOWFLAKE = USE_SNOWFLAKE_ENV if USE_SNOWFLAKE_ENV else has_credentials
except ImportError:
    # Check environment variables
    has_credentials = (
        os.getenv('SNOWFLAKE_ACCOUNT') and os.getenv('SNOWFLAKE_USER') and 
        (os.getenv('SNOWFLAKE_PASSWORD') or os.getenv('SNOWFLAKE_PAT'))
    )
    USE_SNOWFLAKE = USE_SNOWFLAKE_ENV if USE_SNOWFLAKE_ENV else has_credentials
except Exception as e:
    logger.warning(f"Error checking Snowflake credentials: {e}")
    USE_SNOWFLAKE = USE_SNOWFLAKE_ENV

def get_snowflake_connection():
    """Get a Snowflake connection if configured. Supports password or PAT authentication."""
    if not USE_SNOWFLAKE:
        return None
    
    try:
        import snowflake.connector
        
        # Try to import config
        try:
            from snowflake_config import (
                SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD,
                SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA,
                SNOWFLAKE_ROLE, SNOWFLAKE_PAT, SNOWFLAKE_AUTHENTICATOR
            )
        except ImportError:
            # Fall back to environment variables
            SNOWFLAKE_ACCOUNT = os.getenv('SNOWFLAKE_ACCOUNT')
            SNOWFLAKE_USER = os.getenv('SNOWFLAKE_USER')
            SNOWFLAKE_PASSWORD = os.getenv('SNOWFLAKE_PASSWORD', '')
            SNOWFLAKE_PAT = os.getenv('SNOWFLAKE_PAT', '')
            SNOWFLAKE_WAREHOUSE = os.getenv('SNOWFLAKE_WAREHOUSE')
            SNOWFLAKE_DATABASE = os.getenv('SNOWFLAKE_DATABASE')
            SNOWFLAKE_SCHEMA = os.getenv('SNOWFLAKE_SCHEMA')
            SNOWFLAKE_ROLE = os.getenv('SNOWFLAKE_ROLE')
            SNOWFLAKE_AUTHENTICATOR = os.getenv('SNOWFLAKE_AUTHENTICATOR', 'password')
        
        # Determine authentication method - PAT takes precedence
        use_pat = bool(SNOWFLAKE_PAT and SNOWFLAKE_PAT.strip())
        use_password = bool(SNOWFLAKE_PASSWORD and SNOWFLAKE_PASSWORD.strip())
        
        if not SNOWFLAKE_ACCOUNT or not SNOWFLAKE_USER:
            logger.warning("Snowflake account or user not configured.")
            return None
        
        if not use_pat and not use_password:
            logger.warning("Neither SNOWFLAKE_PAT nor SNOWFLAKE_PASSWORD is configured.")
            return None
        
        # Build connection parameters
        conn_params = {
            'account': SNOWFLAKE_ACCOUNT,
            'user': SNOWFLAKE_USER,
            'warehouse': SNOWFLAKE_WAREHOUSE,
            'database': SNOWFLAKE_DATABASE,
            'schema': SNOWFLAKE_SCHEMA,
        }
        
        # Set authentication based on what's available
        if use_pat:
            # For PAT (Personal Access Token), pass it as password without authenticator
            # Snowflake will auto-detect it's a PAT based on the format
            conn_params['password'] = SNOWFLAKE_PAT
            logger.info("Using PAT (Personal Access Token) for Snowflake authentication")
        else:
            # Standard password authentication
            conn_params['password'] = SNOWFLAKE_PASSWORD
            # Use configured authenticator or default to 'snowflake' (standard password auth)
            if SNOWFLAKE_AUTHENTICATOR and SNOWFLAKE_AUTHENTICATOR != 'oauth':
                conn_params['authenticator'] = SNOWFLAKE_AUTHENTICATOR
            logger.info("Using password for Snowflake authentication")
        
        if SNOWFLAKE_ROLE:
            conn_params['role'] = SNOWFLAKE_ROLE
        
        conn = snowflake.connector.connect(**conn_params)
        logger.info("Connected to Snowflake")
        return conn
        
    except ImportError:
        logger.warning("snowflake-connector-python not installed. Install with: uv pip install snowflake-connector-python")
        return None
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to connect to Snowflake: {type(e).__name__}: {error_msg}")
        
        # Provide helpful error messages for common issues
        if "Network policy is required" in error_msg:
            logger.error("⚠️  Network policy is blocking the connection.")
            logger.error("   Your account requires a network policy that allows your IP address.")
            logger.error("   To fix this:")
            logger.error("   1. Contact your Snowflake administrator")
            logger.error("   2. Ask them to add your IP address to the network policy")
            logger.error("   3. Or use a VPN/proxy that's whitelisted")
            logger.error("   Your current IP may need to be whitelisted in Snowflake.")
        elif "404 Not Found" in error_msg or "250003" in error_msg:
            logger.error("⚠️  404 Not Found - Your Snowflake account identifier might need a region suffix.")
            logger.error("   Current account: {}".format(SNOWFLAKE_ACCOUNT))
            logger.error("   Try updating SNOWFLAKE_ACCOUNT in snowflake_config.py to one of these formats:")
            logger.error("     - rrb96941.us-east-1")
            logger.error("     - rrb96941.us-west-2")
            logger.error("     - rrb96941.eu-west-1")
            logger.error("   Or check your Snowflake account URL for the correct region.")
        elif "250001" in error_msg or "Invalid credentials" in error_msg or "Authentication failed" in error_msg:
            logger.error("⚠️  Authentication failed - Check your PAT token:")
            logger.error("   - Verify the PAT is not expired")
            logger.error("   - Check that SNOWFLAKE_PAT in snowflake_config.py is correct")
            logger.error("   - Verify the user has permission to use PATs")
        elif "Network" in error_msg or "Connection refused" in error_msg:
            logger.error("⚠️  Network/Connection error - Check network policies and firewall settings")
        
        import traceback
        logger.debug(traceback.format_exc())
        return None

def execute_snowflake_query(query: str, params: Optional[Dict] = None) -> List[Dict[str, Any]]:
    """Execute a Snowflake query and return results as list of dicts."""
    conn = get_snowflake_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        # Get column names
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        
        # Fetch results and convert to list of dicts
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        return results
    except Exception as e:
        logger.error(f"Snowflake query error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def execute_snowflake_dml(query: str, params: Optional[Dict] = None) -> int:
    """Execute a DML query (INSERT, UPDATE, DELETE) and return affected rows."""
    conn = get_snowflake_connection()
    if not conn:
        return 0
    
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        affected_rows = cursor.rowcount
        conn.commit()
        return affected_rows
    except Exception as e:
        logger.error(f"Snowflake DML error: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
