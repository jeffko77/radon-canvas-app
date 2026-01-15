#!/usr/bin/env python3
"""
Helper script to test different Snowflake account identifier formats.
This will help identify the correct account format when getting 404 errors.
"""

import sys
sys.path.insert(0, '.')

from snowflake_config import SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PAT, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA, SNOWFLAKE_ROLE

# Common region formats to try
REGION_FORMATS = [
    # AWS regions
    'us-east-1',    # US East (N. Virginia)
    'us-east-2',    # US East (Ohio)
    'us-west-1',    # US West (N. California)
    'us-west-2',    # US West (Oregon)
    'eu-west-1',    # EU (Ireland)
    'eu-central-1', # EU (Frankfurt)
    'ap-southeast-1', # Asia Pacific (Singapore)
    'ap-northeast-1', # Asia Pacific (Tokyo)
    # Azure regions
    'east-us-2.azure',
    'west-us-2.azure',
    'east-us-2',
    'west-us-2',
]

def test_account_format(account_identifier):
    """Test a specific account identifier format."""
    try:
        import snowflake.connector
        
        conn_params = {
            'account': account_identifier,
            'user': SNOWFLAKE_USER,
            'password': SNOWFLAKE_PAT,
            'warehouse': SNOWFLAKE_WAREHOUSE,
            'database': SNOWFLAKE_DATABASE,
            'schema': SNOWFLAKE_SCHEMA,
        }
        
        if SNOWFLAKE_ROLE:
            conn_params['role'] = SNOWFLAKE_ROLE
        
        conn = snowflake.connector.connect(**conn_params)
        cursor = conn.cursor()
        cursor.execute('SELECT CURRENT_VERSION(), CURRENT_ACCOUNT(), CURRENT_REGION()')
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return True, result
    except Exception as e:
        return False, str(e)

if __name__ == '__main__':
    print(f"Testing Snowflake account identifier formats...")
    print(f"Base account locator: {SNOWFLAKE_ACCOUNT}")
    print(f"User: {SNOWFLAKE_USER}")
    print(f"PAT configured: {'Yes' if SNOWFLAKE_PAT else 'No'}")
    print(f"\nTrying different region formats...\n")
    
    # Test without region first
    print(f"1. Testing: {SNOWFLAKE_ACCOUNT}")
    success, result = test_account_format(SNOWFLAKE_ACCOUNT)
    if success:
        print(f"   ✓ SUCCESS! Correct format: {SNOWFLAKE_ACCOUNT}")
        print(f"   Snowflake version: {result[0]}")
        print(f"   Account: {result[1]}")
        print(f"   Region: {result[2]}")
        sys.exit(0)
    else:
        print(f"   ✗ Failed: {result[:100]}")
    
    # Test with region suffixes
    for i, region in enumerate(REGION_FORMATS, start=2):
        account_format = f"{SNOWFLAKE_ACCOUNT}.{region}"
        print(f"{i}. Testing: {account_format}")
        success, result = test_account_format(account_format)
        if success:
            print(f"   ✓ SUCCESS! Correct format: {account_format}")
            print(f"   Snowflake version: {result[0]}")
            print(f"   Account: {result[1]}")
            print(f"   Region: {result[2]}")
            print(f"\n📝 Update your snowflake_config.py with:")
            print(f"   SNOWFLAKE_ACCOUNT = '{account_format}'")
            sys.exit(0)
        else:
            error_msg = str(result)
            if "404" in error_msg:
                print(f"   ✗ 404 - Wrong region")
            elif "250001" in error_msg or "Authentication" in error_msg:
                print(f"   ✓ Connection reached! (Auth issue - might be correct format)")
                print(f"   Error: {error_msg[:100]}")
            else:
                print(f"   ✗ Failed: {error_msg[:80]}")
    
    print("\n❌ None of the common formats worked.")
    print("\nTo find the correct format:")
    print("1. Log into Snowflake web UI")
    print("2. Check the URL - it shows the full account locator")
    print("3. Or run in Snowflake: SELECT CURRENT_ACCOUNT(), CURRENT_REGION();")
    print("4. The account format is typically: <locator>.<region>")
