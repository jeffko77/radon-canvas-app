import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Neighborhood {
  id: string
  name: string
  description?: string
  risk_level: 'low' | 'medium' | 'high'
  messaging_template: string
  created_at: string
}

export interface Address {
  id: string
  address: string
  neighborhood_id?: string
  status: 'not_visited' | 'visited' | 'interested' | 'scheduled' | 'completed'
  notes?: string
  visited_at?: string
  created_at: string
}

export interface NeighborhoodCreate {
  name: string
  description?: string
  risk_level: 'low' | 'medium' | 'high'
  messaging_template: string
}

export interface AddressCreate {
  address: string
  neighborhood_id?: string
}

export const neighborhoodsApi = {
  getAll: () => api.get<Neighborhood[]>('/neighborhoods').then(res => res.data),
  create: (data: NeighborhoodCreate) => 
    api.post<Neighborhood>('/neighborhoods', data).then(res => res.data),
  update: (id: string, data: NeighborhoodCreate) =>
    api.put<Neighborhood>(`/neighborhoods/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/neighborhoods/${id}`).then(res => res.data),
}

export const addressesApi = {
  getAll: (neighborhoodId?: string) => {
    const params = neighborhoodId ? { neighborhood_id: neighborhoodId } : {}
    return api.get<Address[]>('/addresses', { params }).then(res => res.data)
  },
  create: (data: AddressCreate) =>
    api.post<Address>('/addresses', data).then(res => res.data),
  update: (id: string, data: Partial<Address>) =>
    api.put<Address>(`/addresses/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/addresses/${id}`).then(res => res.data),
}

export interface RadonTestResult {
  neighborhood: string
  zip_code: number
  ward: number
  test_count: number
  average_radon_level: number
  high_risk_count: number
  percent_above_action_level: number
}

export const radonApi = {
  getHotNeighborhoods: (params?: { minTests?: number; sortBy?: string }) =>
    api.get<RadonTestResult[]>('/radon/hot-neighborhoods', { params }).then(res => res.data),
}

export interface TornadoPoint {
  latitude: number
  longitude: number
}

export interface RadonTestResultMap {
  latitude: number
  longitude: number
  final_result: number
  valid_test: string
  city?: string
  zip_code?: string
}

export const tornadoMapApi = {
  getTornadoPath: () =>
    api.get<TornadoPoint[]>('/map/tornado-path').then(res => res.data),
  getRadonTestResults: (nearTornado: boolean = true, radiusMiles: number = 2.0) =>
    api.get<RadonTestResultMap[]>('/map/radon-results', {
      params: { near_tornado: nearTornado, radius_miles: radiusMiles }
    }).then(res => res.data),
}
