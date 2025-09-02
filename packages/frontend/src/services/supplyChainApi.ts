// File: packages/frontend/src/services/supplyChainApi.ts
import { apiServiceFixed } from '@/lib/api-fixed'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Types for Supply Chain API
export type SourceType = 'FARMED' | 'WILD_CAPTURE'
export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type RecordStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'

export interface SupplyChainFormData {
  productId: string
  batchId: string
  sourceType: SourceType
  species: {
    scientificName: string
    commonName: string
  }
  estimatedQuantity: number
  unit: string
  stages: Record<string, {
    completed: boolean
    startDate?: string
    completedDate?: string
    location?: string
    responsible?: string
    data: Record<string, any>
    photos: File[]
    documents: File[]
    notes?: string
  }>
  tags: string[]
  publiclyVisible: boolean
  qrCodeGenerated: boolean
}

export interface SupplyChainRecord {
  id: string
  productId: string
  batchId: string
  sourceType: SourceType
  currentStage: string
  status: RecordStatus
  product: {
    species: {
      scientificName: string
      commonName: string
    }
    quantity: number
    unit: string
  }
  origin: {
    location: string
    coordinates?: string
    facility?: string
    originType: SourceType
  }
  stages: Array<{
    id: string
    name: string
    status: StageStatus
    startedAt?: string
    completedAt?: string
    location?: string
    responsible?: string
    data?: Record<string, any>
    photos?: string[] // IPFS hashes
    documents?: string[] // IPFS hashes
    notes?: string
  }>
  createdAt: string
  updatedAt: string
  completedAt?: string
  creator: {
    id: string
    name: string
    email: string
    organization?: string
    role?: string
  }
  currentHandler?: {
    id: string
    name: string
    email: string
    organization?: string
  }
  qrCodeGenerated: boolean
  qrCodeHash?: string
  blockchainTxHash?: string
  ipfsDataHash?: string
  tags: string[]
  publiclyVisible: boolean
}

export interface SupplyChainStatistics {
  totalRecords: number
  recordsByStatus: {
    draft: number
    active: number
    completed: number
    rejected: number
  }
  recordsBySourceType: {
    farmed: number
    wildCapture: number
  }
  recordsByStage: Array<{
    stage: string
    count: number
  }>
  recordsByMonth: Array<{
    month: string
    count: number
  }>
  topSpecies: Array<{
    scientificName: string
    commonName: string
    count: number
  }>
  topOrigins: Array<{
    location: string
    count: number
  }>
  averageJourneyTime: {
    farmed: number // in days
    wildCapture: number // in days
  }
  qrCodeStats: {
    generated: number
    pending: number
  }
  blockchainStats: {
    recorded: number
    pending: number
  }
}

export interface CreateSupplyChainRequest {
  // Basic product information
  productId: string
  batchId?: string
  sourceType: SourceType
  scientificName: string
  commonName: string
  estimatedQuantity: number
  unit: string
  
  // Origin information
  originLocation: string
  originCoordinates?: string
  originFacility?: string
  
  // Initial stage information
  initialStage: string
  stageLocation: string
  responsible: string
  startDate: string
  
  // Additional information
  tags: string[]
  publiclyVisible: boolean
  notes?: string
}

export interface UpdateSupplyChainRequest extends Partial<CreateSupplyChainRequest> {
  id: string
}

export interface UpdateStageRequest {
  recordId: string
  stageId: string
  status?: StageStatus
  startedAt?: string
  completedAt?: string
  location?: string
  responsible?: string
  data?: Record<string, any>
  notes?: string
}

export interface SupplyChainQueryParams {
  page?: number
  limit?: number
  status?: RecordStatus
  sourceType?: SourceType
  currentStage?: string
  search?: string
  scientificName?: string
  originLocation?: string
  createdBy?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'productId' | 'currentStage'
  sortOrder?: 'asc' | 'desc'
}

export interface BatchInfo {
  batchId: string
  products: SupplyChainRecord[]
  totalQuantity: number
  unit: string
  averageProgress: number
  stages: string[]
  createdAt: string
  status: RecordStatus
}

class SupplyChainApiService {
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

