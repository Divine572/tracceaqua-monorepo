"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import {
  Fish,
  Factory,
  Truck,
  FileText,
  PackageCheck,
  Building,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  batchCreationSchema,
  BatchFormData,
} from "@/zod/schemas/batch-creation-schema";
import BasicInfoStep from "./BasicStepInfo";
import HatcheryStep from "./HatcheryStep";
import GrowOutStep from "./GrowOutStep";
import FishingStep from "./FishingStep";
import HarvestStep from "./HarvestStep";
import ProcessingStep from "./ProcessingStep";
import StorageStep from "./StorageStep";
import TransportStep from "./TransportStep";
import ReviewStep from "./ReviewStep";

export function BatchCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter()

  const methods = useForm({
    resolver: zodResolver(batchCreationSchema),
    defaultValues: {
      productId: `BAC_${uuidv4()}`,
      sourceType: undefined,
      speciesName: "",
      productName: "",
      isPublic: true,
      productDescription: "",
      location: "",
      notes: "",
      batchId: "",
      hatcheryData: undefined,
      growOutData: undefined,
      fishingData: undefined,
      harvestData: undefined,
      processingData: undefined,
      storageData: undefined,
      transportData: undefined,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = methods;
  const sourceType = watch("sourceType");
  const formData = watch();

  const getSteps = () => {
    const baseSteps = [{ id: "basic", title: "Basic Info", icon: FileText }];

    if (sourceType === "FARMED") {
      baseSteps.push(
        { id: "hatchery", title: "Hatchery", icon: Fish },
        { id: "growout", title: "Grow-Out", icon: Building }
      );
    } else if (sourceType === "WILD_CAPTURE") {
      baseSteps.push({ id: "fishing", title: "Fishing", icon: Fish });
    }

    baseSteps.push(
      { id: "harvest", title: "Harvest", icon: PackageCheck },
      { id: "processing", title: "Processing", icon: Factory },
      { id: "storage", title: "Storage", icon: Building },
      { id: "transport", title: "Transport", icon: Truck },
      { id: "review", title: "Review", icon: Check }
    );

    return baseSteps;
  };

  const steps = getSteps();

  const onSubmit = async () => {
    console.log("Submitting");
    setIsSubmitting(true);
    try {
      // Simulate blockchain submission
      // console.log("Submitting to blockchain:", data);

      // Mock API call to backend
      await new Promise((resolve) => setTimeout(resolve, 3000));

      alert(
        "Successfully submitted to blockchain! Transaction hash: 0x1234567890abcdef..."
      );
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit2 = (data: BatchFormData) => {
    console.log("✅ Submitted data:", data);
  };

  const onError = (errors: any) => {
    console.log("❌ Validation errors:", errors);
  };

  const nextStep = async () => {
    const currentStepId = steps[currentStep]?.id;
    let fieldsToValidate: FieldPath<BatchFormData>[] = [];

    // Define which fields to validate for each step
    // Make sure these field names match your schema
    switch (currentStepId) {
      case "basic":
        fieldsToValidate = [
          "sourceType",
          "speciesName",
          "productName",
          "isPublic",
          "productDescription",
          "location",
          "notes",
          "batchId",
        ];
        break;
      case "hatchery":
        fieldsToValidate = [
          "hatcheryData.speciesSpawned",
          "hatcheryData.eggCount",
          "hatcheryData.spawningDate",
          "hatcheryData.waterTemperature",
          "hatcheryData.salinity",
          "hatcheryData.feedType",
          "hatcheryData.survivalRate",
        ];
        break;
      case "growout":
        fieldsToValidate = [
          "growOutData.growingLocation",
          "growOutData.stockingDensity",
          "growOutData.growthPeriod",
          "growOutData.feedConversionRatio",
          "growOutData.waterQuality.temperature",
          "growOutData.waterQuality.oxygen",
          "growOutData.waterQuality.pH",
          "growOutData.waterQuality.ammonia",
          "growOutData.diseaseTreatments",
        ];
        break;
      case "fishing":
        fieldsToValidate = [
          "fishingData.fishingMethod",
          "fishingData.coordinates.latitude",
          "fishingData.coordinates.longitude",
          "fishingData.waterDepth",
          "fishingData.vesselDetails.name",
          "fishingData.vesselDetails.registration",
          "fishingData.vesselDetails.captain",
          "fishingData.catchComposition",
          "fishingData.seaConditions",
        ];
        break;
      case "harvest":
        fieldsToValidate = [
          "harvestData.harvestMethod",
          "harvestData.harvestLocation",
          "harvestData.totalWeight",
          "harvestData.pieceCount",
          "harvestData.averageSize",
          "harvestData.qualityGrade",
          "harvestData.postHarvestHandling",
        ];
        break;
      case "processing":
        fieldsToValidate = [
          "processingData.facilityName",
          "processingData.processingMethod",
          "processingData.processingDate",
          "processingData.inputWeight",
          "processingData.outputWeight",
          "processingData.processingYield",
          "processingData.qualityTests",
          "processingData.packaging.type",
          "processingData.packaging.size",
          "processingData.packaging.material",
          "processingData.packaging.labelInfo",
        ];
        break;
      case "storage":
        fieldsToValidate = [
          "storageData.storageFacility",
          "storageData.storageTemperature",
          "storageData.storageMethod",
          "storageData.storageDuration",
          "storageData.humidityLevel",
          "storageData.qualityChecks",
        ];
        break;
      case "transport":
        fieldsToValidate = [
          "transportData.transportMethod",
          "transportData.vehicleDetails.type",
          "transportData.vehicleDetails.registration",
          "transportData.vehicleDetails.driver",
          "transportData.originLocation",
          "transportData.destinationLocation",
          "transportData.transportTemperature",
          "transportData.transportDuration",
          "transportData.coldChainMonitoring",
        ];
        break;
      // No fields to validate for the "review" step
    }

    const isValid = await methods.trigger(fieldsToValidate, {
      shouldFocus: true,
    });

    console.log(isValid, errors)

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async(data: BatchFormData) => {
    console.log("Form data before cleanup:", data);

    // Filter out the empty/undefined optional data
    const cleanedData = {
      ...data,
      productId: data.productId,
      sourceType: data.sourceType,
      speciesName: data.speciesName,
      productName: data.productName,
      productDescription: data.productDescription,
      isPublic: data.isPublic,
      batchId: data.batchId,
      location: data.location,
      notes: data.notes,
    };

    // Conditionally add the stage data based on source type
    if (data.sourceType === "FARMED") {
      if (data.hatcheryData) {
        cleanedData.hatcheryData = data.hatcheryData;
      }
      if (data.growOutData) {
        cleanedData.growOutData = data.growOutData;
      }
    } else if (data.sourceType === "WILD_CAPTURE") {
      if (data.fishingData) {
        cleanedData.fishingData = data.fishingData;
      }
    }

    // Add other stage data if it exists
    if (data.harvestData) {
      cleanedData.harvestData = data.harvestData;
    }
    if (data.processingData) {
      cleanedData.processingData = data.processingData;
    }
    if (data.storageData) {
      cleanedData.storageData = data.storageData;
    }
    if (data.transportData) {
      cleanedData.transportData = data.transportData;
    }

    // Now, send this cleanedData to your backend API
    console.log("Cleaned data ready for submission:", cleanedData);
    // await fetch("/api/supply-chain/create-batch", { ... });

    try {
      // Safely clean nested optional objects

      console.log("Cleaned form data:", data);

      const response = await fetch("/api/supply-chain/create-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Try to parse backend error details if available
        let errorMessage = `Failed to create batch. Status: ${response.status}`;
        try {
          const errJson = await response.json();
          console.error("API Error response:", errJson);
          if (errJson.message) errorMessage = errJson.message;
        } catch {
          console.error("API returned non-JSON error");
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Batch created successfully:", result);

      toast.success("Your supply chain batch has been created.");
      router.push("/dashboard/supply-chain");
    } catch (error: any) {
      console.error("Form submit failed:", error);
      toast.error("Failed to create batch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const stepId = steps[currentStep]?.id;

    switch (stepId) {
      case "basic":
        return <BasicInfoStep />;
      case "hatchery":
        return <HatcheryStep />;
      case "growout":
        return <GrowOutStep />;
      case "fishing":
        return <FishingStep />;
      case "harvest":
        return <HarvestStep />;
      case "processing":
        return <ProcessingStep />;
      case "storage":
        return <StorageStep />;
      case "transport":
        return <TransportStep />;
      case "review":
        return <ReviewStep data={formData as BatchFormData} />;
      default:
        return <BasicInfoStep />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className=" border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-8 h-0.5 mx-4 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormProvider {...methods}>
          <div onSubmit={handleSubmit(onSubmit)}>
            <div className=" rounded-2xl shadow-xl p-8">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleSubmit(onFormSubmit, onError)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Submitting..." : "Submit to Blockchain"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}
