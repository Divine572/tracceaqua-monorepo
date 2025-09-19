import { SupplyChainRecord } from "@/lib/supply-chain-types";
import { Fish, Factory, Building, Truck, Package, CheckCircle, Activity } from "lucide-react";

export const getStageIcon = (stage: string) => {
  switch (stage) {
    case "HARVEST":
      return Fish;
    case "PROCESSING":
      return Factory;
    case "STORAGE":
      return Building;
    case "TRANSPORT":
      return Truck;
    case "RETAIL":
      return Package;
    case "SOLD":
      return CheckCircle;
    default:
      return Activity;
  }
};

export const getStageColor = (
  stage: string,
  isCompleted = false,
  isCurrent = false
) => {
  if (isCurrent) return "text-blue-600 bg-blue-50";
  if (isCompleted) return "text-green-600 bg-green-50";
  return "text-gray-400 bg-gray-50";
};

// export const getCompletedStages = () => {
    
//   };

export const getStageStatus = (stageName: string, batch?: SupplyChainRecord) => {
    if (!batch) return;

    const completedStages =  batch.stageHistory?.map((stage) => stage.stage) || [];
    // const completedStages = getCompletedStages();
    const isCompleted = completedStages!.includes(stageName);
    const isCurrent = batch!.currentStage === stageName;

    if (isCompleted) return "completed";
    if (isCurrent) return "current";
    return "pending";
  };