  // Create new supply chain record
  async createRecord(data: CreateSupplyChainRequest): Promise<SupplyChainRecord> {
    const response = await fetch(`${API_BASE_URL}/supply-chain`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<SupplyChainRecord>(response)
  }

  // Submit supply chain record with file uploads
  async submitRecordWithFiles(formData: SupplyChainFormData): Promise<SupplyChainRecord> {
    try {
      // Upload files for each stage
      const stageFileHashes: Record<string, { photos: string[], documents: string[] }> = {}
      
      for (const [stageId, stageData] of Object.entries(formData.stages)) {
        const photoHashes = stageData.photos.length > 0 
          ? await this.uploadFiles(stageData.photos, 'photos')
          : []

        const documentHashes = stageData.documents.length > 0
          ? await this.uploadFiles(stageData.documents, 'documents')
          : []

        if (photoHashes.length > 0 || documentHashes.length > 0) {
          stageFileHashes[stageId] = { photos: photoHashes, documents: documentHashes }
        }
      }

      // Prepare the record data
      const recordData: CreateSupplyChainRequest = {
        productId: formData.productId,
        batchId: formData.batchId,
        sourceType: formData.sourceType,
        scientificName: formData.species.scientificName,
        commonName: formData.species.commonName,
        estimatedQuantity: formData.estimatedQuantity,
        unit: formData.unit,
        
        // Get origin from first stage
        originLocation: Object.values(formData.stages)[0]?.location || '',
        responsible: Object.values(formData.stages)[0]?.responsible || '',
        startDate: Object.values(formData.stages)[0]?.startDate || '',
        initialStage: formData.sourceType === 'FARMED' ? 'hatchery' : 'fishing',
        stageLocation: Object.values(formData.stages)[0]?.location || '',
        
        tags: formData.tags,
        publiclyVisible: formData.publiclyVisible
      }

      // Create the record
      const record = await this.createRecord(recordData)

      // Update stages with file hashes and detailed data
      for (const [stageId, stageData] of Object.entries(formData.stages)) {
        if (stageData.startDate || stageData.completedDate || stageFileHashes[stageId] || stageData.notes) {
          await this.updateStage({
            recordId: record.id,
            stageId,
            startedAt: stageData.startDate,
            completedAt: stageData.completedDate,
            location: stageData.location,
            responsible: stageData.responsible,
            data: {
              ...stageData.data,
              ...(stageFileHashes[stageId] && {
                photoHashes: stageFileHashes[stageId].photos,
                documentHashes: stageFileHashes[stageId].documents
              })
            },
            notes: stageData.notes
          })
        }
      }

      return record
    } catch (error) {
      console.error('Error submitting supply chain record:', error)
      throw error
    }
  }

  // Upload files (photos, documents)
  async uploadFiles(files: File[], type: 'photos' | 'documents'): Promise<string[]> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
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

  // Get all supply chain records with filtering
  async getRecords(params: SupplyChainQueryParams = {}): Promise<{
    records: SupplyChainRecord[]
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

    const response = await fetch(`${API_BASE_URL}/supply-chain?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Get single supply chain record
  async getRecord(id: string): Promise<SupplyChainRecord> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<SupplyChainRecord>(response)
  }

  // Update supply chain record
  async updateRecord(data: UpdateSupplyChainRequest): Promise<SupplyChainRecord> {
    const { id, ...updateData } = data
    
    const response = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData),
    })

    return this.handleResponse<SupplyChainRecord>(response)
  }

  // Update a specific stage
  async updateStage(data: UpdateStageRequest): Promise<SupplyChainRecord> {
    const { recordId, stageId, ...stageData } = data
    
    const response = await fetch(`${API_BASE_URL}/supply-chain/${recordId}/stages/${stageId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(stageData),
    })

    return this.handleResponse<SupplyChainRecord>(response)
  }

  // Complete a stage (move to next stage)
  async completeStage(recordId: string, stageId: string, completionData?: {
    completedAt?: string
    notes?: string
    data?: Record<string, any>
  }): Promise<SupplyChainRecord> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/${recordId}/stages/${stageId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(completionData || {}),
    })

    return this.handleResponse<SupplyChainRecord>(response)
  }

  // Delete supply chain record
  async deleteRecord(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    await this.handleResponse(response)
  }

  // Generate QR code for product
  async generateQRCode(recordId: string): Promise<{ qrCodeHash: string; qrCodeUrl: string }> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/${recordId}/qr-code`, {
      method: 'POST',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ qrCodeHash: string; qrCodeUrl: string }>(response)
  }

  // Record to blockchain
  async recordToBlockchain(recordId: string): Promise<{ txHash: string }> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/${recordId}/blockchain`, {
      method: 'POST',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ txHash: string }>(response)
  }

  // Get supply chain statistics
  async getStatistics(userId?: string): Promise<SupplyChainStatistics> {
    const params = userId ? `?userId=${userId}` : ''
    
    const response = await fetch(`${API_BASE_URL}/supply-chain/statistics${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<SupplyChainStatistics>(response)
  }

  // Save draft record
  async saveDraft(formData: Partial<SupplyChainFormData>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/draft`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(formData),
    })

    return this.handleResponse<{ id: string }>(response)
  }

  // Load draft record
  async loadDraft(id: string): Promise<SupplyChainFormData> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/draft/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<SupplyChainFormData>(response)
  }

  // Get public record (no auth required) - for QR code scanning
  async getPublicRecord(productId: string): Promise<SupplyChainRecord> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/public/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<SupplyChainRecord>(response)
  }

  // Get batch information
  async getBatchInfo(batchId: string): Promise<BatchInfo> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/batch/${batchId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<BatchInfo>(response)
  }

  // Get all batches
  async getBatches(params: {
    page?: number
    limit?: number
    search?: string
    sourceType?: SourceType
    status?: RecordStatus
  } = {}): Promise<{
    batches: BatchInfo[]
    total: number
    page: number
    limit: number
  }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/supply-chain/batches?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Export records
  async exportRecords(params: SupplyChainQueryParams = {}, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
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

    const response = await fetch(`${API_BASE_URL}/supply-chain/export?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }

  // Get product journey for consumer view
  async getProductJourney(productId: string): Promise<{
    record: SupplyChainRecord
    stages: Array<{
      name: string
      status: StageStatus
      location?: string
      date?: string
      description?: string
      photos?: string[]
      verified: boolean
    }>
    certificates?: string[]
    sustainability?: {
      score: number
      factors: string[]
    }
  }> {
    const response = await fetch(`${API_BASE_URL}/supply-chain/journey/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse(response)
  }

  // Get file from IPFS hash
  getFileUrl(ipfsHash: string): string {
    return `${API_BASE_URL}/files/${ipfsHash}`
  }

  // Search products by location, species, or other criteria
  async searchProducts(query: string, filters?: {
    sourceType?: SourceType
    location?: string
    dateRange?: { from: string; to: string }
  }): Promise<SupplyChainRecord[]> {
    const searchParams = new URLSearchParams()
    searchParams.append('q', query)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && 'from' in value) {
            searchParams.append(`${key}From`, value.from)
            searchParams.append(`${key}To`, value.to)
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/supply-chain/search?${searchParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<SupplyChainRecord[]>(response)
  }
}

// Export singleton instance
export const supplyChainApi = new SupplyChainApiService()
export default supplyChainApi