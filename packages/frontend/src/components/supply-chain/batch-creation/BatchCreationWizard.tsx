"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
  Thermometer,
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
  onSubmit,
}: BatchCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const methods = useForm<BatchCreationData>({
    resolver: zodResolver(batchCreationSchema),
    defaultValues: {
      sourceType: "",
      speciesName: "",
      productName: "",
      productDescription: "",
      currentStage: "",
      status: "active",
      isPublic: true,
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
      toast({
        title: "Draft saved",
        description: "Your batch has been saved as a draft.",
      });
      // toast()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = async (data: BatchCreationData) => {
    console.log("Form submitted raw:", data);
    // const requiredFieldsValid = await trigger([
    //   "sourceType",
    //   "speciesName",
    //   "productName",
    // ]);
    // console.log("Validation result:", requiredFieldsValid, getValues());
    // if (!requiredFieldsValid) {
    //   toast({
    //     title: "Validation Error",
    //     description:
    //       "Please fill in all required fields (Source Type, Species Name, Product Name).",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    // console.log("submit");
    // setIsLoading(true);
    try {
      // Clean up the data - remove empty optional objects
      const cleanData = {
        ...data,
        hatcheryData:
          Object.keys(data.hatcheryData || {}).length > 0
            ? data.hatcheryData
            : undefined,
        growOutData:
          Object.keys(data.growOutData || {}).length > 0
            ? data.growOutData
            : undefined,
        fishingData:
          Object.keys(data.fishingData || {}).length > 0
            ? data.fishingData
            : undefined,
        harvestData:
          Object.keys(data.harvestData || {}).length > 0
            ? data.harvestData
            : undefined,
        processingData:
          Object.keys(data.processingData || {}).length > 0
            ? data.processingData
            : undefined,
        storageData:
          Object.keys(data.storageData || {}).length > 0
            ? data.storageData
            : undefined,
        transportData:
          Object.keys(data.transportData || {}).length > 0
            ? data.transportData
            : undefined,
      };

      console.log(cleanData);

      onSubmit?.(cleanData);

      toast({
        title: "Batch created successfully",
        description: "Your supply chain batch has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Raw submit event fired");
          }}
        >
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
                    <Button type="submit" disabled={isLoading}>
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
