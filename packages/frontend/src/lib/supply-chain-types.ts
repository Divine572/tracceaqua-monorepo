export enum ProductType {
  FARMED = 'farmed',
  WILD_CAPTURE = 'wild-capture',
}

export enum SupplyChainStage {
  HARVEST = 'harvest',
  PROCESSING = 'processing',
  TRANSPORT = 'transport',
  RETAIL = 'retail',
  SOLD = 'sold',
}

export enum ProductCategory {
  MOLLUSCS = 'molluscs',
  CRUSTACEANS = 'crustaceans',
  FINFISH = 'finfish',
  ECHINODERMS = 'echinoderms',
  PROCESSED = 'processed',
}

export interface Location {
  name: string
  coordinates: {
    latitude: number
    longitude: number
  }
  region: string
  waterBodyType?: 'marine' | 'freshwater' | 'brackish'
  description?: string
}

export interface HarvestInfo {
  method: string
  gearType?: string
  vesselInfo?: {
    name: string
    registration: string
    captain: string
  }
  harvestDate: Date
  location: Location
  waterConditions?: {
    temperature?: number
    salinity?: number
    pH?: number
    weather?: string
  }
  bycatch?: {
    species: string
    quantity: number
    action: string // released, retained, etc.
  }[]
  permits: {
    type: string
    number: string
    issuer: string
    validUntil: Date
  }[]
}

export interface FarmInfo {
  farmName: string
  farmLicense: string
  owner: string
  location: Location
  farmingMethod: 'intensive' | 'semi-intensive' | 'extensive'
  pondSpecs?: {
    area: number
    depth: number
    waterSource: string
  }
  stockingDate: Date
  harvestDate: Date
  feedUsed?: {
    type: string
    quantity: number
    source: string
  }[]
  waterManagement: {
    exchangeFrequency: string
    qualityMonitoring: string
  }
  certifications: {
    type: string
    number: string
    issuer: string
    validUntil: Date
  }[]
}

export interface ProcessingInfo {
  facilityName: string
  facilityLicense: string
  location: Location
  processType: string
  methods: string[]
  temperature: number
  additives?: {
    name: string
    purpose: string
    quantity: number
  }[]
  preservation: string
  packaging: {
    material: string
    size: string
    labeling: string
  }
  qualityTests: {
    type: string
    result: string
    date: Date
  }[]
  haccpCompliance: boolean
}

export interface TransportInfo {
  company: string
  vehicleType: string
  vehicleRegistration: string
  driver: string
  route: {
    from: Location
    to: Location
    distance: number
    duration: number
  }
  conditions: {
    temperature: number
    humidity?: number
    monitoring: string
  }
  departureTime: Date
  arrivalTime: Date
  tamperSeals?: string[]
}

export interface RetailInfo {
  storeName: string
  location: Location
  displayMethod: string
  storageTemp: number
  pricePerKg: number
  salesDate?: Date
  customerInfo?: {
    type: 'individual' | 'business'
    name?: string
    contact?: string
  }
}

export interface QualityMetrics {
  appearance: number // 1-10 scale
  freshness: number // 1-10 scale
  size: {
    average: number
    range: string
    unit: string
  }
  weight: {
    totalKg: number
    averagePerPiece?: number
  }
  defects?: string[]
  notes?: string
}

export interface SupplyChainBatch {
  id: string
  batchNumber: string
  qrCode?: string
  productType: ProductType
  category: ProductCategory
  species: string
  commonName?: string
  currentStage: SupplyChainStage
  status: 'active' | 'completed' | 'expired' | 'recalled'
  
  // Source information
  harvest?: HarvestInfo
  farm?: FarmInfo
  
  // Stage tracking
  stages: {
    stage: SupplyChainStage
    timestamp: Date
    operator: {
      id: string
      name: string
      role: string
      organization: string
    }
    details: ProcessingInfo | TransportInfo | RetailInfo | any
    documents: {
      name: string
      type: string
      hash: string // IPFS hash
      url: string
    }[]
    qualityMetrics?: QualityMetrics
    verified: boolean
    blockchainTxHash?: string
  }[]
  
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  notes?: string
  
  // Consumer interaction
  views?: number
  ratings?: {
    rating: number
    comment?: string
    date: Date
    verifiedPurchase: boolean
  }[]
}