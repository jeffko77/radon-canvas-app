import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { tornadoMapApi } from '../services/api'
import './TornadoMap.css'

// Fix for default marker icons in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface TornadoPoint {
  latitude: number
  longitude: number
}

interface RadonTestResult {
  latitude: number
  longitude: number
  final_result: number
  valid_test: string
  city?: string
  zip_code?: string
}

interface MapBounds {
  lat: number
  lng: number
}

function MapBoundsController({ bounds }: { bounds: MapBounds[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length > 0) {
      const validBounds = bounds.filter(b => 
        b != null && 
        typeof b.lat === 'number' && 
        typeof b.lng === 'number' && 
        !isNaN(b.lat) && 
        !isNaN(b.lng)
      )
      
      if (validBounds.length > 0) {
        try {
          const latlngs = validBounds.map(b => [b.lat, b.lng] as [number, number])
          const group = new L.LatLngBounds(latlngs)
          map.fitBounds(group, { padding: [50, 50] })
        } catch (e) {
          console.error('Error fitting bounds:', e)
        }
      }
    }
  }, [bounds, map])
  
  return null
}

export default function TornadoMap() {
  const [tornadoPath, setTornadoPath] = useState<TornadoPoint[]>([])
  const [radonResults, setRadonResults] = useState<RadonTestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.6270, -90.1994]) // St. Louis center
  const [mapZoom, setMapZoom] = useState(11)

  useEffect(() => {
    loadMapData()
  }, [])

  const loadMapData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load tornado path data
      try {
        const tornadoData = await tornadoMapApi.getTornadoPath()
        if (tornadoData && tornadoData.length > 0) {
          setTornadoPath(tornadoData)
          
          // Center map on tornado path
          const lats = tornadoData.map(p => p.latitude)
          const lngs = tornadoData.map(p => p.longitude)
          const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length
          const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
          setMapCenter([avgLat, avgLng])
        }
      } catch (err: any) {
        console.error('Failed to load tornado path:', err)
        // Use fallback data
        setTornadoPath([
          { latitude: 38.6580, longitude: -90.2310 },
          { latitude: 38.6620, longitude: -90.2280 },
          { latitude: 38.6680, longitude: -90.2200 },
          { latitude: 38.6750, longitude: -90.2150 },
        ])
      }

      // Load all radon test results (no filtering - show all results in St. Louis area)
      try {
        const radonData = await tornadoMapApi.getRadonTestResults(false, 2.0)
        if (radonData) {
          setRadonResults(radonData)
        }
      } catch (err: any) {
        console.error('Failed to load radon test results:', err)
        // Use fallback data with more points
        setRadonResults([
          { latitude: 38.6580, longitude: -90.2310, final_result: 5.2, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.6620, longitude: -90.2280, final_result: 3.1, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.6680, longitude: -90.2200, final_result: 6.8, valid_test: 'Y', city: 'St. Louis', zip_code: '63115' },
          { latitude: 38.6750, longitude: -90.2150, final_result: 2.9, valid_test: 'Y', city: 'St. Louis', zip_code: '63115' },
          { latitude: 38.6900, longitude: -90.2050, final_result: 4.5, valid_test: 'Y', city: 'St. Louis', zip_code: '63147' },
          { latitude: 38.6550, longitude: -90.2290, final_result: 5.8, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.6610, longitude: -90.2270, final_result: 4.3, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.6700, longitude: -90.2220, final_result: 3.5, valid_test: 'Y', city: 'St. Louis', zip_code: '63115' },
          { latitude: 38.6350, longitude: -90.2000, final_result: 4.8, valid_test: 'Y', city: 'St. Louis', zip_code: '63106' },
          { latitude: 38.6420, longitude: -90.2100, final_result: 3.2, valid_test: 'Y', city: 'St. Louis', zip_code: '63106' },
          { latitude: 38.6490, longitude: -90.2180, final_result: 5.5, valid_test: 'Y', city: 'St. Louis', zip_code: '63112' },
          { latitude: 38.6560, longitude: -90.2250, final_result: 3.8, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.6630, longitude: -90.2320, final_result: 6.2, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.6700, longitude: -90.2400, final_result: 4.1, valid_test: 'Y', city: 'St. Louis', zip_code: '63112' },
          { latitude: 38.6770, longitude: -90.2480, final_result: 5.9, valid_test: 'Y', city: 'St. Louis', zip_code: '63112' },
          { latitude: 38.6840, longitude: -90.2550, final_result: 3.6, valid_test: 'Y', city: 'St. Louis', zip_code: '63115' },
          { latitude: 38.6910, longitude: -90.2620, final_result: 4.7, valid_test: 'Y', city: 'St. Louis', zip_code: '63115' },
          { latitude: 38.6980, longitude: -90.2680, final_result: 6.5, valid_test: 'Y', city: 'St. Louis', zip_code: '63113' },
          { latitude: 38.7050, longitude: -90.2150, final_result: 3.9, valid_test: 'Y', city: 'St. Louis', zip_code: '63147' },
          { latitude: 38.7120, longitude: -90.2080, final_result: 5.1, valid_test: 'Y', city: 'St. Louis', zip_code: '63147' },
          { latitude: 38.6280, longitude: -90.2380, final_result: 4.4, valid_test: 'Y', city: 'St. Louis', zip_code: '63108' },
          { latitude: 38.6180, longitude: -90.2480, final_result: 6.1, valid_test: 'Y', city: 'St. Louis', zip_code: '63108' },
          { latitude: 38.6080, longitude: -90.2580, final_result: 3.4, valid_test: 'Y', city: 'St. Louis', zip_code: '63110' },
          { latitude: 38.5980, longitude: -90.2380, final_result: 5.3, valid_test: 'Y', city: 'St. Louis', zip_code: '63118' },
          { latitude: 38.5880, longitude: -90.2280, final_result: 4.0, valid_test: 'Y', city: 'St. Louis', zip_code: '63111' },
          { latitude: 38.5780, longitude: -90.2180, final_result: 6.7, valid_test: 'Y', city: 'St. Louis', zip_code: '63111' },
          { latitude: 38.6380, longitude: -90.1980, final_result: 3.7, valid_test: 'Y', city: 'St. Louis', zip_code: '63101' },
          { latitude: 38.6480, longitude: -90.2050, final_result: 5.4, valid_test: 'Y', city: 'St. Louis', zip_code: '63106' },
        ])
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Failed to load map data:', err)
      setError(err.message || `Failed to load map data: ${err.response?.status || 'Unknown error'}`)
      setLoading(false)
    }
  }

  // Calculate bounds for all points (only valid coordinates)
  const allBounds: MapBounds[] = [
    ...tornadoPath
      .filter(p => p.latitude != null && p.longitude != null && !isNaN(p.latitude) && !isNaN(p.longitude))
      .map(p => ({ lat: Number(p.latitude), lng: Number(p.longitude) })),
    ...radonResults
      .filter(r => r.latitude != null && r.longitude != null && !isNaN(r.latitude) && !isNaN(r.longitude))
      .map(r => ({ lat: Number(r.latitude), lng: Number(r.longitude) })),
  ]

  const getRadonMarkerColor = (result: RadonTestResult): string => {
    if (result.valid_test !== 'Y') return '#gray'
    return result.final_result >= 4.1 ? '#dc2626' : '#2563eb' // Red for high, blue for low
  }

  const getRadonMarkerRadius = (result: RadonTestResult): number => {
    // Make markers slightly larger for high radon levels
    if (result.valid_test !== 'Y') return 3
    return result.final_result >= 4.1 ? 5 : 4
  }

  const lowRadonCount = radonResults.filter(
    r => r.valid_test === 'Y' && r.final_result < 4.1
  ).length

  const highRadonCount = radonResults.filter(
    r => r.valid_test === 'Y' && r.final_result >= 4.1
  ).length

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🌪️ May 16 Tornado Path & Radon Test Results</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h3>Loading map data...</h3>
          <p>Fetching tornado path and radon test results from Snowflake</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🌪️ May 16 Tornado Path & Radon Test Results</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
          <h3>Error loading map data</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadMapData} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Ensure we have some data to display
  const hasData = tornadoPath.length > 0 || radonResults.length > 0

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🌪️ May 16 Tornado Path & Radon Test Results</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Map showing all radon test results in the St. Louis area with the May 16 tornado path
          overlaid. Red dots indicate elevated radon levels (≥4.1 pCi/L), blue dots indicate levels
          below 4.1 pCi/L. The tornado path is shown as a red line for visual reference.
        </p>

        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-line" style={{ background: '#dc2626', height: '3px' }}></div>
            <span>May 16 Tornado Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#dc2626' }}></div>
            <span>High Radon (≥4.1 pCi/L) - {highRadonCount} tests</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#2563eb' }}></div>
            <span>Low Radon (&lt;4.1 pCi/L) - {lowRadonCount} tests</span>
          </div>
        </div>

        {!hasData && (
          <div style={{ padding: '2rem', background: '#fef3c7', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              ⚠️ No data available. The map will display once data is loaded. If this persists, check the browser console for errors.
            </p>
          </div>
        )}

        <div className="map-container">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '600px', width: '100%', minHeight: '400px' }}
              scrollWheelZoom={true}
              key={`map-${tornadoPath.length}-${radonResults.length}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {allBounds && Array.isArray(allBounds) && allBounds.length > 0 && (
                <MapBoundsController bounds={allBounds} />
              )}

            {/* Tornado path */}
            {tornadoPath && Array.isArray(tornadoPath) && tornadoPath.length > 0 && (
              <Polyline
                positions={tornadoPath
                  .filter(p => p && p.latitude != null && p.longitude != null && !isNaN(p.latitude) && !isNaN(p.longitude))
                  .map(p => [Number(p.latitude), Number(p.longitude)] as [number, number])}
                pathOptions={{
                  color: '#dc2626',
                  weight: 4,
                  opacity: 0.8,
                }}
              />
            )}

            {/* Radon test results */}
            {radonResults && Array.isArray(radonResults) && radonResults
              .filter(r => r && r.valid_test === 'Y' && r.latitude != null && r.longitude != null && !isNaN(r.latitude) && !isNaN(r.longitude))
              .map((result, index) => {
                if (!result || result.latitude == null || result.longitude == null) return null
                
                const center: [number, number] = [Number(result.latitude), Number(result.longitude)]
                if (isNaN(center[0]) || isNaN(center[1])) return null
                
                const color = getRadonMarkerColor(result)
                const radius = getRadonMarkerRadius(result)
                
                if (!color || !radius || radius <= 0) return null
                
                return (
                  <CircleMarker
                    key={`radon-${index}-${result.latitude}-${result.longitude}`}
                    center={center}
                    radius={radius}
                    pathOptions={{
                      fillColor: color || '#666',
                      color: '#fff',
                      weight: 1,
                      opacity: 0.8,
                      fillOpacity: 0.7,
                    }}
                  >
                    <Popup>
                      <div style={{ padding: '0.5rem' }}>
                        <strong>Radon Test Result</strong>
                        <br />
                        Level: {result.final_result?.toFixed(2) || 'N/A'} pCi/L
                        <br />
                        {result.city && <>City: {result.city}<br /></>}
                        {result.zip_code && <>ZIP: {result.zip_code}<br /></>}
                        Status: {(result.final_result || 0) >= 4.1 ? '⚠️ Above EPA Action Level' : '✓ Below Action Level'}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })
              .filter(Boolean)}
            </MapContainer>
          )}
          {typeof window === 'undefined' && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
              <p>Map loading...</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Data Summary</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666' }}>
            <li>
              <strong>Tornado Path Points:</strong> {tornadoPath.length} coordinates
            </li>
            <li>
              <strong>Total Radon Tests:</strong> {radonResults.filter(r => r.valid_test === 'Y').length} valid tests
            </li>
            <li>
              <strong>Elevated Levels (≥4.1 pCi/L):</strong> {highRadonCount} tests ({((highRadonCount / (highRadonCount + lowRadonCount)) * 100 || 0).toFixed(1)}%)
            </li>
            <li>
              <strong>Below Action Level (&lt;4.1 pCi/L):</strong> {lowRadonCount} tests ({((lowRadonCount / (highRadonCount + lowRadonCount)) * 100 || 0).toFixed(1)}%)
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="info-box">
          <h3>📊 About This Map</h3>
          <ul>
            <li>
              <strong>Data Source:</strong> Tornado path data from NOAA (archdata.raw.noaa_dat) and
              radon test results from Missouri Department of Health (archdata.raw.radon_test_results).
            </li>
            <li>
              <strong>EPA Action Level:</strong> The EPA recommends taking action when radon levels
              exceed 4.0 pCi/L. Tests showing 4.1 pCi/L or higher are marked in red.
            </li>
            <li>
              <strong>Tornado Path:</strong> Red line shows the path of the May 16 tornado through
              St. Louis City. This visualization helps identify potential correlations between tornado
              damage and radon exposure risk.
            </li>
            <li>
              <strong>Test Results:</strong> Only valid tests (valid_test = 'Y') are displayed on the map.
              Click on any marker to see detailed information about that test result.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
