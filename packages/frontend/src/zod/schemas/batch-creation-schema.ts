import { z } from "zod";

const numberField = z.preprocess(
  val => {
    if (val === "" || val === null || typeof val === "undefined") return undefined;
    if (typeof val === "string" && val.trim() === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  numberField
);

export const batchCreationSchema = z.object({
  // Required fields
  productId: z.string().min(1, "Sampling ID is required"),
  
  sourceType: z.string().min(1, "Source type is required"),
  speciesName: z.string().min(1, "Species name is required"),
  productName: z.string().min(1, "Product name is required"),

  // Optional core fields
  productDescription: z.string().optional(),
  currentStage: z.string().optional(),
  status: z.string().optional(),
  isPublic: z.boolean(),

  // Stage-specific data (all optional)
  hatcheryData: z
    .object({
      speciesSpawned: z.string().optional(),
      eggCount: numberField,
      spawningDate: z.string().optional(),
      waterTemperature: numberField,
      salinity: numberField,
      feedType: z.string().optional(),
      survivalRate: numberField,
    })
    .optional(),

  growOutData: z
    .object({
      growingLocation: z.string().optional(),
      stockingDensity: numberField,
      growthPeriod: numberField,
      feedConversionRatio: numberField,
      waterQuality: z.record(z.string(), z.any()).optional(),
      diseaseTreatmentsString: z.string().optional(),

      // diseaseTreatments: z.array(z.string()).optional(),
    })
    .transform((data) => ({
      ...data,
      diseaseTreatments: data.diseaseTreatmentsString
        ? data.diseaseTreatmentsString.split(",").map((s) => s.trim())
        : [],
    })),

  fishingData: z
    .object({
      fishingMethod: z.string().optional(),
      coordinates: z.record(z.string(), z.any()).optional(),
      waterDepth: numberField,
      vesselDetails: z.record(z.string(), z.any()).optional(),
      catchComposition: z.array(z.record(z.string(), z.any())).optional(),
      seaConditions: z.string().optional(),
    })
    .optional(),

  harvestData: z
    .object({
      harvestMethod: z.string().optional(),
      harvestLocation: z.string().optional(),
      totalWeight: numberField,
      pieceCount: numberField,
      averageSize: numberField,
      qualityGrade: z.string().optional(),
      postHarvestHandling: z.string().optional(),
    })
    .optional(),

  processingData: z
    .object({
      facilityName: z.string().optional(),
      processingMethod: z.string().optional(),
      processingDate: z.string().optional(),
      inputWeight: numberField,
      outputWeight: numberField,
      processingYield: numberField,
      qualityTests: z.array(z.record(z.string(), z.any())).optional(),
      packaging: z.record(z.string(), z.any()).optional(),
    })
    .optional(),

  storageData: z
    .object({
      storageFacility: z.string().optional(),
      storageTemperature: numberField,
      storageMethod: z.string().optional(),
      storageDuration: numberField,
      humidityLevel: numberField,
      qualityChecks: z.array(z.record(z.string(), z.any())).optional(),
    })
    .optional(),

  transportData: z
    .object({
      transportMethod: z.string().optional(),
      vehicleDetails: z.record(z.string(), z.any()).optional(),
      originLocation: z.string().optional(),
      destinationLocation: z.string().optional(),
      transportTemperature: numberField,
      transportDuration: numberField,
      coldChainMonitoring: z.array(z.record(z.string(), z.any())).optional(),
    })
    .optional(),
});
