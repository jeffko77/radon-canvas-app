import { useState, useEffect } from 'react'
import { addressesApi, neighborhoodsApi, Address, Neighborhood, AddressCreate } from '../services/api'
import './Addresses.css'

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressCreate>({
    address: '',
    neighborhood_id: '',
  })

  useEffect(() => {
    loadNeighborhoods()
    loadAddresses()
  }, [])

  useEffect(() => {
    loadAddresses()
  }, [selectedNeighborhood])

  const loadNeighborhoods = async () => {
    try {
      const data = await neighborhoodsApi.getAll()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Failed to load neighborhoods:', error)
    }
  }

  const loadAddresses = async () => {
    try {
      const neighborhoodId = selectedNeighborhood === 'all' ? undefined : selectedNeighborhood
      const data = await addressesApi.getAll(neighborhoodId)
      setAddresses(data)
    } catch (error) {
      console.error('Failed to load addresses:', error)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data: AddressCreate = {
        address: formData.address,
        neighborhood_id: formData.neighborhood_id || undefined,
      }
      await addressesApi.create(data)
      setShowAddModal(false)
      setFormData({ address: '', neighborhood_id: '' })
      loadAddresses()
    } catch (error) {
      console.error('Failed to add address:', error)
      alert('Failed to add address. Please try again.')
    }
  }

  const handleCheckIn = (address: Address) => {
    setSelectedAddress(address)
  }

  const handleUpdateStatus = async (status: Address['status'], notes?: string) => {
    if (!selectedAddress) return
    try {
      await addressesApi.update(selectedAddress.id, {
        status,
        notes: notes || selectedAddress.notes,
      })
      setSelectedAddress(null)
      loadAddresses()
    } catch (error) {
      console.error('Failed to update address:', error)
      alert('Failed to update address. Please try again.')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      await addressesApi.delete(id)
      loadAddresses()
    } catch (error) {
      console.error('Failed to delete address:', error)
      alert('Failed to delete address. Please try again.')
    }
  }

  const getNeighborhoodName = (neighborhoodId?: string) => {
    if (!neighborhoodId) return 'Unassigned'
    const neighborhood = neighborhoods.find((n) => n.id === neighborhoodId)
    return neighborhood?.name || 'Unknown'
  }

  const getNeighborhoodTemplate = (neighborhoodId?: string) => {
    if (!neighborhoodId) return null
    const neighborhood = neighborhoods.find((n) => n.id === neighborhoodId)
    return neighborhood?.messaging_template || null
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_visited: '#6b7280',
      visited: '#3b82f6',
      interested: '#f59e0b',
      scheduled: '#8b5cf6',
      completed: '#10b981',
    }
    return colors[status] || '#6b7280'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      not_visited: 'Not Visited',
      visited: 'Visited',
      interested: 'Interested',
      scheduled: 'Scheduled',
      completed: 'Completed',
    }
    return labels[status] || status
  }

  const filteredAddresses = addresses.filter((addr) => {
    if (selectedNeighborhood === 'all') return true
    if (selectedNeighborhood === 'unassigned') return !addr.neighborhood_id
    return addr.neighborhood_id === selectedNeighborhood
  })

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🏠 Household Information</h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Household
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Filter by Neighborhood</label>
          <select
            className="form-select"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            <option value="all">All Addresses</option>
            <option value="unassigned">Unassigned</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        {filteredAddresses.length === 0 ? (
          <div className="empty-state">
            <h3>No addresses found</h3>
            <p>
              {selectedNeighborhood === 'all'
                ? 'Add your first address to get started.'
                : 'No addresses match this filter.'}
            </p>
          </div>
        ) : (
          <div className="addresses-list">
            {filteredAddresses.map((address) => (
              <div key={address.id} className="list-item">
                <div className="list-item-header">
                  <div style={{ flex: 1 }}>
                    <h3 className="list-item-title">{address.address}</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span
                        className="badge"
                        style={{
                          background: `${getStatusColor(address.status)}20`,
                          color: getStatusColor(address.status),
                        }}
                      >
                        {getStatusLabel(address.status)}
                      </span>
                      {address.neighborhood_id && (
                        <span style={{ color: '#666', fontSize: '0.875rem' }}>
                          📍 {getNeighborhoodName(address.neighborhood_id)}
                        </span>
                      )}
                      {address.visited_at && (
                        <span style={{ color: '#666', fontSize: '0.875rem' }}>
                          Visited: {new Date(address.visited_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {address.notes && (
                      <p style={{ marginTop: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                        {address.notes}
                      </p>
                    )}
                  </div>
                  <div className="list-item-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleCheckIn(address)}
                    >
                      Check In
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Address</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="e.g., 123 Main St, City, State 12345"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Neighborhood (Optional)</label>
                <select
                  className="form-select"
                  value={formData.neighborhood_id}
                  onChange={(e) => setFormData({ ...formData, neighborhood_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Assigning a neighborhood will provide optimized messaging for this address.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAddress && (
        <CheckInModal
          address={selectedAddress}
          neighborhood={neighborhoods.find((n) => n.id === selectedAddress.neighborhood_id)}
          onClose={() => setSelectedAddress(null)}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  )
}

interface CheckInModalProps {
  address: Address
  neighborhood?: Neighborhood
  onClose: () => void
  onUpdate: (status: Address['status'], notes?: string) => void
}

function CheckInModal({ address, neighborhood, onClose, onUpdate }: CheckInModalProps) {
  const [notes, setNotes] = useState(address.notes || '')
  const [status, setStatus] = useState<Address['status']>(address.status)

  const handleSubmit = (newStatus: Address['status']) => {
    onUpdate(newStatus, notes)
  }

  const template = neighborhood?.messaging_template || 
    `Hello! I'm reaching out about radon testing for your home. Radon is a naturally occurring radioactive gas that can cause lung cancer.

We offer free or low-cost radon testing. Would you be interested in scheduling a test?`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal check-in-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Check In: {address.address}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {neighborhood && (
          <div className="message-preview" style={{ marginBottom: '1.5rem' }}>
            <div className="message-preview-title">
              📍 {neighborhood.name} - Optimized Message Template:
            </div>
            {template}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as Address['status'])}
          >
            <option value="not_visited">Not Visited</option>
            <option value="visited">Visited</option>
            <option value="interested">Interested</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this visit..."
            rows={5}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit(status)}
          >
            Save Check-In
          </button>
        </div>
      </div>
    </div>
  )
}
