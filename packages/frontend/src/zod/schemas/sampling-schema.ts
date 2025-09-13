import z from "zod";

export const samplingSchema = z.object({
  // Required fields
  samplingId: z.string().min(1, "Sampling ID is required"),
  
  locationData: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    waterBody: z.string().min(2, "Water body name is required"),
    locationDescription: z.string().min(5, "Location description is required"),
    waterDepth: z.number().min(0, "Water depth must be positive"),
    waterTemperature: z.number().min(-10).max(50, "Temperature must be realistic"),
    salinity: z.number().min(0).max(50, "Salinity must be between 0-50 ppt"),
    phLevel: z.number().min(0).max(14, "pH must be between 0-14"),
    dissolvedOxygen: z.number().min(0).max(30, "Dissolved oxygen must be realistic"),
  }),

  speciesData: z.object({
    scientificName: z.string().min(2, "Scientific name is required"),
    commonName: z.string().min(2, "Common name is required"),
    family: z.string().min(2, "Family is required"),
    totalCount: z.number().min(1, "Total count must be at least 1"),
    sampleSize: z.number().min(1, "Sample size must be at least 1"),
    averageLength: z.number().min(0, "Average length must be positive"),
    averageWeight: z.number().min(0, "Average weight must be positive"),
    maturityStage: z.enum(["juvenile", "adult", "spawning", "unknown"]),
    healthStatus: z.enum(["healthy", "diseased", "injured", "unknown"]),
  }),

  samplingData: z.object({
    samplingMethod: z.string().min(2, "Sampling method is required"),
    gearSpecs: z.string().min(2, "Gear specifications are required"),
    samplingDuration: z.number().min(1, "Sampling duration must be at least 1 minute"),
    effortHours: z.number().min(0.1, "Effort hours must be at least 0.1"),
    weatherConditions: z.string().min(2, "Weather conditions are required"),
    seaState: z.string().min(2, "Sea state is required"),
    tidalConditions: z.string().min(2, "Tidal conditions are required"),
  }),

  // Optional fields
  labTests: z.array(z.string()).optional().default([]),
  fileHashes: z.array(z.string()).optional().default([]),
  researcherNotes: z.string().optional(),
});