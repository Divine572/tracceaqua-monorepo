"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Package,
  Fish,
  Factory,
  Truck,
  Droplets,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { batchCreationSchema } from "@/zod/schemas/batch-creation-schema";
import BasicInfoStep from "./BasicStepInfo";
import HatcheryStep from "./HatcheryStep";
import GrowOutStep from "./GrowOutStep";
import FishingStep from "./FishingStep";
import HarvestStep from "./HarvestStep";
import ProcessingStep from "./ProcessingStep";
import StorageStep from "./StorageStep";
import TransportStep from "./TransportStep";

type BatchCreationData = z.infer<typeof batchCreationSchema>;

const steps = [
  {
    id: 1,
    title: "Basic Info",
    description: "Product and source details",
    icon: Package,
    fields: [
      "sourceType",
      "speciesName",
      "productName",
      "productDescription",
      "currentStage",
      "status",
      "isPublic",
    ],
  },
  {
    id: 2,
    title: "Hatchery",
    description: "Spawning and early stage",
    icon: Droplets,
    fields: ["hatcheryData"],
  },
  {
    id: 3,
    title: "Grow-Out",
    description: "Growth and farming",
    icon: Fish,
    fields: ["growOutData"],
  },
  {
    id: 4,
    title: "Fishing",
    description: "Capture details",
    icon: Fish,
    fields: ["fishingData"],
  },
  {
    id: 5,
    title: "Harvest",
    description: "Harvest information",
    icon: Package,
    fields: ["harvestData"],
  },
  {
    id: 6,
    title: "Processing",
    description: "Processing details",
    icon: Factory,
    fields: ["processingData"],
  },
  {
    id: 7,
    title: "Storage",
    description: "Storage conditions",
    icon: Warehouse,
    fields: ["storageData"],
  },
  {
    id: 8,
    title: "Transport",
    description: "Transportation details",
    icon: Truck,
    fields: ["transportData"],
  },
];

interface BatchCreationWizardProps {
  onSave?: (data: BatchCreationData) => void;
  onSubmit?: (data: BatchCreationData) => void;
}

export function BatchCreationWizard({
  onSave,
  // onSubmit,
}: BatchCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const router = useRouter();

  const methods = useForm<BatchCreationData>({
    resolver: zodResolver(batchCreationSchema) as any,
    defaultValues: {
      productId: `BAC_${uuidv4()}`,
      sourceType: "",
      speciesName: "",
      productName: "",
      productDescription: "",
      isPublic: true,
      hatcheryData: {},
      growOutData: {},
      fishingData: {},
      harvestData: {},
      processingData: {},
      storageData: {},
      transportData: {},
      location: "",
      notes: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: BatchCreationData) => {
    console.log("✅ Submitted data:", data);
  };

  const onError = (errors: any) => {
    console.log("❌ Validation errors:", errors);
  };

  const { handleSubmit, trigger, getValues } = methods;

  const nextStep = async () => {
    const currentStepConfig = steps[currentStep - 1];
    const isStepValid = await trigger(currentStepConfig.fields as any);

    if (isStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveAsDraft = async () => {
    const data = getValues();
    setIsLoading(true);
    try {
      onSave?.(data);
      toast.success("Your batch has been saved as a draft.");
    } catch (error) {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = async (data: BatchCreationData) => {
    console.log("Form submitted raw:", data);

    setIsLoading(true);
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
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <HatcheryStep />;
      case 3:
        return <GrowOutStep />;
      case 4:
        return <FishingStep />;
      case 5:
        return <HarvestStep />;
      case 6:
        return <ProcessingStep />;
      case 7:
        return <StorageStep />;
      case 8:
        return <TransportStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Create Supply Chain Batch</CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}:{" "}
                {steps[currentStep - 1]?.title}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={saveAsDraft}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>

          <Progress value={progress} className="w-full" />

          {/* Step Navigation */}
          <div className="flex items-center justify-between mt-4 overflow-x-auto">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center space-y-2 cursor-pointer min-w-0 flex-1",
                    isActive && "text-primary",
                    isCompleted && "text-green-600"
                  )}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full border-2 transition-colors",
                      isActive && "border-primary bg-primary/10",
                      isCompleted && "border-green-600 bg-green-50",
                      !isActive && !isCompleted && "border-muted-foreground/30"
                    )}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-center hidden sm:block">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <FormProvider {...methods}>
        {/* Prevent auto-submit */}
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStep()}

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {currentStep < steps.length ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit(onFormSubmit, onError)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Batch..." : "Create Batch"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
