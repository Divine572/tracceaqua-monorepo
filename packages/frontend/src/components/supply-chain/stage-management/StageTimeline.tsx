// "use client";

// import { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Check,
//   Clock,
//   ArrowRight,
//   MapPin,
//   Calendar,
//   User,
//   Building,
//   Truck,
//   Factory,
//   Store,
//   Fish,
//   Plus,
//   FileText,
//   Star,
//   AlertTriangle,
// } from "lucide-react";
// import { SupplyChainBatch, SupplyChainStage } from "@/lib/supply-chain-types";
// import { formatDate } from "@/lib/utils";
// import { StageUpdateForm } from "./stage-update-form";

// interface StageTimelineProps {
//   batch: SupplyChainBatch;
//   onStageUpdate?: (stage: any) => void;
// }

// export function StageTimeline({ batch, onStageUpdate }: StageTimelineProps) {
//   const [showUpdateDialog, setShowUpdateDialog] = useState(false);

//   const getStageIcon = (stage: SupplyChainStage) => {
//     switch (stage) {
//       case SupplyChainStage.HARVEST:
//         return Fish;
//       case SupplyChainStage.PROCESSING:
//         return Factory;
//       case SupplyChainStage.TRANSPORT:
//         return Truck;
//       case SupplyChainStage.RETAIL:
//         return Store;
//       case SupplyChainStage.SOLD:
//         return Check;
//       default:
//         return Clock;
//     }
//   };

//   const getStageColor = (
//     stage: SupplyChainStage,
//     isCompleted: boolean,
//     isCurrent: boolean
//   ) => {
//     if (isCompleted) return "bg-green-500";
//     if (isCurrent) return "bg-blue-500";
//     return "bg-gray-300";
//   };

//   const allStages = Object.values(SupplyChainStage);
//   const currentStageIndex = allStages.indexOf(batch.currentStage);
//   const nextStage =
//     currentStageIndex < allStages.length - 1
//       ? allStages[currentStageIndex + 1]
//       : null;

//   return (
//     <div className="space-y-6">
//       {/* Current Status */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Batch Status</CardTitle>
//               <CardDescription>
//                 Batch {batch.batchNumber} - {batch.species}
//               </CardDescription>
//             </div>
//             <div className="text-right">
//               <Badge className="mb-2">
//                 {batch.currentStage.charAt(0).toUpperCase() +
//                   batch.currentStage.slice(1)}
//               </Badge>
//               <p className="text-sm text-muted-foreground">
//                 Last updated {formatDate(batch.updatedAt)}
//               </p>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="flex space-x-1">
//                 {allStages.map((stage, index) => {
//                   const isCompleted = index < currentStageIndex;
//                   const isCurrent = index === currentStageIndex;
//                   return (
//                     <div
//                       key={stage}
//                       className={`h-2 w-8 rounded ${getStageColor(stage, isCompleted, isCurrent)}`}
//                     />
//                   );
//                 })}
//               </div>
//               <span className="text-sm text-muted-foreground">
//                 Stage {currentStageIndex + 1} of {allStages.length}
//               </span>
//             </div>

//             {nextStage && (
//               <Dialog
//                 open={showUpdateDialog}
//                 onOpenChange={setShowUpdateDialog}
//               >
//                 <DialogTrigger asChild>
//                   <Button>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Update to{" "}
//                     {nextStage.charAt(0).toUpperCase() + nextStage.slice(1)}
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-2xl">
//                   <DialogHeader>
//                     <DialogTitle>Update Batch Stage</DialogTitle>
//                     <DialogDescription>
//                       Update batch {batch.batchNumber} to {nextStage} stage
//                     </DialogDescription>
//                   </DialogHeader>
//                   <StageUpdateForm
//                     batch={batch}
//                     targetStage={nextStage}
//                     onUpdate={(data) => {
//                       onStageUpdate?.(data);
//                       setShowUpdateDialog(false);
//                     }}
//                   />
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stage History */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Stage History</CardTitle>
//           <CardDescription>
//             Complete journey of this batch through the supply chain
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="relative">
//             {/* Timeline Line */}
//             <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

//             <div className="space-y-6">
//               {batch.stages.map((stage, index) => {
//                 const StageIcon = getStageIcon(stage.stage);
//                 const isLast = index === batch.stages.length - 1;

//                 return (
//                   <div key={index} className="relative">
//                     {/* Timeline Node */}
//                     <div className="absolute left-4 w-4 h-4 rounded-full border-2 border-background bg-green-500" />

