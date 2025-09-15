"use client";

import { useState } from "react";
import { useRouter } from "next/router";
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


const BatchCreationWizard2 = () => {
    return (
        <div>
            <p>Debuging</p>
        </div>
    )
}

export default BatchCreationWizard2