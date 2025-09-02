import { apiServiceFixed } from '@/lib/api-fixed'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Types for Conservation API
export interface ConservationFormData {
  location: {
    latitude?: number
    longitude?: number
    locationName: string
    waterBody: string
    depth: number
    waterTemperature: number
    salinity: number
    ph: number
    dissolvedOxygen: number
    weather: string
    notes: string
  }
  species: {
    scientificName: string
    commonName: string
    family: string
    photos: File[]
    characteristics: string
    estimatedAge: string
    size: {
      length: number
      weight: number
    }
    condition: string
  }
  sampling: {
    method: string
    equipment: string[]
    collectionDate: string
    collectionTime: string
    sampleSize: number
    preservationMethod: string
    chainOfCustody: string
  }
  labTests: {
    testTypes: string[]
    testResults: File[]
    certificates: File[]
    testDate: string
    laboratoryName: string
    technicianName: string
    notes: string
  }
  results: {
    summary: string
    recommendations: string
    tags: string[]
    publiclyVisible: boolean
    researchPurpose: string
  }
}



export interface ConservationRecord {
  id: string
  samplingId: string
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  verifiedAt?: string
  location: {
    name: string
    waterBody: string
    coordinates?: string
    depth?: number
    environmentalData?: any
  }
  species: {
    scientificName: string
    commonName: string
    family: string
    photos: string[] // IPFS hashes
    characteristics?: string
    size?: {
      length: number
      weight: number
    }
    condition?: string
  }
  sampling: {
    method: string
    collectionDate: string
    sampleSize: number
    equipment: string[]
    preservationMethod?: string
  }
  labTests: {
    testTypes: string[]
    testResults: string[] // IPFS hashes
    certificates: string[] // IPFS hashes
    testDate?: string
    laboratoryName?: string
  }
  results: {
    summary: string
    recommendations?: string
    tags: string[]
    publiclyVisible: boolean
  }
  creator: {
    id: string
    name: string
    email: string
    organization?: string
  }
  verifier?: {
    id: string
    name: string
    email: string
  }
  blockchainTxHash?: string
  ipfsDataHash?: string
}

export interface ConservationStatistics {
  totalRecords: number
  recordsByStatus: {
    draft: number
    submitted: number
    verified: number
    rejected: number
  }
  recordsByMonth: Array<{
    month: string
    count: number
  }>
  topSpecies: Array<{
    scientificName: string
    commonName: string
    count: number
  }>
  topLocations: Array<{
    locationName: string
    count: number
  }>
  testTypesUsage: Array<{
    testType: string
    count: number
  }>
}

export interface CreateConservationRequest {
  // Location data
  locationName: string
  waterBody: string
  latitude?: number
  longitude?: number
  depth: number
  waterTemperature?: number
  salinity?: number
  ph?: number
  dissolvedOxygen?: number
  weather: string
  locationNotes?: string

  // Species data
  scientificName: string
  commonName: string
  family: string
  characteristics?: string
  estimatedAge?: string
  length?: number
  weight?: number
  condition?: string

  // Sampling data
  method: string
  collectionDate: string
  collectionTime: string
  sampleSize: number
  equipment: string[]
  preservationMethod: string
  chainOfCustody?: string

  // Lab tests data
  testTypes: string[]
  testDate?: string
  laboratoryName?: string
  technicianName?: string
  labNotes?: string

  // Results data
  summary: string
  recommendations?: string
  tags: string[]
  publiclyVisible: boolean
  researchPurpose?: string
}

export interface UpdateConservationRequest extends Partial<CreateConservationRequest> {
  id: string
}

export interface ConservationQueryParams {
  page?: number
  limit?: number
  status?: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  search?: string
  scientificName?: string
  locationName?: string
  createdBy?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'samplingId'
  sortOrder?: 'asc' | 'desc'
}

class ConservationApiService {
  private getHeaders(includeAuth = true, token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const authToken = token || localStorage.getItem('authToken')
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    const result = await response.json()
    
    // Handle the API response wrapper structure from backend
    if (result.success !== undefined) {
      if (!result.success) {
        throw new Error(result.error || result.message || 'API request failed')
      }
      return result.data as T
    }

    return result as T
  }

