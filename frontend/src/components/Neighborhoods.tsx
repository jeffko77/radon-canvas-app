import { useState, useEffect } from 'react'
import { neighborhoodsApi, Neighborhood, NeighborhoodCreate } from '../services/api'
import './Neighborhoods.css'

export default function Neighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [formData, setFormData] = useState<NeighborhoodCreate>({
    name: '',
    description: '',
    risk_level: 'medium',
    messaging_template: '',
  })

  useEffect(() => {
    loadNeighborhoods()
  }, [])

  const loadNeighborhoods = async () => {
    try {
      const data = await neighborhoodsApi.getAll()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Failed to load neighborhoods:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingNeighborhood) {
        await neighborhoodsApi.update(editingNeighborhood.id, formData)
      } else {
        await neighborhoodsApi.create(formData)
      }
      setShowModal(false)
      setEditingNeighborhood(null)
      setFormData({
        name: '',
        description: '',
        risk_level: 'medium',
        messaging_template: '',
      })
      loadNeighborhoods()
    } catch (error) {
      console.error('Failed to save neighborhood:', error)
      alert('Failed to save neighborhood. Please try again.')
    }
  }

  const handleEdit = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood)
    setFormData({
      name: neighborhood.name,
      description: neighborhood.description || '',
      risk_level: neighborhood.risk_level,
      messaging_template: neighborhood.messaging_template,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this neighborhood?')) return
    try {
      await neighborhoodsApi.delete(id)
      loadNeighborhoods()
    } catch (error) {
      console.error('Failed to delete neighborhood:', error)
      alert('Failed to delete neighborhood. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingNeighborhood(null)
    setFormData({
      name: '',
      description: '',
      risk_level: 'medium',
      messaging_template: '',
    })
  }

  const getRiskBadgeClass = (risk: string) => {
    if (risk === 'high') return 'badge-high'
    if (risk === 'medium') return 'badge-medium'
    return 'badge-low'
  }

  const defaultTemplate = `Hello! I'm reaching out because your neighborhood has been identified as having elevated radon levels. Radon is a naturally occurring radioactive gas that can cause lung cancer. 

We offer free or low-cost radon testing. Would you be interested in scheduling a test for your home?`

  const filteredNeighborhoods = neighborhoods.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (n.description && n.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRisk = filterRisk === 'all' || n.risk_level === filterRisk
    return matchesSearch && matchesRisk
  })

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🏘️ Neighborhoods</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Neighborhood
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          St. Louis City neighborhoods tracked for radon awareness outreach.
          Identify at-risk areas and prioritize canvassing efforts based on radon exposure levels.
        </p>

        {neighborhoods.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
                <label className="form-label">Search Neighborhoods</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                <label className="form-label">Filter by Risk Level</label>
                <select
                  className="form-select"
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.95rem' }}>
              Showing {filteredNeighborhoods.length} of {neighborhoods.length} neighborhoods
            </div>
          </>
        )}

        {neighborhoods.length === 0 ? (
          <div className="empty-state">
            <h3>No neighborhoods defined yet</h3>
            <p>Add your first neighborhood to get started with canvassing.</p>
          </div>
        ) : filteredNeighborhoods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No neighborhoods found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="neighborhoods-list">
            {filteredNeighborhoods.map((neighborhood) => (
              <div key={neighborhood.id} className="list-item">
                <div className="list-item-header">
                  <div>
                    <h3 className="list-item-title">{neighborhood.name}</h3>
                    <span className={`badge ${getRiskBadgeClass(neighborhood.risk_level)}`}>
                      {neighborhood.risk_level.toUpperCase()} RISK
                    </span>
                    {neighborhood.description && (
                      <p style={{ marginTop: '0.5rem', color: '#666' }}>
                        {neighborhood.description}
                      </p>
                    )}
                  </div>
                  <div className="list-item-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(neighborhood)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(neighborhood.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="message-preview">
                  <div className="message-preview-title">Messaging Template:</div>
                  {neighborhood.messaging_template || defaultTemplate}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingNeighborhood ? 'Edit Neighborhood' : 'Add Neighborhood'}
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Neighborhood Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Maple Heights, Downtown District"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the neighborhood..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Risk Level *</label>
                <select
                  className="form-select"
                  value={formData.risk_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      risk_level: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                  required
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Messaging Template *</label>
                <textarea
                  className="form-textarea"
                  value={formData.messaging_template || defaultTemplate}
                  onChange={(e) =>
                    setFormData({ ...formData, messaging_template: e.target.value })
                  }
                  required
                  placeholder="Custom message template for this neighborhood..."
                  rows={8}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  This message will be used when canvassing addresses in this neighborhood. You can
                  personalize it with neighborhood-specific information.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNeighborhood ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
