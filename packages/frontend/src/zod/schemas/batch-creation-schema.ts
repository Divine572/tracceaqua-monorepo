import { z } from "zod";

const numberField = z.preprocess((val) => {
  if (val === "" || val === null || typeof val === "undefined")
    return undefined;
  if (typeof val === "string" && val.trim() === "") return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().optional());

const HatcheryDataSchema = z.object({
  speciesSpawned: z.string().min(1, "Species spawned is required"),
  eggCount: z.number().refine((val) => typeof val === "number" && !isNaN(val), {
    message: "Egg count must be a number",
  }),
  spawningDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid date format",
  }),
  waterTemperature: z
    .number()
    .refine((val) => typeof val === "number" && !isNaN(val), {
      message: "Water temperature must be a number",
    }),
  salinity: z.number().refine((val) => typeof val === "number" && !isNaN(val), {
    message: "Salinity must be a number",
  }),
  feedType: z.string().min(1, "Feed type is required"),
  survivalRate: z
    .number()
    .refine((val) => typeof val === "number" && !isNaN(val), {
      message: "Survival must be a number",
    }),
});

const GrowOutDataSchema = z.object({
  growingLocation: z.string().min(1, "Growing location is required"),
  stockingDensity: numberField,
  growthPeriod: numberField,
  feedConversionRatio: numberField,
  waterQuality: z.object({
    temperature: numberField,
    oxygen: numberField,
    pH: numberField,
    ammonia: numberField,
  }),
  diseaseTreatments: z.array(z.string()),
});

const FishingDataSchema = z.object({
  fishingMethod: z.string().min(1, "Fishing method is required"),
  coordinates: z.object({
    latitude: numberField,
    longitude: numberField,
  }),
  waterDepth: numberField,
  vesselDetails: z.object({
    name: z.string(),
    registration: z.string(),
    captain: z.string(),
  }),
  catchComposition: z.array(
    z.object({
      species: z.string(),
      quantity: numberField,
      averageSize: numberField,
    })
  ),
  seaConditions: z.string().min(1, "Sea conditions are required"),
});

const HarvestDataSchema = z.object({
  harvestMethod: z.string().min(1, "Harvest method is required"),
  harvestLocation: z.string().min(1, "Harvest location is required"),
  totalWeight: z.number(),
  pieceCount: z.number(),
  averageSize: z.number(),
  qualityGrade: z.string().min(1, "Quality grade is required"),
  postHarvestHandling: z.string(),
});

const ProcessingDataSchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  processingMethod: z.string().min(1, "Processing method is required"),
  processingDate: z
    .string()
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid date format",
    }),
  inputWeight: numberField,
  outputWeight: numberField,
  processingYield: numberField,
  qualityTests: z.array(
    z.object({
      testType: z.string(),
      result: z.string(),
      standard: z.string(),
      passed: z.boolean(),
    })
  ),
  packaging: z.object({
    type: z.string(),
    size: z.string(),
    material: z.string(),
    labelInfo: z.string(),
  }),
});

const StorageDataSchema = z.object({
  storageFacility: z.string().min(1, "Storage facility is required"),
  storageTemperature: numberField,
  storageMethod: z.string().min(1, "Storage method is required"),
  storageDuration: numberField,
  humidityLevel: numberField,
  qualityChecks: z.array(
    z.object({
      checkDate: z.string().refine((date) => !isNaN(new Date(date).getTime())),
      temperature: z.number(),
      quality: z.string(),
      notes: z.string(),
    })
  ),
});

const TransportDataSchema = z.object({
  transportMethod: z.string().min(1, "Transport method is required"),
  vehicleDetails: z.object({
    type: z.string(),
    registration: z.string(),
    driver: z.string(),
  }),
  originLocation: z.string().min(1, "Origin location is required"),
  destinationLocation: z.string().min(1, "Destination location is required"),
  transportTemperature: numberField,
  transportDuration: numberField,
  coldChainMonitoring: z.array(
    z.object({
      timestamp: z.string().refine((date) => !isNaN(new Date(date).getTime())),
      temperature: z.number(),
      location: z.string(),
    })
  ),
});

export const batchCreationSchema = z.object({
  productId: z.string().min(3).max(50),
  sourceType: z.enum(["FARMED", "WILD_CAPTURE"]),
  speciesName: z.string().min(1),
  productName: z.string().min(1),
  productDescription: z.string().max(500).optional(),
  batchId: z.string().optional(),
  hatcheryData: HatcheryDataSchema.optional(),
  growOutData: GrowOutDataSchema.optional(),
  fishingData: FishingDataSchema.optional(),
  harvestData: HarvestDataSchema.optional(),
  processingData: ProcessingDataSchema.optional(),
  storageData: StorageDataSchema.optional(),
  transportData: TransportDataSchema.optional(),
  location: z.string().optional(),
  notes: z.string().max(1000).optional(),
  isPublic: z.boolean().default(true).optional(),
});

export type BatchFormData = z.infer<typeof batchCreationSchema>;
