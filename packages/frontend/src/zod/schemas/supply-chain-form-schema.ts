import { z } from "zod";

export const supplyChainSchema = z.object({
  growOutData: z.object({
    waterQuality: z.record(z.string(), z.string()).default({}),
  }),
  fishingData: z.object({
    coordinates: z.object({
      latitude: z.string().min(1, "Latitude is required"),
      longitude: z.string().min(1, "Longitude is required"),
    }),
    vesselDetails: z.object({
      vesselName: z.string().min(1, "Vessel name is required"),
      registrationNumber: z.string().min(1, "Registration number is required"),
    }),
    catchComposition: z
      .array(
        z.object({
          species: z.string().min(1, "Species is required"),
          quantity: z.string().min(1, "Quantity is required"),
        })
      )
      .default([]),
  }),
  processingData: z.object({
    processingDate: z.string().min(1, "Processing date is required"),
    qualityTests: z
      .array(
        z.object({
          testName: z.string().min(1, "Test name is required"),
          result: z.string().min(1, "Result is required"),
        })
      )
      .default([]),
    packaging: z.object({
      type: z.string().min(1, "Packaging type is required"),
      label: z.string().min(1, "Label is required"),
    }),
  }),
  storageData: z.object({
    qualityChecks: z
      .array(
        z.object({
          check: z.string().min(1, "Check description is required"),
          status: z.string().min(1, "Status is required"),
        })
      )
      .default([]),
  }),
  transportData: z.object({
    vehicleDetails: z.object({
      vehicleId: z.string().min(1, "Vehicle ID is required"),
      driverName: z.string().min(1, "Driver name is required"),
    }),
    coldChainMonitoring: z
      .array(
        z.object({
          temperature: z.string().min(1, "Temperature is required"),
          time: z.string().min(1, "Time is required"),
        })
      )
      .default([]),
  }),
});

export type SupplyChainFormType = z.infer<typeof supplyChainSchema>;
