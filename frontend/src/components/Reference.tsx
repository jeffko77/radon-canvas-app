import { useState } from 'react'
import './Reference.css'

interface Neighborhood {
  neighborhood: string
  latitude: number
  longitude: number
  ward: number
  zip_code: number
}

export default function Reference() {
  const neighborhoodsData: Neighborhood[] = [
    { neighborhood: 'The Ville', latitude: 38.6580, longitude: -90.2310, ward: 19, zip_code: 63113 },
    { neighborhood: 'Walnut Park', latitude: 38.6890, longitude: -90.2450, ward: 21, zip_code: 63113 },
    { neighborhood: 'College Hill', latitude: 38.6920, longitude: -90.2580, ward: 21, zip_code: 63115 },
    { neighborhood: 'Fairground Neighborhood', latitude: 38.6340, longitude: -90.2100, ward: 19, zip_code: 63106 },
    { neighborhood: "O'Fallon", latitude: 38.6450, longitude: -90.2150, ward: 19, zip_code: 63106 },
    { neighborhood: 'Hyde Park', latitude: 38.6620, longitude: -90.2480, ward: 18, zip_code: 63112 },
    { neighborhood: 'Kingsway West', latitude: 38.6750, longitude: -90.2650, ward: 18, zip_code: 63115 },
    { neighborhood: 'Kingsway East', latitude: 38.6750, longitude: -90.2500, ward: 18, zip_code: 63112 },
    { neighborhood: 'Penrose', latitude: 38.6850, longitude: -90.2350, ward: 21, zip_code: 63113 },
    { neighborhood: 'Mark Twain', latitude: 38.6680, longitude: -90.2180, ward: 19, zip_code: 63113 },
    { neighborhood: 'Hamilton Heights', latitude: 38.6580, longitude: -90.2180, ward: 19, zip_code: 63112 },
    { neighborhood: 'Fountain Park', latitude: 38.6480, longitude: -90.2280, ward: 19, zip_code: 63106 },
    { neighborhood: 'North Pointe', latitude: 38.7080, longitude: -90.2180, ward: 2, zip_code: 63147 },
    { neighborhood: 'Baden', latitude: 38.7150, longitude: -90.2080, ward: 2, zip_code: 63147 },
    { neighborhood: 'Riverview', latitude: 38.7350, longitude: -90.2050, ward: 2, zip_code: 63147 },
    { neighborhood: 'Carr Square', latitude: 38.6380, longitude: -90.2050, ward: 5, zip_code: 63101 },
    { neighborhood: 'Jeff Vanderlou', latitude: 38.6480, longitude: -90.2380, ward: 19, zip_code: 63112 },
    { neighborhood: 'Vandeventer', latitude: 38.6380, longitude: -90.2380, ward: 19, zip_code: 63108 },
    { neighborhood: 'Academy', latitude: 38.6680, longitude: -90.2380, ward: 18, zip_code: 63112 },
    { neighborhood: 'Lewis Place', latitude: 38.6580, longitude: -90.2480, ward: 18, zip_code: 63112 },
    { neighborhood: 'Greater Ville', latitude: 38.6480, longitude: -90.2280, ward: 19, zip_code: 63112 },
    { neighborhood: 'The Grove', latitude: 38.6380, longitude: -90.2480, ward: 17, zip_code: 63108 },
    { neighborhood: 'Forest Park Southeast', latitude: 38.6280, longitude: -90.2580, ward: 17, zip_code: 63110 },
    { neighborhood: 'Central West End', latitude: 38.6480, longitude: -90.2650, ward: 17, zip_code: 63108 },
    { neighborhood: 'Midtown', latitude: 38.6380, longitude: -90.2280, ward: 17, zip_code: 63108 },
    { neighborhood: 'Grand Center', latitude: 38.6480, longitude: -90.2350, ward: 17, zip_code: 63108 },
    { neighborhood: 'Covenant Blu/Grand Center', latitude: 38.6450, longitude: -90.2320, ward: 17, zip_code: 63108 },
    { neighborhood: 'Visitation Park', latitude: 38.6680, longitude: -90.2580, ward: 18, zip_code: 63115 },
    { neighborhood: 'Wells/Goodfellow', latitude: 38.6680, longitude: -90.2680, ward: 18, zip_code: 63113 },
    { neighborhood: 'Soulard', latitude: 38.6180, longitude: -90.2080, ward: 7, zip_code: 63104 },
    { neighborhood: 'Benton Park', latitude: 38.6080, longitude: -90.2180, ward: 9, zip_code: 63104 },
    { neighborhood: 'Benton Park West', latitude: 38.6080, longitude: -90.2280, ward: 9, zip_code: 63118 },
    { neighborhood: 'Cherokee Street', latitude: 38.5980, longitude: -90.2380, ward: 9, zip_code: 63118 },
    { neighborhood: 'Gravois Park', latitude: 38.5980, longitude: -90.2380, ward: 9, zip_code: 63118 },
    { neighborhood: 'Marine Villa', latitude: 38.5780, longitude: -90.2280, ward: 11, zip_code: 63111 },
    { neighborhood: 'Dutchtown', latitude: 38.5780, longitude: -90.2480, ward: 11, zip_code: 63111 },
    { neighborhood: 'Mount Pleasant', latitude: 38.5680, longitude: -90.2380, ward: 11, zip_code: 63111 },
    { neighborhood: 'Carondelet', latitude: 38.5580, longitude: -90.2580, ward: 11, zip_code: 63111 },
    { neighborhood: 'Patch', latitude: 38.5680, longitude: -90.2580, ward: 11, zip_code: 63111 },
    { neighborhood: 'Boulevard Heights', latitude: 38.5880, longitude: -90.2780, ward: 12, zip_code: 63116 },
    { neighborhood: 'Princeton Heights', latitude: 38.5880, longitude: -90.2980, ward: 23, zip_code: 63139 },
    { neighborhood: 'St. Louis Hills', latitude: 38.5980, longitude: -90.3080, ward: 23, zip_code: 63109 },
    { neighborhood: 'Lindenwood Park', latitude: 38.5880, longitude: -90.3180, ward: 23, zip_code: 63109 },
    { neighborhood: 'Ellendale', latitude: 38.6080, longitude: -90.3080, ward: 23, zip_code: 63109 },
    { neighborhood: 'Clifton Heights', latitude: 38.6080, longitude: -90.2980, ward: 24, zip_code: 63109 },
    { neighborhood: 'The Hill', latitude: 38.6180, longitude: -90.2780, ward: 24, zip_code: 63110 },
    { neighborhood: 'Southwest Garden', latitude: 38.6180, longitude: -90.2680, ward: 15, zip_code: 63110 },
    { neighborhood: 'Tower Grove South', latitude: 38.6080, longitude: -90.2580, ward: 15, zip_code: 63110 },
    { neighborhood: 'Tower Grove East', latitude: 38.6180, longitude: -90.2480, ward: 15, zip_code: 63110 },
    { neighborhood: 'Shaw', latitude: 38.6080, longitude: -90.2480, ward: 8, zip_code: 63110 },
    { neighborhood: 'Botanical Heights', latitude: 38.6180, longitude: -90.2380, ward: 8, zip_code: 63110 },
    { neighborhood: 'McKinley Heights', latitude: 38.6180, longitude: -90.2280, ward: 7, zip_code: 63104 },
    { neighborhood: 'Fox Park', latitude: 38.6080, longitude: -90.2280, ward: 7, zip_code: 63104 },
    { neighborhood: 'LaSalle Park', latitude: 38.6180, longitude: -90.2180, ward: 7, zip_code: 63104 },
    { neighborhood: 'Lafayette Square', latitude: 38.6280, longitude: -90.2280, ward: 6, zip_code: 63104 },
    { neighborhood: 'Compton Heights', latitude: 38.6280, longitude: -90.2480, ward: 8, zip_code: 63110 },
    { neighborhood: 'Tower Grove Heights', latitude: 38.6180, longitude: -90.2580, ward: 15, zip_code: 63110 },
    { neighborhood: 'Downtown', latitude: 38.6280, longitude: -90.1980, ward: 7, zip_code: 63101 },
    { neighborhood: 'Downtown West', latitude: 38.6280, longitude: -90.2080, ward: 6, zip_code: 63103 },
    { neighborhood: "Laclede's Landing", latitude: 38.6380, longitude: -90.1880, ward: 4, zip_code: 63102 },
    { neighborhood: 'Columbus Square', latitude: 38.6480, longitude: -90.1980, ward: 5, zip_code: 63106 },
    { neighborhood: 'Old North St. Louis', latitude: 38.6580, longitude: -90.2080, ward: 5, zip_code: 63106 },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'ward' | 'zip_code'>('all')
  const [filterValue, setFilterValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<'neighborhood' | 'ward' | 'zip_code'>('neighborhood')

  const wards = [...new Set(neighborhoodsData.map(n => n.ward))].sort((a, b) => a - b)
  const zipCodes = [...new Set(neighborhoodsData.map(n => n.zip_code))].sort((a, b) => a - b)

  const filteredNeighborhoods = neighborhoodsData.filter((n) => {
    // Search filter
    const matchesSearch =
      n.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.ward.toString().includes(searchTerm) ||
      n.zip_code.toString().includes(searchTerm)

    // Category filter
    let matchesFilter = true
    if (filterBy === 'ward' && filterValue) {
      matchesFilter = n.ward.toString() === filterValue
    } else if (filterBy === 'zip_code' && filterValue) {
      matchesFilter = n.zip_code.toString() === filterValue
    }

    return matchesSearch && matchesFilter
  })

  const sortedNeighborhoods = [...filteredNeighborhoods].sort((a, b) => {
    if (sortBy === 'neighborhood') {
      return a.neighborhood.localeCompare(b.neighborhood)
    } else if (sortBy === 'ward') {
      return a.ward - b.ward || a.neighborhood.localeCompare(b.neighborhood)
    } else {
      return a.zip_code - b.zip_code || a.neighborhood.localeCompare(b.neighborhood)
    }
  })

  const openInMaps = (lat: number, lng: number, neighborhood: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Neighborhood Reference</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Reference data for St. Louis neighborhoods including location coordinates, ward numbers,
          and zip codes. Use this to organize addresses and plan your canvassing routes.
        </p>

        <div className="reference-controls">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Search Neighborhoods</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, ward, or zip code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Filter By</label>
            <select
              className="form-select"
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value as 'all' | 'ward' | 'zip_code')
                setFilterValue('')
              }}
            >
              <option value="all">All</option>
              <option value="ward">Ward</option>
              <option value="zip_code">Zip Code</option>
            </select>
          </div>

          {filterBy !== 'all' && (
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">{filterBy === 'ward' ? 'Ward' : 'Zip Code'}</label>
              <select
                className="form-select"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">All</option>
                {(filterBy === 'ward' ? wards : zipCodes).map((value) => (
                  <option key={value} value={value.toString()}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'neighborhood' | 'ward' | 'zip_code')}
            >
              <option value="neighborhood">Neighborhood</option>
              <option value="ward">Ward</option>
              <option value="zip_code">Zip Code</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
          Showing {sortedNeighborhoods.length} of {neighborhoodsData.length} neighborhoods
        </div>
      </div>

      <div className="card">
        <div className="reference-table-container">
          <table className="reference-table">
            <thead>
              <tr>
                <th>Neighborhood</th>
                <th>Ward</th>
                <th>Zip Code</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedNeighborhoods.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No neighborhoods found matching your criteria.
                  </td>
                </tr>
              ) : (
                sortedNeighborhoods.map((neighborhood, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{neighborhood.neighborhood}</strong>
                    </td>
                    <td>
                      <span className="badge badge-ward">Ward {neighborhood.ward}</span>
                    </td>
                    <td>
                      <span className="badge badge-zip">{neighborhood.zip_code}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {neighborhood.latitude.toFixed(4)}, {neighborhood.longitude.toFixed(4)}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          openInMaps(neighborhood.latitude, neighborhood.longitude, neighborhood.neighborhood)
                        }
                      >
                        🗺️ View Map
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="info-box">
          <h3>📋 How to Use This Reference</h3>
          <ul>
            <li>
              <strong>Search:</strong> Use the search box to find neighborhoods by name, ward number,
              or zip code.
            </li>
            <li>
              <strong>Filter:</strong> Filter neighborhoods by ward or zip code to focus on specific
              areas for canvassing.
            </li>
            <li>
              <strong>Sort:</strong> Sort the list by neighborhood name, ward, or zip code to organize
              your data.
            </li>
            <li>
              <strong>View Map:</strong> Click "View Map" to see the neighborhood location in Google
              Maps.
            </li>
            <li>
              <strong>Address Organization:</strong> Use this reference when adding addresses to match
              them with the correct neighborhood, ward, and zip code information.
            </li>
            <li>
              <strong>Route Planning:</strong> Group addresses by ward or zip code to create efficient
              canvassing routes.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
