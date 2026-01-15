# Tornado Map Setup Guide

This guide explains how to set up the Tornado Map feature that displays the May 16 tornado path overlaid with radon test results.

## Overview

The Tornado Map visualization shows:
- **Tornado Path**: Red line showing the May 16 tornado path through St. Louis
- **Radon Test Results**: Colored dots representing test results
  - 🔵 Blue dots: Radon levels < 4.1 pCi/L (below EPA action level)
  - 🔴 Red dots: Radon levels ≥ 4.1 pCi/L (above EPA action level)

## Data Sources

The map uses data from Snowflake:
- **Tornado Path**: `archdata.raw.noaa_dat` table
- **Radon Test Results**: `archdata.raw.radon_test_results` table

## Prerequisites

1. **Snowflake Connection**: Your Snowflake credentials must be configured
2. **Data Tables**: The following tables must exist with the correct schema:
   - `archdata.raw.noaa_dat` (tornado path data)
   - `archdata.raw.radon_test_results` (radon test results)

## Installing Map Dependencies

Install the required mapping libraries:

```bash
cd frontend
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

## Snowflake Query Configuration

The backend queries Snowflake for the data. You may need to adjust the SQL queries in `backend/main.py` based on your actual table structure.

### Tornado Path Query

The query in `/api/map/tornado-path` expects:
- Table: `archdata.raw.noaa_dat`
- Columns: `latitude`, `longitude`, `event_date`, `event_type`, `point_order`
- Filters: May 16, 2024 tornado in St. Louis region

**Adjust the query if your schema differs:**
```sql
SELECT 
    latitude,
    longitude
FROM archdata.raw.noaa_dat
WHERE event_date = '2024-05-16'
    AND event_type = 'TORNADO'
    AND latitude BETWEEN 38.5 AND 38.8
    AND longitude BETWEEN -90.3 AND -90.1
ORDER BY point_order
```

### Radon Test Results Query

The query in `/api/map/radon-results` expects:
- Table: `archdata.raw.radon_test_results`
- Columns: Geometry column or separate `latitude`/`longitude` columns
- Filters: Valid tests in St. Louis region

**If geometry is stored as GEOGRAPHY/GEOMETRY:**
```sql
SELECT 
    ST_X(geometry_data) AS longitude,
    ST_Y(geometry_data) AS latitude,
    final_result,
    valid_test,
    city,
    zip_code
FROM archdata.raw.radon_test_results
WHERE valid_test = 'Y'
    AND city = 'St. Louis'
    AND ST_X(geometry_data) BETWEEN -90.3 AND -90.1
    AND ST_Y(geometry_data) BETWEEN 38.5 AND 38.8
LIMIT 1000
```

**If you have separate latitude/longitude columns:**
```sql
SELECT 
    longitude,
    latitude,
    final_result,
    valid_test,
    city,
    zip_code
FROM archdata.raw.radon_test_results
WHERE valid_test = 'Y'
    AND city = 'St. Louis'
    AND latitude BETWEEN 38.5 AND 38.8
    AND longitude BETWEEN -90.3 AND -90.1
LIMIT 1000
```

## Testing Without Snowflake

If Snowflake is not configured, the endpoints return sample data for development/testing. The map will still render with sample coordinates.

## Map Features

1. **Interactive Map**: Zoom, pan, and click on markers
2. **Legend**: Shows what each color represents
3. **Popup Details**: Click on radon test markers to see:
   - Radon level (pCi/L)
   - City and ZIP code
   - Status (above/below action level)
4. **Data Summary**: Statistics shown below the map

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Verify Leaflet CSS is loaded (should be automatic)
- Check network tab to see if API calls are failing

### No Data Showing
- Verify Snowflake connection is configured
- Check that tables exist and have data
- Adjust date filters if tornado occurred on different date
- Verify coordinate ranges match your data

### Coordinates Not Appearing
- Check if geometry data needs to be extracted differently
- Verify latitude/longitude columns exist and have valid values
- Check Snowflake query results in backend logs

### Performance Issues
- Limit the number of radon test results (current limit: 1000)
- Consider adding spatial indexes in Snowflake
- Use bounding box filters to reduce data volume

## Customization

### Change Map Center
Edit `mapCenter` in `TornadoMap.tsx`:
```typescript
const [mapCenter, setMapCenter] = useState<[number, number]>([38.6270, -90.1994])
```

### Adjust Marker Colors
Edit `getRadonMarkerColor()` function in `TornadoMap.tsx`:
```typescript
const getRadonMarkerColor = (result: RadonTestResult): string => {
    if (result.valid_test !== 'Y') return '#gray'
    return result.final_result >= 4.1 ? '#dc2626' : '#2563eb'
}
```

### Change Action Level Threshold
Update the threshold from 4.1 to your desired value in:
- `TornadoMap.tsx` (marker coloring logic)
- Backend query if needed

## Next Steps

1. **Configure Snowflake**: Set up credentials and connection
2. **Adjust Queries**: Modify SQL queries to match your table structure
3. **Test**: Load the map and verify data appears correctly
4. **Customize**: Adjust colors, markers, or filters as needed

The map is accessible via the "Tornado Map" link in the navigation bar once everything is configured.
