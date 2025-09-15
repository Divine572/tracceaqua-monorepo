import { z } from "zod";

const numberField = z.preprocess(
  val => {
    if (val === "" || val === null || typeof val === "undefined") return NaN;
    if (typeof val === "string" && val.trim() === "") return NaN;
    const num = Number(val);
    return isNaN(num) ? NaN : num;
  },
  z.number().refine((val) => !isNaN(val), { message: "This field is required" })
);

export const batchCreationSchema = z.object({
  productId: z.string().min(1, "Sampling ID is required"),
  sourceType: z.string().min(1, "Source type is required"),
  speciesName: z.string().min(1, "Species name is required"),
  productName: z.string().min(1, "Product name is required"),

  productDescription: z.string().min(1, "Product description is required"),
  isPublic: z.boolean(),

  hatcheryData: z.object({
    speciesSpawned: z.string().min(1, "Species spawned is required"),
    eggCount: numberField,
    spawningDate: z.string().min(1, "Spawning date is required"),
    waterTemperature: numberField,
    salinity: numberField,
    feedType: z.string().min(1, "Feed type is required"),
    survivalRate: numberField,
  }),

  growOutData: z
    .object({
      growingLocation: z.string().min(1, "Growing location is required"),
      stockingDensity: numberField,
      growthPeriod: numberField,
      feedConversionRatio: numberField,
      waterQuality: z.record(z.string(), z.any()).default({}), // ✅ empty object default
      diseaseTreatmentsString: z.string().min(1, "Disease treatments are required"),
    })
    .transform((data) => ({
      ...data,
      diseaseTreatments: data.diseaseTreatmentsString
        ? data.diseaseTreatmentsString.split(",").map((s) => s.trim())
        : [],
    })),

  fishingData: z.object({
    fishingMethod: z.string().min(1, "Fishing method is required"),
    coordinates: z.record(z.string(), z.any()).default({}), // ✅ empty object
    waterDepth: numberField,
    vesselDetails: z.record(z.string(), z.any()).default({}), // ✅ empty object
    catchComposition: z.array(z.record(z.string(), z.any())).default([]), // ✅ empty array
    seaConditions: z.string().min(1, "Sea conditions are required"),
  }),

  harvestData: z.object({
    harvestMethod: z.string().min(1, "Harvest method is required"),
    harvestLocation: z.string().min(1, "Harvest location is required"),
    totalWeight: numberField,
    pieceCount: numberField,
    averageSize: numberField,
    qualityGrade: z.string().min(1, "Quality grade is required"),
    postHarvestHandling: z.string().min(1, "Post-harvest handling is required"),
  }),

  processingData: z.object({
    facilityName: z.string().min(1, "Facility name is required"),
    processingMethod: z.string().min(1, "Processing method is required"),
    processingDate: z.string().min(1, "Processing date is required"),
    inputWeight: numberField,
    outputWeight: numberField,
    processingYield: numberField,
    qualityTests: z.array(z.record(z.string(), z.any())).default([]), // ✅ empty array
    packaging: z.record(z.string(), z.any()).default({}), // ✅ empty object
  }),

  storageData: z.object({
    storageFacility: z.string().min(1, "Storage facility is required"),
    storageTemperature: numberField,
    storageMethod: z.string().min(1, "Storage method is required"),
    storageDuration: numberField,
    humidityLevel: numberField,
    qualityChecks: z.array(z.record(z.string(), z.any())).default([]), // ✅ empty array
  }),

  transportData: z.object({
    transportMethod: z.string().min(1, "Transport method is required"),
    vehicleDetails: z.record(z.string(), z.any()).default({}), // ✅ empty object
    originLocation: z.string().min(1, "Origin location is required"),
    destinationLocation: z.string().min(1, "Destination location is required"),
    transportTemperature: numberField,
    transportDuration: numberField,
    coldChainMonitoring: z.array(z.record(z.string(), z.any())).default([]), // ✅ empty array
  }),

  location: z.string().min(1, "Location is required"),
  notes: z.string().min(1, "Notes are required"),
});
