from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
from datetime import datetime

app = FastAPI(title="Radon Canvas App API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Neighborhood(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    risk_level: str  # "low", "medium", "high"
    messaging_template: str
    created_at: str

class Address(BaseModel):
    id: str
    address: str
    neighborhood_id: Optional[str] = None
    status: str  # "not_visited", "visited", "interested", "scheduled", "completed"
    notes: Optional[str] = None
    visited_at: Optional[str] = None
    created_at: str

class NeighborhoodCreate(BaseModel):
    name: str
    description: Optional[str] = None
    risk_level: str
    messaging_template: str

class AddressCreate(BaseModel):
    address: str
    neighborhood_id: Optional[str] = None

# Data storage (in production, use a database)
DATA_DIR = "data"
NEIGHBORHOODS_FILE = os.path.join(DATA_DIR, "neighborhoods.json")
ADDRESSES_FILE = os.path.join(DATA_DIR, "addresses.json")

os.makedirs(DATA_DIR, exist_ok=True)

def load_neighborhoods() -> List[Dict]:
    if os.path.exists(NEIGHBORHOODS_FILE):
        with open(NEIGHBORHOODS_FILE, "r") as f:
            return json.load(f)
    return []

def save_neighborhoods(neighborhoods: List[Dict]):
    with open(NEIGHBORHOODS_FILE, "w") as f:
        json.dump(neighborhoods, f, indent=2)

def load_addresses() -> List[Dict]:
    if os.path.exists(ADDRESSES_FILE):
        with open(ADDRESSES_FILE, "r") as f:
            return json.load(f)
    return []

def save_addresses(addresses: List[Dict]):
    with open(ADDRESSES_FILE, "w") as f:
        json.dump(addresses, f, indent=2)

@app.get("/")
async def root():
    return {"message": "Radon Canvas App API"}

@app.get("/api/status")
async def get_status():
    """Get API status and data source information."""
    try:
        from snowflake_connection import USE_SNOWFLAKE, get_snowflake_connection
        snowflake_enabled = bool(USE_SNOWFLAKE)
        snowflake_connected = False
        connection_error = None
        
        if snowflake_enabled:
            try:
                conn = get_snowflake_connection()
                snowflake_connected = conn is not None
                if conn:
                    conn.close()
            except Exception as e:
                connection_error = str(e)
                logger.error(f"Failed to connect to Snowflake: {e}")
        
        return {
            "status": "running",
            "data_source": {
                "snowflake_enabled": snowflake_enabled,
                "snowflake_connected": snowflake_connected,
                "using_sample_data": not (snowflake_enabled and snowflake_connected),
                "error": connection_error
            }
        }
    except Exception as e:
        return {
            "status": "running",
            "data_source": {
                "snowflake_enabled": False,
                "snowflake_connected": False,
                "using_sample_data": True,
                "error": str(e)
            }
        }

@app.get("/api/neighborhoods", response_model=List[Neighborhood])
async def get_neighborhoods():
    return load_neighborhoods()

@app.post("/api/neighborhoods", response_model=Neighborhood)
async def create_neighborhood(neighborhood: NeighborhoodCreate):
    neighborhoods = load_neighborhoods()
    new_id = str(len(neighborhoods) + 1)
    new_neighborhood = {
        "id": new_id,
        **neighborhood.model_dump(),
        "created_at": datetime.now().isoformat()
    }
    neighborhoods.append(new_neighborhood)
    save_neighborhoods(neighborhoods)
    return new_neighborhood

@app.put("/api/neighborhoods/{neighborhood_id}", response_model=Neighborhood)
async def update_neighborhood(neighborhood_id: str, neighborhood: NeighborhoodCreate):
    neighborhoods = load_neighborhoods()
    for i, n in enumerate(neighborhoods):
        if n["id"] == neighborhood_id:
            updated = {
                "id": neighborhood_id,
                **neighborhood.model_dump(),
                "created_at": neighborhoods[i]["created_at"]
            }
            neighborhoods[i] = updated
            save_neighborhoods(neighborhoods)
            return updated
    raise HTTPException(status_code=404, detail="Neighborhood not found")

@app.delete("/api/neighborhoods/{neighborhood_id}")
async def delete_neighborhood(neighborhood_id: str):
    neighborhoods = load_neighborhoods()
    neighborhoods = [n for n in neighborhoods if n["id"] != neighborhood_id]
    save_neighborhoods(neighborhoods)
    return {"message": "Neighborhood deleted"}

@app.get("/api/addresses", response_model=List[Address])
async def get_addresses(neighborhood_id: Optional[str] = None):
    addresses = load_addresses()
    if neighborhood_id:
        addresses = [a for a in addresses if a.get("neighborhood_id") == neighborhood_id]
    return addresses

@app.post("/api/addresses", response_model=Address)
async def create_address(address: AddressCreate):
    addresses = load_addresses()
    new_id = str(len(addresses) + 1)
    new_address = {
        "id": new_id,
        **address.model_dump(),
        "status": "not_visited",
        "notes": None,
        "visited_at": None,
        "created_at": datetime.now().isoformat()
    }
    addresses.append(new_address)
    save_addresses(addresses)
    return new_address

@app.put("/api/addresses/{address_id}", response_model=Address)
async def update_address(address_id: str, address: Dict):
    addresses = load_addresses()
    for i, a in enumerate(addresses):
        if a["id"] == address_id:
            addresses[i].update(address)
            if address.get("status") != "not_visited" and not addresses[i].get("visited_at"):
                addresses[i]["visited_at"] = datetime.now().isoformat()
            save_addresses(addresses)
            return addresses[i]
    raise HTTPException(status_code=404, detail="Address not found")

@app.delete("/api/addresses/{address_id}")
async def delete_address(address_id: str):
    addresses = load_addresses()
    addresses = [a for a in addresses if a["id"] != address_id]
    save_addresses(addresses)
    return {"message": "Address deleted"}

@app.get("/api/map/tornado-path")
async def get_tornado_path():
    """
    Get the May 16 tornado path from Snowflake.
    
    Query from archdata.raw.noaa_dat table for tornado coordinates.
    Filters for May 16 tornado in St. Louis region.
    """
    try:
        try:
            from snowflake_connection import execute_snowflake_query, USE_SNOWFLAKE
            use_snowflake = USE_SNOWFLAKE
        except (ImportError, AttributeError):
            use_snowflake = False
        
        if not use_snowflake:
            # Sample data for development/testing
            return [
                {"latitude": 38.6580, "longitude": -90.2310},
                {"latitude": 38.6620, "longitude": -90.2280},
                {"latitude": 38.6680, "longitude": -90.2200},
                {"latitude": 38.6750, "longitude": -90.2150},
                {"latitude": 38.6820, "longitude": -90.2100},
                {"latitude": 38.6900, "longitude": -90.2050},
            ]
        
        # Query Snowflake for tornado path data
        # Try multiple possible column name variations for NOAA tornado data
        # Common patterns: begin_lat/begin_lon, slat/slon, or geometry columns
        queries_to_try = [
            # Try 1: Standard NOAA column names (begin_lat/begin_lon, end_lat/end_lon)
            """
            SELECT 
                begin_lat,
                begin_lon,
                end_lat,
                end_lon,
                begin_date,
                event_type
            FROM archdata.raw.noaa_dat
            WHERE begin_date = '2024-05-16'
                AND event_type = 'TORNADO'
                AND ((begin_lat BETWEEN 38.5 AND 38.8 AND begin_lon BETWEEN -90.3 AND -90.1)
                     OR (end_lat BETWEEN 38.5 AND 38.8 AND end_lon BETWEEN -90.3 AND -90.1))
            ORDER BY begin_date
            """,
            # Try 2: Alternative column names (slat/slon, elat/elon)
            """
            SELECT 
                slat as begin_lat,
                slon as begin_lon,
                elat as end_lat,
                elon as end_lon,
                begin_date,
                event_type
            FROM archdata.raw.noaa_dat
            WHERE begin_date = '2024-05-16'
                AND event_type = 'TORNADO'
                AND ((slat BETWEEN 38.5 AND 38.8 AND slon BETWEEN -90.3 AND -90.1)
                     OR (elat BETWEEN 38.5 AND 38.8 AND elon BETWEEN -90.3 AND -90.1))
            ORDER BY begin_date
            """,
            # Try 3: Simple lat/lon columns (if they exist)
            """
            SELECT 
                lat as begin_lat,
                lon as begin_lon,
                lat as end_lat,
                lon as end_lon,
                event_date as begin_date,
                event_type
            FROM archdata.raw.noaa_dat
            WHERE event_date = '2024-05-16'
                AND event_type = 'TORNADO'
                AND lat BETWEEN 38.5 AND 38.8
                AND lon BETWEEN -90.3 AND -90.1
            ORDER BY event_date
            """
        ]
        
        results = []
        for query in queries_to_try:
            try:
                results = execute_snowflake_query(query)
                if results:
                    print(f"Successfully queried tornado path with {len(results)} segments")
                    break
            except Exception as e:
                print(f"Query attempt failed: {e}")
                continue
        
        if not results:
            raise Exception("Could not query tornado path data with any known column name pattern")
        
        # Convert NOAA format to path points
        # For each tornado segment, we'll include both start and end points
        path_points = []
        for r in results:
            # Try both uppercase and lowercase column names
            begin_lat = r.get("BEGIN_LAT") or r.get("begin_lat")
            begin_lon = r.get("BEGIN_LON") or r.get("begin_lon")
            end_lat = r.get("END_LAT") or r.get("end_lat")
            end_lon = r.get("END_LON") or r.get("end_lon")
            
            # Add beginning point if valid
            if begin_lat is not None and begin_lon is not None:
                try:
                    path_points.append({
                        "latitude": float(begin_lat),
                        "longitude": float(begin_lon)
                    })
                except (ValueError, TypeError):
                    pass
            
            # Add ending point if valid and different from beginning
            if end_lat is not None and end_lon is not None:
                try:
                    # Only add if different from start point
                    if not (begin_lat == end_lat and begin_lon == end_lon):
                        path_points.append({
                            "latitude": float(end_lat),
                            "longitude": float(end_lon)
                        })
                except (ValueError, TypeError):
                    pass
        
        return path_points
        
    except Exception as e:
        # Fallback to sample data on error
        print(f"Error fetching tornado path: {e}")
        return [
            {"latitude": 38.6580, "longitude": -90.2310},
            {"latitude": 38.6620, "longitude": -90.2280},
            {"latitude": 38.6680, "longitude": -90.2200},
            {"latitude": 38.6750, "longitude": -90.2150},
        ]

@app.get("/api/map/radon-results")
async def get_radon_test_results(near_tornado: bool = False, radius_miles: float = 2.0):
    """
    Get radon test results for St. Louis region from Snowflake.
    
    Query from archdata.raw.radon_test_results table.
    Filters for valid tests in St. Louis area.
    If near_tornado is True, only returns results within radius_miles of tornado path.
    Returns coordinates and test results for mapping.
    """
    import math
    
    try:
        try:
            from snowflake_connection import execute_snowflake_query, USE_SNOWFLAKE
            use_snowflake = USE_SNOWFLAKE
        except (ImportError, AttributeError):
            use_snowflake = False
        
        # Helper function to calculate distance between two lat/lng points in miles
        def haversine_distance(lat1, lon1, lat2, lon2):
            """Calculate distance between two points in miles using Haversine formula"""
            R = 3958.8  # Earth radius in miles
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            return R * c
        
        def distance_to_path(lat, lon, path_points):
            """Calculate minimum distance from a point to any point on the tornado path"""
            if not path_points:
                return float('inf')
            min_dist = float('inf')
            for point in path_points:
                dist = haversine_distance(lat, lon, point['latitude'], point['longitude'])
                if dist < min_dist:
                    min_dist = dist
            return min_dist
        
        # Get tornado path first if filtering by proximity
        tornado_path = []
        if near_tornado:
            try:
                tornado_response = await get_tornado_path()
                if tornado_response:
                    tornado_path = tornado_response
            except:
                pass
        
        if not use_snowflake:
            print("Snowflake not enabled - using sample radon test data")
            # Sample data for development/testing - generate more points across St. Louis
            sample_results = []
            
            # Generate sample data across St. Louis area
            base_results = [
                {"latitude": 38.6580, "longitude": -90.2310, "final_result": 5.2, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.6620, "longitude": -90.2280, "final_result": 3.1, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.6680, "longitude": -90.2200, "final_result": 6.8, "valid_test": "Y", "city": "St. Louis", "zip_code": "63115"},
                {"latitude": 38.6750, "longitude": -90.2150, "final_result": 2.9, "valid_test": "Y", "city": "St. Louis", "zip_code": "63115"},
                {"latitude": 38.6900, "longitude": -90.2050, "final_result": 4.5, "valid_test": "Y", "city": "St. Louis", "zip_code": "63147"},
                {"latitude": 38.6550, "longitude": -90.2290, "final_result": 5.8, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.6610, "longitude": -90.2270, "final_result": 4.3, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.6700, "longitude": -90.2220, "final_result": 3.5, "valid_test": "Y", "city": "St. Louis", "zip_code": "63115"},
                # Add more points across St. Louis
                {"latitude": 38.6350, "longitude": -90.2000, "final_result": 4.8, "valid_test": "Y", "city": "St. Louis", "zip_code": "63106"},
                {"latitude": 38.6420, "longitude": -90.2100, "final_result": 3.2, "valid_test": "Y", "city": "St. Louis", "zip_code": "63106"},
                {"latitude": 38.6490, "longitude": -90.2180, "final_result": 5.5, "valid_test": "Y", "city": "St. Louis", "zip_code": "63112"},
                {"latitude": 38.6560, "longitude": -90.2250, "final_result": 3.8, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.6630, "longitude": -90.2320, "final_result": 6.2, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.6700, "longitude": -90.2400, "final_result": 4.1, "valid_test": "Y", "city": "St. Louis", "zip_code": "63112"},
                {"latitude": 38.6770, "longitude": -90.2480, "final_result": 5.9, "valid_test": "Y", "city": "St. Louis", "zip_code": "63112"},
                {"latitude": 38.6840, "longitude": -90.2550, "final_result": 3.6, "valid_test": "Y", "city": "St. Louis", "zip_code": "63115"},
                {"latitude": 38.6910, "longitude": -90.2620, "final_result": 4.7, "valid_test": "Y", "city": "St. Louis", "zip_code": "63115"},
                {"latitude": 38.6980, "longitude": -90.2680, "final_result": 6.5, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
                {"latitude": 38.7050, "longitude": -90.2150, "final_result": 3.9, "valid_test": "Y", "city": "St. Louis", "zip_code": "63147"},
                {"latitude": 38.7120, "longitude": -90.2080, "final_result": 5.1, "valid_test": "Y", "city": "St. Louis", "zip_code": "63147"},
                {"latitude": 38.6280, "longitude": -90.2380, "final_result": 4.4, "valid_test": "Y", "city": "St. Louis", "zip_code": "63108"},
                {"latitude": 38.6180, "longitude": -90.2480, "final_result": 6.1, "valid_test": "Y", "city": "St. Louis", "zip_code": "63108"},
                {"latitude": 38.6080, "longitude": -90.2580, "final_result": 3.4, "valid_test": "Y", "city": "St. Louis", "zip_code": "63110"},
                {"latitude": 38.5980, "longitude": -90.2380, "final_result": 5.3, "valid_test": "Y", "city": "St. Louis", "zip_code": "63118"},
                {"latitude": 38.5880, "longitude": -90.2280, "final_result": 4.0, "valid_test": "Y", "city": "St. Louis", "zip_code": "63111"},
                {"latitude": 38.5780, "longitude": -90.2180, "final_result": 6.7, "valid_test": "Y", "city": "St. Louis", "zip_code": "63111"},
                {"latitude": 38.6380, "longitude": -90.1980, "final_result": 3.7, "valid_test": "Y", "city": "St. Louis", "zip_code": "63101"},
                {"latitude": 38.6480, "longitude": -90.2050, "final_result": 5.4, "valid_test": "Y", "city": "St. Louis", "zip_code": "63106"},
            ]
            sample_results.extend(base_results)
            
            # Filter by proximity to tornado path if requested
            if near_tornado and tornado_path:
                filtered_results = []
                for result in sample_results:
                    dist = distance_to_path(result['latitude'], result['longitude'], tornado_path)
                    if dist <= radius_miles:
                        filtered_results.append(result)
                return filtered_results
            return sample_results
        
        # Query Snowflake for radon test results
        # Extract x,y from geometry_data VARIANT field
        # Try both 'YES' and 'Y' for valid_test filter
        query = """
        SELECT 
            GEOMETRY_DATA:x::FLOAT as x_coord,
            GEOMETRY_DATA:y::FLOAT as y_coord,
            final_result,
            valid_test,
            city,
            zip_code
        FROM archdata.raw.radon_test_results
        WHERE (valid_test = 'YES' OR valid_test = 'Y')
            AND city = 'St. Louis'
        LIMIT 5000
        """
        
        try:
            results = execute_snowflake_query(query)
            print(f"Successfully executed Snowflake query, got {len(results)} results")
        except Exception as e:
            query_error = str(e)
            print(f"Query failed: {e}")
            raise Exception(f"Unable to query Snowflake: {query_error}")
        
        # Convert projected coordinates (UTM Zone 15N) to WGS84 lat/long
        from pyproj import Transformer
        
        # UTM Zone 15N (EPSG:32615) to WGS84 (EPSG:4326)
        transformer = Transformer.from_crs("EPSG:32615", "EPSG:4326", always_xy=True)
        
        all_results = []
        for r in results:
            try:
                # Get x, y coordinates from query result
                x_coord = r.get("X_COORD") or r.get("x_coord")
                y_coord = r.get("Y_COORD") or r.get("y_coord")
                
                if x_coord and y_coord:
                    # Convert from projected to lat/long
                    lng, lat = transformer.transform(float(x_coord), float(y_coord))
                    
                    # Filter to St. Louis area (roughly) - wider range
                    if 38.4 <= lat <= 38.9 and -90.5 <= lng <= -90.0:
                        valid_test_val = str(r.get("VALID_TEST") or r.get("valid_test") or "N")
                        # Normalize valid_test: convert 'YES' to 'Y' for frontend compatibility
                        if valid_test_val.upper() in ['YES', 'Y']:
                            valid_test_val = 'Y'
                        else:
                            valid_test_val = 'N'
                        
                        all_results.append({
                            "latitude": lat,
                            "longitude": lng,
                            "final_result": float(r.get("FINAL_RESULT") or r.get("final_result") or 0),
                            "valid_test": valid_test_val,
                            "city": r.get("CITY") or r.get("city") or "St. Louis",
                            "zip_code": r.get("ZIP_CODE") or r.get("zip_code"),
                        })
            except Exception as e:
                # Skip records with conversion errors
                continue
        
        # Filter by proximity to tornado path if requested
        if near_tornado and tornado_path:
            filtered_results = []
            for result in all_results:
                dist = distance_to_path(result['latitude'], result['longitude'], tornado_path)
                if dist <= radius_miles:
                    filtered_results.append(result)
            return filtered_results
        
        return all_results
        
    except Exception as e:
        # Fallback to sample data on error
        print(f"Error fetching radon test results: {e}")
        return [
            {"latitude": 38.6580, "longitude": -90.2310, "final_result": 5.2, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
            {"latitude": 38.6620, "longitude": -90.2280, "final_result": 3.1, "valid_test": "Y", "city": "St. Louis", "zip_code": "63113"},
        ]

@app.get("/api/radon/hot-neighborhoods")
async def get_hot_neighborhoods(minTests: int = 5, sortBy: str = "average"):
    """
    Get neighborhoods with elevated radon levels.
    
    In production, this would query your Snowflake RADON_TEST_RESULTS table:
    
    SELECT 
        n.neighborhood,
        n.zip_code,
        n.ward,
        COUNT(*) as test_count,
        AVG(r.final_result) as average_radon_level,
        SUM(CASE WHEN r.final_result >= 4.0 THEN 1 ELSE 0 END) as high_risk_count,
        (SUM(CASE WHEN r.final_result >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as percent_above_action_level
    FROM RADON_TEST_RESULTS r
    JOIN neighborhood_reference n ON r.zip_code::STRING = n.zip_code::STRING
    WHERE r.valid_test = 'Y' AND r.city = 'St. Louis'
    GROUP BY n.neighborhood, n.zip_code, n.ward
    HAVING COUNT(*) >= :minTests
    ORDER BY 
        CASE WHEN :sortBy = 'average' THEN AVG(r.final_result) END DESC,
        CASE WHEN :sortBy = 'count' THEN COUNT(*) END DESC,
        CASE WHEN :sortBy = 'percent' THEN percent_above_action_level END DESC
    """
    
    # Sample data structure - replace with Snowflake query in production
    # TODO: Connect to Snowflake and execute the query above
    sample_data = [
        {"neighborhood": "The Ville", "zip_code": 63113, "ward": 19, "test_count": 45, "average_radon_level": 6.8, "high_risk_count": 32, "percent_above_action_level": 71.1},
        {"neighborhood": "Walnut Park", "zip_code": 63113, "ward": 21, "test_count": 38, "average_radon_level": 6.2, "high_risk_count": 26, "percent_above_action_level": 68.4},
        {"neighborhood": "Penrose", "zip_code": 63113, "ward": 21, "test_count": 52, "average_radon_level": 5.9, "high_risk_count": 35, "percent_above_action_level": 67.3},
        {"neighborhood": "College Hill", "zip_code": 63115, "ward": 21, "test_count": 28, "average_radon_level": 5.7, "high_risk_count": 18, "percent_above_action_level": 64.3},
        {"neighborhood": "Mark Twain", "zip_code": 63113, "ward": 19, "test_count": 33, "average_radon_level": 5.5, "high_risk_count": 20, "percent_above_action_level": 60.6},
        {"neighborhood": "Fairground Neighborhood", "zip_code": 63106, "ward": 19, "test_count": 41, "average_radon_level": 5.3, "high_risk_count": 24, "percent_above_action_level": 58.5},
        {"neighborhood": "O'Fallon", "zip_code": 63106, "ward": 19, "test_count": 36, "average_radon_level": 5.1, "high_risk_count": 21, "percent_above_action_level": 58.3},
        {"neighborhood": "Fountain Park", "zip_code": 63106, "ward": 19, "test_count": 29, "average_radon_level": 4.9, "high_risk_count": 16, "percent_above_action_level": 55.2},
        {"neighborhood": "North Pointe", "zip_code": 63147, "ward": 2, "test_count": 31, "average_radon_level": 4.8, "high_risk_count": 17, "percent_above_action_level": 54.8},
        {"neighborhood": "Baden", "zip_code": 63147, "ward": 2, "test_count": 27, "average_radon_level": 4.7, "high_risk_count": 14, "percent_above_action_level": 51.9},
    ]
    
    # Filter by minimum tests
    filtered = [n for n in sample_data if n["test_count"] >= minTests]
    
    # Sort
    if sortBy == "average":
        filtered.sort(key=lambda x: x["average_radon_level"], reverse=True)
    elif sortBy == "count":
        filtered.sort(key=lambda x: x["test_count"], reverse=True)
    elif sortBy == "percent":
        filtered.sort(key=lambda x: x["percent_above_action_level"], reverse=True)
    
    return filtered

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