//                     {/* Stage Card */}
//                     <div className="ml-12">
//                       <Card>
//                         <CardHeader className="pb-3">
//                           <div className="flex items-start justify-between">
//                             <div className="flex items-center space-x-3">
//                               <div className="p-2 rounded-lg bg-primary/10">
//                                 <StageIcon className="h-5 w-5 text-primary" />
//                               </div>
//                               <div>
//                                 <CardTitle className="text-lg capitalize">
//                                   {stage.stage.replace("-", " ")}
//                                 </CardTitle>
//                                 <CardDescription className="flex items-center space-x-4 mt-1">
//                                   <span className="flex items-center space-x-1">
//                                     <Building className="h-3 w-3" />
//                                     <span>{stage.operator.organization}</span>
//                                   </span>
//                                   <span className="flex items-center space-x-1">
//                                     <Calendar className="h-3 w-3" />
//                                     <span>{formatDate(stage.timestamp)}</span>
//                                   </span>
//                                 </CardDescription>
//                               </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               {stage.verified ? (
//                                 <Badge className="bg-green-100 text-green-800">
//                                   <Check className="h-3 w-3 mr-1" />
//                                   Verified
//                                 </Badge>
//                               ) : (
//                                 <Badge variant="outline">
//                                   <Clock className="h-3 w-3 mr-1" />
//                                   Pending
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </CardHeader>

//                         <CardContent className="pt-0">
//                           {/* Operator Info */}
//                           <div className="flex items-center space-x-3 mb-4">
//                             <Avatar className="h-8 w-8">
//                               <AvatarFallback>
//                                 {stage.operator.name
//                                   .split(" ")
//                                   .map((n) => n[0])
//                                   .join("")}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <p className="text-sm font-medium">
//                                 {stage.operator.name}
//                               </p>
//                               <p className="text-xs text-muted-foreground">
//                                 {stage.operator.role}
//                               </p>
//                             </div>
//                           </div>

//                           {/* Quality Metrics */}
//                           {stage.qualityMetrics && (
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                               <div>
//                                 <p className="text-sm font-medium">Weight</p>
//                                 <p className="text-sm text-muted-foreground">
//                                   {stage.qualityMetrics.weight?.totalKg}kg
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium">
//                                   Appearance
//                                 </p>
//                                 <div className="flex items-center space-x-1">
//                                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                                   <span className="text-sm text-muted-foreground">
//                                     {stage.qualityMetrics.appearance}/10
//                                   </span>
//                                 </div>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium">Freshness</p>
//                                 <div className="flex items-center space-x-1">
//                                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                                   <span className="text-sm text-muted-foreground">
//                                     {stage.qualityMetrics.freshness}/10
//                                   </span>
//                                 </div>
//                               </div>
//                               {stage.qualityMetrics.defects &&
//                                 stage.qualityMetrics.defects.length > 0 && (
//                                   <div>
//                                     <p className="text-sm font-medium text-red-600">
//                                       Defects
//                                     </p>
//                                     <div className="flex items-center space-x-1">
//                                       <AlertTriangle className="h-3 w-3 text-red-600" />
//                                       <span className="text-sm text-red-600">
//                                         {stage.qualityMetrics.defects.length}{" "}
//                                         noted
//                                       </span>
//                                     </div>
//                                   </div>
//                                 )}
//                             </div>
//                           )}

//                           {/* Documents */}
//                           {stage.documents && stage.documents.length > 0 && (
//                             <div className="space-y-2">
//                               <p className="text-sm font-medium">Documents</p>
//                               <div className="flex flex-wrap gap-2">
//                                 {stage.documents.map((doc, idx) => (
//                                   <Button
//                                     key={idx}
//                                     variant="outline"
//                                     size="sm"
//                                     className="h-auto p-2"
//                                   >
//                                     <FileText className="h-3 w-3 mr-2" />
//                                     <div className="text-left">
//                                       <p className="text-xs font-medium">
//                                         {doc.name}
//                                       </p>
//                                     </div>
//                                   </Button>
//                                 ))}
//                               </div>
//                             </div>
//                           )}

//                           {/* Blockchain Transaction */}
//                           {stage.blockchainTxHash && (
//                             <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                               <p className="text-sm font-medium text-blue-900">
//                                 Blockchain Record
//                               </p>
//                               <p className="text-xs text-blue-700 font-mono">
//                                 {stage.blockchainTxHash}
//                               </p>
//                             </div>
//                           )}
//                         </CardContent>
//                       </Card>
//                     </div>

//                     {/* Next Stage Arrow */}
//                     {!isLast && (
//                       <div className="flex items-center justify-center my-4 ml-12">
//                         <ArrowRight className="h-5 w-5 text-muted-foreground" />
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

const StageTimeline = () => {
  return (
    <div>Stage timeline</div>
  )
}
