import { z } from "zod";


export const batchCreationSchema = z.object({
  // Required fields
  sourceType: z.string().min(1, "Source type is required"),
  speciesName: z.string().min(1, "Species name is required"),
  productName: z.string().min(1, "Product name is required"),
  
  // Optional core fields
  productDescription: z.string().optional(),
  currentStage: z.string().optional(),
  status: z.string().optional(),
  isPublic: z.boolean(),
  
  // Stage-specific data (all optional)
  hatcheryData: z.object({
    speciesSpawned: z.string().optional(),
    eggCount: z.number().optional(),
    spawningDate: z.string().optional(),
    waterTemperature: z.number().optional(),
    salinity: z.number().optional(),
    feedType: z.string().optional(),
    survivalRate: z.number().optional(),
  }).optional(),
  
  growOutData: z.object({
    growingLocation: z.string().optional(),
    stockingDensity: z.number().optional(),
    growthPeriod: z.number().optional(),
    feedConversionRatio: z.number().optional(),
    waterQuality: z.record(z.string(), z.any()).optional(),
    diseaseTreatments: z.array(z.string()).optional(),
  }).optional(),
  
  fishingData: z.object({
    fishingMethod: z.string().optional(),
    coordinates: z.record(z.string(), z.any()).optional(),
    waterDepth: z.number().optional(),
    vesselDetails: z.record(z.string(), z.any()).optional(),
    catchComposition: z.array(z.record(z.string(), z.any())).optional(),
    seaConditions: z.string().optional(),
  }).optional(),
  
  harvestData: z.object({
    harvestMethod: z.string().optional(),
    harvestLocation: z.string().optional(),
    totalWeight: z.number().optional(),
    pieceCount: z.number().optional(),
    averageSize: z.number().optional(),
    qualityGrade: z.string().optional(),
    postHarvestHandling: z.string().optional(),
  }).optional(),
  
  processingData: z.object({
    facilityName: z.string().optional(),
    processingMethod: z.string().optional(),
    processingDate: z.string().optional(),
    inputWeight: z.number().optional(),
    outputWeight: z.number().optional(),
    processingYield: z.number().optional(),
    qualityTests: z.array(z.record(z.string(), z.any())).optional(),
    packaging: z.record(z.string(), z.any()).optional(),
  }).optional(),
  
  storageData: z.object({
    storageFacility: z.string().optional(),
    storageTemperature: z.number().optional(),
    storageMethod: z.string().optional(),
    storageDuration: z.number().optional(),
    humidityLevel: z.number().optional(),
    qualityChecks: z.array(z.record(z.string(), z.any())).optional(),
  }).optional(),
  
  transportData: z.object({
    transportMethod: z.string().optional(),
    vehicleDetails: z.record(z.string(), z.any()).optional(),
    originLocation: z.string().optional(),
    destinationLocation: z.string().optional(),
    transportTemperature: z.number().optional(),
    transportDuration: z.number().optional(),
    coldChainMonitoring: z.array(z.record(z.string(), z.any())).optional(),
  }).optional(),
});