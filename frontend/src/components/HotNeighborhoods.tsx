import { useState, useEffect } from 'react'
import { neighborhoodsApi, radonApi, RadonTestResult, Neighborhood } from '../services/api'
import './HotNeighborhoods.css'

export default function HotNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [radonData, setRadonData] = useState<RadonTestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'average' | 'count' | 'percent'>('average')
  const [minTests, setMinTests] = useState<number>(5)

  // This is sample data structure - in production, this would come from your Snowflake query
  // Query would be something like:
  // SELECT 
  //   n.neighborhood,
  //   n.zip_code,
  //   n.ward,
  //   COUNT(*) as test_count,
  //   AVG(r.final_result) as average_radon_level,
  //   SUM(CASE WHEN r.final_result >= 4.0 THEN 1 ELSE 0 END) as high_risk_count,
  //   (SUM(CASE WHEN r.final_result >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as percent_above_action_level
  // FROM RADON_TEST_RESULTS r
  // JOIN neighborhood_reference n ON r.zip_code = n.zip_code
  // WHERE r.valid_test = 'Y' AND r.city = 'St. Louis'
  // GROUP BY n.neighborhood, n.zip_code, n.ward
  // HAVING COUNT(*) >= ?
  // ORDER BY average_radon_level DESC

  useEffect(() => {
    loadNeighborhoods()
    loadRadonData()
  }, [])

  const loadNeighborhoods = async () => {
    try {
      const data = await neighborhoodsApi.getAll()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Failed to load neighborhoods:', error)
    }
  }

  const loadRadonData = async () => {
    try {
      setLoading(true)
      const data = await radonApi.getHotNeighborhoods({ minTests, sortBy })
      setRadonData(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load radon data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRadonData()
  }, [minTests, sortBy])

  const getRiskLevel = (average: number) => {
    if (average >= 8.0) return { level: 'Very High', color: '#991b1b', bg: '#fee2e2' }
    if (average >= 6.0) return { level: 'High', color: '#b45309', bg: '#fef3c7' }
    if (average >= 4.0) return { level: 'Moderate', color: '#92400e', bg: '#fed7aa' }
    return { level: 'Low', color: '#065f46', bg: '#d1fae5' }
  }

  const getRiskBadgeClass = (average: number) => {
    if (average >= 8.0) return 'badge-very-high'
    if (average >= 6.0) return 'badge-high'
    if (average >= 4.0) return 'badge-medium'
    return 'badge-low'
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎯 Target Neighborhoods</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Priority neighborhoods with elevated radon levels based on residential test results.
          Focus outreach efforts on areas with the highest concentrations and greatest number of tests above the EPA action level of 4.0 pCi/L.
        </p>

        <div className="hot-neighborhoods-controls">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Minimum Tests</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={minTests}
              onChange={(e) => setMinTests(parseInt(e.target.value) || 1)}
              placeholder="5"
            />
            <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
              Only show neighborhoods with at least this many test results
            </small>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'average' | 'count' | 'percent')}
            >
              <option value="average">Average Radon Level</option>
              <option value="count">Number of Tests</option>
              <option value="percent">% Above Action Level</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            Loading radon data...
          </div>
        ) : radonData.length === 0 ? (
          <div className="empty-state">
            <h3>No neighborhoods found</h3>
            <p>Try adjusting the minimum number of tests to see more results.</p>
          </div>
        ) : (
          <div className="hot-neighborhoods-list">
            {radonData.map((neighborhood, index) => {
              const risk = getRiskLevel(neighborhood.average_radon_level)
              const appNeighborhood = neighborhoods.find((n) =>
                n.name.toLowerCase().includes(neighborhood.neighborhood.toLowerCase()) ||
                neighborhood.neighborhood.toLowerCase().includes(n.name.toLowerCase())
              )

              return (
                <div key={index} className="hot-neighborhood-card">
                  <div className="hot-neighborhood-header">
                    <div>
                      <h3 className="hot-neighborhood-title">
                        #{index + 1} {neighborhood.neighborhood}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span className={`badge ${getRiskBadgeClass(neighborhood.average_radon_level)}`}>
                          {risk.level} Risk
                        </span>
                        <span className="badge badge-ward">Ward {neighborhood.ward}</span>
                        <span className="badge badge-zip">{neighborhood.zip_code}</span>
                      </div>
                    </div>
                    <div className="hot-neighborhood-stats">
                      <div className="stat-box">
                        <div className="stat-value">{neighborhood.average_radon_level.toFixed(1)}</div>
                        <div className="stat-label">pCi/L Average</div>
                      </div>
                    </div>
                  </div>

                  <div className="hot-neighborhood-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Test Results:</strong> {neighborhood.test_count} homes tested
                      </div>
                      <div className="detail-item">
                        <strong>Above Action Level (4.0 pCi/L):</strong> {neighborhood.high_risk_count} homes (
                        {neighborhood.percent_above_action_level.toFixed(1)}%)
                      </div>
                      <div className="detail-item">
                        <strong>EPA Action Level:</strong> 4.0 pCi/L
                      </div>
                    </div>

                    {appNeighborhood && (
                      <div className="app-neighborhood-link">
                        <strong>📍 This neighborhood is defined in the app:</strong>
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px' }}>
                          <strong>{appNeighborhood.name}</strong> - {appNeighborhood.risk_level} risk level
                          {appNeighborhood.description && (
                            <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                              {appNeighborhood.description}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!appNeighborhood && (
                      <div className="app-neighborhood-link" style={{ color: '#b45309' }}>
                        ⚠️ This neighborhood is not yet defined in the app. Consider adding it to your
                        neighborhoods list.
                      </div>
                    )}

                    <div className="risk-indicator" style={{ background: risk.bg, borderColor: risk.color }}>
                      <div className="risk-indicator-header" style={{ color: risk.color }}>
                        <strong>Risk Assessment:</strong> {risk.level} Risk
                      </div>
                      <div className="risk-indicator-content" style={{ color: '#333' }}>
                        With an average radon level of {neighborhood.average_radon_level.toFixed(1)} pCi/L, this
                        neighborhood exceeds the EPA action level of 4.0 pCi/L. {neighborhood.percent_above_action_level.toFixed(1)}% of
                        tested homes in this area show elevated radon levels, indicating a higher risk for residents.
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="info-box">
          <h3>📊 Understanding the Data</h3>
          <ul>
            <li>
              <strong>Data Source:</strong> Residential radon test results from Missouri Department of Health
              & Senior Services (MO DHSS) Environmental Public Health Tracking Network.
            </li>
            <li>
              <strong>EPA Action Level:</strong> The EPA recommends taking action when radon levels exceed
              4.0 pCi/L. This is considered the action level for remediation.
            </li>
            <li>
              <strong>Minimum Tests:</strong> Filtering by minimum number of tests ensures that neighborhoods
              with sufficient data are prioritized. Small sample sizes may not be representative.
            </li>
            <li>
              <strong>Average Radon Level:</strong> The average of all valid test results for homes in each
              neighborhood, providing an overall risk assessment for the area.
            </li>
            <li>
              <strong>Risk Levels:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Very High: 8.0+ pCi/L</li>
                <li>High: 6.0-7.9 pCi/L</li>
                <li>Moderate: 4.0-5.9 pCi/L</li>
                <li>Low: &lt;4.0 pCi/L</li>
              </ul>
            </li>
            <li>
              <strong>Integration:</strong> This page uses data from the MO DHSS radon database. To connect
              to your Snowflake data warehouse, add an API endpoint in the backend that queries your
              RADON_TEST_RESULTS table.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