  // Create new conservation record
  async createRecord(data: CreateConservationRequest): Promise<ConservationRecord> {
    const response = await fetch(`${API_BASE_URL}/conservation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Upload files (photos, test results, certificates)
  async uploadFiles(files: File[], type: 'photos' | 'testResults' | 'certificates'): Promise<string[]> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })
    formData.append('type', type)

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData,
    })

    const result = await this.handleResponse<{ fileHashes: string[] }>(response)
    return result.fileHashes
  }

  // Submit conservation record with file uploads
  async submitRecordWithFiles(formData: ConservationFormData): Promise<ConservationRecord> {
    try {
      // First, upload all files
      const photoHashes = formData.species.photos.length > 0 
        ? await this.uploadFiles(formData.species.photos, 'photos')
        : []

      const testResultHashes = formData.labTests.testResults.length > 0
        ? await this.uploadFiles(formData.labTests.testResults, 'testResults')
        : []

      const certificateHashes = formData.labTests.certificates.length > 0
        ? await this.uploadFiles(formData.labTests.certificates, 'certificates')
        : []

      // Prepare the record data without files
      const recordData: CreateConservationRequest = {
        // Location
        locationName: formData.location.locationName,
        waterBody: formData.location.waterBody,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        depth: formData.location.depth,
        waterTemperature: formData.location.waterTemperature,
        salinity: formData.location.salinity,
        ph: formData.location.ph,
        dissolvedOxygen: formData.location.dissolvedOxygen,
        weather: formData.location.weather,
        locationNotes: formData.location.notes,

        // Species
        scientificName: formData.species.scientificName,
        commonName: formData.species.commonName,
        family: formData.species.family,
        characteristics: formData.species.characteristics,
        estimatedAge: formData.species.estimatedAge,
        length: formData.species.size.length,
        weight: formData.species.size.weight,
        condition: formData.species.condition,

        // Sampling
        method: formData.sampling.method,
        collectionDate: formData.sampling.collectionDate,
        collectionTime: formData.sampling.collectionTime,
        sampleSize: formData.sampling.sampleSize,
        equipment: formData.sampling.equipment,
        preservationMethod: formData.sampling.preservationMethod,
        chainOfCustody: formData.sampling.chainOfCustody,

        // Lab tests
        testTypes: formData.labTests.testTypes,
        testDate: formData.labTests.testDate,
        laboratoryName: formData.labTests.laboratoryName,
        technicianName: formData.labTests.technicianName,
        labNotes: formData.labTests.notes,

        // Results
        summary: formData.results.summary,
        recommendations: formData.results.recommendations,
        tags: formData.results.tags,
        publiclyVisible: formData.results.publiclyVisible,
        researchPurpose: formData.results.researchPurpose
      }

      // Create the record with file hashes
      const record = await this.createRecord(recordData)

      // Update the record with file hashes if needed
      if (photoHashes.length > 0 || testResultHashes.length > 0 || certificateHashes.length > 0) {
        await this.updateRecordFiles(record.id, {
          photoHashes,
          testResultHashes,
          certificateHashes
        })
      }

      return record
    } catch (error) {
      console.error('Error submitting conservation record:', error)
      throw error
    }
  }

  // Update record files
  async updateRecordFiles(recordId: string, files: {
    photoHashes?: string[]
    testResultHashes?: string[]
    certificateHashes?: string[]
  }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conservation/${recordId}/files`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(files),
    })

    await this.handleResponse(response)
  }

  // Get all conservation records with filtering
  async getRecords(params: ConservationQueryParams = {}): Promise<{
    records: ConservationRecord[]
    total: number
    page: number
    limit: number
  }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    const response = await fetch(`${API_BASE_URL}/conservation?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Get single conservation record
  async getRecord(id: string): Promise<ConservationRecord> {
    const response = await fetch(`${API_BASE_URL}/conservation/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Update conservation record
  async updateRecord(data: UpdateConservationRequest): Promise<ConservationRecord> {
    const { id, ...updateData } = data
    
    const response = await fetch(`${API_BASE_URL}/conservation/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData),
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Delete conservation record
  async deleteRecord(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conservation/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    await this.handleResponse(response)
  }

  // Submit record for verification (change status to SUBMITTED)
  async submitRecord(id: string): Promise<ConservationRecord> {
    const response = await fetch(`${API_BASE_URL}/conservation/${id}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Verify record (Admin only)
  async verifyRecord(id: string): Promise<ConservationRecord> {
    const response = await fetch(`${API_BASE_URL}/conservation/${id}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Reject record (Admin only)
  async rejectRecord(id: string, reason: string): Promise<ConservationRecord> {
    const response = await fetch(`${API_BASE_URL}/conservation/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Get conservation statistics
  async getStatistics(userId?: string): Promise<ConservationStatistics> {
    const params = userId ? `?userId=${userId}` : ''
    
    const response = await fetch(`${API_BASE_URL}/conservation/statistics${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<ConservationStatistics>(response)
  }

  // Save draft record
  async saveDraft(formData: Partial<ConservationFormData>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/conservation/draft`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(formData),
    })

    return this.handleResponse<{ id: string }>(response)
  }

  // Load draft record
  async loadDraft(id: string): Promise<ConservationFormData> {
    const response = await fetch(`${API_BASE_URL}/conservation/draft/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<ConservationFormData>(response)
  }

  // Get public record (no auth required)
  async getPublicRecord(samplingId: string): Promise<ConservationRecord> {
    const response = await fetch(`${API_BASE_URL}/conservation/public/${samplingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<ConservationRecord>(response)
  }

  // Export records
  async exportRecords(params: ConservationQueryParams = {}, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    searchParams.append('format', format)

    const response = await fetch(`${API_BASE_URL}/conservation/export?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }

  // Get file from IPFS hash
  getFileUrl(ipfsHash: string): string {
    return `${API_BASE_URL}/files/${ipfsHash}`
  }
}

// Export singleton instance
export const conservationApi = new ConservationApiService()
export default conservationApi