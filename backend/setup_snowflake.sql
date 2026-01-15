-- Snowflake Setup Script for Radon Canvas App
-- Run this script to create the necessary tables in Snowflake

-- Create neighborhoods table
CREATE OR REPLACE TABLE neighborhoods (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    risk_level VARCHAR(20) NOT NULL,  -- 'low', 'medium', 'high'
    messaging_template TEXT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create addresses table
CREATE OR REPLACE TABLE addresses (
    id VARCHAR(50) PRIMARY KEY,
    address VARCHAR(500) NOT NULL,
    neighborhood_id VARCHAR(50),
    status VARCHAR(50) NOT NULL,  -- 'not_visited', 'visited', 'interested', 'scheduled', 'completed'
    notes TEXT,
    visited_at TIMESTAMP_NTZ,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_addresses_neighborhood ON addresses(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_addresses_status ON addresses(status);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_name ON neighborhoods(name);

-- Example: Query to get hot neighborhoods (if you have radon_test_results table)
-- This would join with your RADON_TEST_RESULTS table from the SQL file you provided
/*
CREATE OR REPLACE VIEW hot_neighborhoods AS
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
*/
