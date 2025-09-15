"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  MapPin,
  Fish,
  Waves,
  Beaker,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { SiteInfoStep } from "./SiteInfoStep";
import { SpeciesDataStep } from "./SpeciesDataStep";
import { SamplingMethodStep } from "./SamplingMethodStep";
import { LabTestsStep } from "./LabTestsStep";
import { NotesStep } from "./NotesStep";
import { SamplingRecord } from "@/lib/conservation-types";
import { cn } from "@/lib/utils";
import { samplingSchema } from "@/zod/schemas/sampling-schema";

type SamplingFormData = z.infer<typeof samplingSchema>;

const steps = [
  {
    id: 1,
    title: "Location & Environment",
    description: "Site location and environmental parameters",
    icon: MapPin,
    fields: ["samplingId", "locationData"],
  },
  {
    id: 2,
    title: "Species Information",
    description: "Species identification and biological data",
    icon: Fish,
    fields: ["speciesData"],
  },
  {
    id: 3,
    title: "Sampling Methods",
    description: "Sampling methodology and conditions",
    icon: Waves,
    fields: ["samplingData"],
  },
  {
    id: 4,
    title: "Lab Tests",
    description: "Laboratory analysis requirements",
    icon: Beaker,
    fields: ["labTests"],
  },
  {
    id: 5,
    title: "Notes & Files",
    description: "Additional notes and file attachments",
    icon: FileText,
    fields: ["researcherNotes", "fileHashes"],
  },
];

interface MultiStepSamplingFormProps {
  existingRecord?: Partial<SamplingRecord>;
  // onSave?: (data: SamplingFormData) => void;
  // onSubmit?: (data: SamplingFormData) => void;
}

export function MultiStepSamplingForm({
  existingRecord,
  // onSave,
  // onSubmit,
}: MultiStepSamplingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const onSave = (data: any) => {
    // TODO: Implement save as draft API call
    console.log("Saving draft:", data);
  };

  const onSubmit = async (data: any) => {
    // TODO: Implement submit API call
    // console.log("Submitting record:", data);
    //   const response = await fetch("/api/conservation/new-record", {
    //     method: "POST",
    //     body: JSON.stringify(data),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    //   if(!response.ok) {
    //     throw new Error("Failed to submit record, please try again")
    //   }
    //   const result = await response.json()
    //   console.log(result)
    //   toast.success("Your sampling record has been successfully submitted.");
  };

  const methods = useForm<SamplingFormData>({
    resolver: zodResolver(samplingSchema) as any,
    defaultValues: existingRecord || {
      samplingId: `SAMP_${uuidv4()}`,
      locationData: {
        latitude: 6.5244,
        longitude: 3.3792, // Lagos default
        waterBody: "",
        locationDescription: "",
        waterDepth: 0,
        waterTemperature: 25,
        salinity: 35,
        phLevel: 8.1,
        dissolvedOxygen: 6.5,
      },
      speciesData: {
        scientificName: "",
        commonName: "",
        family: "",
        totalCount: 1,
        sampleSize: 1,
        averageLength: 0,
        averageWeight: 0,
        maturityStage: "unknown",
        healthStatus: "healthy",
      },
      samplingData: {
        samplingMethod: "",
        gearSpecs: "",
        samplingDuration: 60, // minutes
        effortHours: 1.0,
        weatherConditions: "",
        seaState: "",
        tidalConditions: "",
      },
      labTests: [],
      fileHashes: [],
      researcherNotes: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    formState: { isValid },
  } = methods;

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
      toast.success("Your sampling record has been saved as a draft.");
    } catch (error) {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = async (data: SamplingFormData) => {
    setIsLoading(true);
    try {
      console.log("Submitting record:", data);

      const response = await fetch("/api/conservation/new-record", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to submit record, please try again");
      }

      const result = await response.json();
      console.log(result);
      toast.success("Your sampling record has been successfully submitted.");
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SiteInfoStep />;
      case 2:
        return <SpeciesDataStep />;
      case 3:
        return <SamplingMethodStep />;
      case 4:
        return <LabTestsStep />;
      case 5:
        return <NotesStep />;
      default:
        return <SiteInfoStep />;
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const canNavigateToStep = (stepId: number) => {
    // Allow navigation to completed steps or the current step
    return stepId <= currentStep;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Marine Conservation Sampling Record</CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}:{" "}
                {steps[currentStep - 1].title}
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
          <div className="flex items-center justify-between mt-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const canNavigate = canNavigateToStep(step.id);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center space-y-2",
                    canNavigate ? "cursor-pointer" : "cursor-not-allowed",
                    isActive && "text-primary",
                    isCompleted && "text-green-600"
                  )}
                  onClick={() => canNavigate && setCurrentStep(step.id)}
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
                  <span className="text-xs text-center hidden sm:block max-w-20">
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
                      onClick={handleSubmit(onFormSubmit)}
                      disabled={isLoading || !isValid}
                    >
                      {isLoading ? "Submitting..." : "Submit Record"}
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
