"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupplyChainFormType, supplyChainSchema } from "@/zod/schemas/supply-chain-form-schema";

import GrowOutStep from "./steps/GrowOutStep";
import FishingStep from "./steps/FishingStep";
// import ProcessingStep from "./steps/ProcessingStep";
// import StorageStep from "./steps/StorageStep";
// import TransportStep from "./steps/TransportStep";

export default function SupplyChainForm() {
  const methods = useForm<SupplyChainFormType>({
    resolver: zodResolver(supplyChainSchema) as any,
    defaultValues: {
      growOutData: { waterQuality: {} },
      fishingData: {
        coordinates: { latitude: "", longitude: "" },
        vesselDetails: { vesselName: "", registrationNumber: "" },
        catchComposition: [],
      },
      processingData: {
        processingDate: "",
        qualityTests: [],
        packaging: { type: "", label: "" },
      },
      storageData: { qualityChecks: [] },
      transportData: {
        vehicleDetails: { vehicleId: "", driverName: "" },
        coldChainMonitoring: [],
      },
    },
  });

  const onSubmit = (data: SupplyChainFormType) => {
    console.log("Submitted data:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <GrowOutStep />
         <FishingStep />
       {/* <ProcessingStep />
        <StorageStep />
        <TransportStep /> */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      </form>
    </FormProvider>
  );
}
