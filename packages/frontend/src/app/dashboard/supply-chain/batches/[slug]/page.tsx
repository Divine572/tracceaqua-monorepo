// "use client";

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ArrowLeft,
//   Edit,
//   QrCode,
//   Share,
//   Download,
//   MapPin,
//   Calendar,
//   User,
//   Building,
//   Fish,
//   Truck,
//   ShieldCheck,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   Eye,
//   ExternalLink,
//   FileText,
//   Thermometer,
//   Star,
// } from "lucide-react";
// import {
//   SupplyChainBatch,
//   SupplyChainStage,
//   ProductType,
//   ProductCategory,
// } from "@/lib/supply-chain-types";
// import {
//   formatDate,
//   formatDateTime,
//   getSupplyChainStageColor,
// } from "@/lib/utils";
// import { QRGenerator } from "@/components/qr-code/QRGenerator";

// // Mock data using the updated types
// const mockBatch: SupplyChainBatch = {
//   id: "1",
//   batchNumber: "TAQ-2024-001",
//   productType: ProductType.WILD_CAPTURE,
//   category: ProductCategory.MOLLUSCS,
//   species: "Crassostrea gigas",
//   commonName: "Pacific Oyster",
//   currentStage: SupplyChainStage.PROCESSING,
//   status: "active",
//   qrCode: "TAQ-2024-001-QR",
//   harvest: {
//     method: "Hand Collection",
//     gearType: "Collection bags",
//     vesselInfo: {
//       name: "Sea Explorer",
//       registration: "LN-2024-001",
//       captain: "John Fisher",
//     },
//     harvestDate: new Date("2024-01-15T08:00:00Z"),
//     location: {
//       name: "Lagos Lagoon Oyster Beds",
//       coordinates: { latitude: 6.5244, longitude: 3.3792 },
//       region: "Lagos State",
//       waterBodyType: "brackish",
//       description: "Sustainable oyster farming area with good water quality",
//     },
//     waterConditions: {
//       temperature: 26.5,
//       salinity: 15.2,
//       pH: 7.2,
//       weather: "Clear skies, calm waters",
//     },
//     permits: [
//       {
//         type: "Fishing License",
//         number: "FL-2024-001",
//         issuer: "Lagos State Ministry of Agriculture",
//         validUntil: new Date("2024-12-31"),
//       },
//     ],
//   },
//   stages: [
//     {
//       stage: SupplyChainStage.HARVEST,
//       timestamp: new Date("2024-01-15T08:00:00Z"),
//       operator: {
//         id: "op1",
//         name: "John Fisher",
//         role: "FISHERMAN",
//         organization: "Ocean Harvest Co.",
//       },
//       details: {
//         totalQuantity: 150,
//         method: "Hand Collection",
//         waterTemperature: 26.5,
//         qualityGrade: "Premium",
//       },
//       documents: [
//         {
//           name: "Harvest Certificate",
//           type: "certificate",
//           hash: "QmXYZ123...",
//           url: "https://ipfs.io/ipfs/QmXYZ123...",
//         },
//       ],
//       qualityMetrics: {
//         appearance: 9,
//         freshness: 9,
//         size: {
//           average: 8.5,
//           range: "7-12 cm",
//           unit: "cm",
//         },
//         weight: {
//           totalKg: 150,
//           averagePerPiece: 0.12,
//         },
//       },
//       verified: true,
//       blockchainTxHash: "0x1234567890abcdef...",
//     },
//     {
//       stage: SupplyChainStage.PROCESSING,
//       timestamp: new Date("2024-01-16T14:00:00Z"),
//       operator: {
//         id: "op2",
//         name: "Lagos Seafood Processing",
//         role: "PROCESSOR",
//         organization: "Seafood Processing Ltd",
//       },
//       details: {
//         facilityName: "Apapa Processing Plant",
//         facilityLicense: "SP-2024-002",
//         processType: "Fresh cleaning and grading",
//         methods: ["sorting", "cleaning", "grading"],
//         temperature: 2,
//         preservation: "Ice-packed",
//         packaging: {
//           material: "Food-grade containers",
//           size: "5kg boxes",
//           labeling: "TracceAqua certified",
//         },
//         haccpCompliance: true,
//       },
//       documents: [
//         {
//           name: "Processing Report",
//           type: "report",
//           hash: "QmABC456...",
//           url: "https://ipfs.io/ipfs/QmABC456...",
//         },
//       ],
//       qualityMetrics: {
//         appearance: 9,
//         freshness: 8,
//         size: {
//           average: 20,
//           range: "",
//           unit: "string",
//         },
//         weight: {
//           totalKg: 138,
//           averagePerPiece: 0.115,
//         },
//       },
//       verified: false,
//     },
//   ],
//   createdBy: "user1",
//   createdAt: new Date("2024-01-15"),
//   updatedAt: new Date("2024-01-16"),
//   tags: ["premium", "export-grade", "sustainable"],
//   notes: "High quality harvest from certified sustainable area",
//   views: 45,
//   ratings: [
//     {
//       rating: 5,
//       comment: "Excellent quality oysters, very fresh!",
//       date: new Date("2024-01-18"),
//       verifiedPurchase: true,
//     },
//     {
//       rating: 4,
//       comment: "Good size and taste",
//       date: new Date("2024-01-17"),
//       verifiedPurchase: true,
//     },
//   ],
// };

// export default function BatchDetails() {
//   const params = useParams();
//   const batchId = params.id as string;

//   const { data: batch = mockBatch, isLoading } = useQuery({
//     queryKey: ["batch", batchId],
//     queryFn: async () => {
//       // TODO: Replace with actual API call
//       return mockBatch;
//     },
//   });

//   const getStageStatus = (stage: SupplyChainStage) => {
//     const stageIndex = Object.values(SupplyChainStage).indexOf(stage);
//     const currentStageIndex = Object.values(SupplyChainStage).indexOf(
//       batch.currentStage
//     );

//     if (stageIndex < currentStageIndex) return "completed";
//     if (stageIndex === currentStageIndex) return "current";
//     return "pending";
//   };

//   const getStageIcon = (status: string) => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case "current":
//         return <Clock className="h-5 w-5 text-blue-600" />;
//       default:
//         return (
//           <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
//         );
//     }
//   };

//   const averageRating =
//     batch.ratings!.reduce((acc, rating) => acc + rating.rating, 0) /
//       (batch.ratings?.length || 1) || 0;

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         Loading batch details...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 container max-w-7xl mx-auto py-8 px-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Link href="/dashboard/supply-chain/batches">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Batches
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-3xl font-bold">{batch.batchNumber}</h1>
//             <p className="text-muted-foreground">
//               {batch.species} • {batch.commonName}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm">
//             <Share className="h-4 w-4 mr-2" />
//             Share
//           </Button>
//           <Button variant="outline" size="sm">
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </Button>
//           <Link href={`/dashboard/supply-chain/batches/${batch.id}/edit`}>
//             <Button variant="outline" size="sm">
//               <Edit className="h-4 w-4 mr-2" />
//               Edit
//             </Button>
//           </Link>
//           <Link href={`/trace/${batch.batchNumber}`}>
//             <Button>
//               <Eye className="h-4 w-4 mr-2" />
//               Public View
//             </Button>
//           </Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Overview Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Fish className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">
//                       Current Stage
//                     </p>
//                     <p className="font-medium capitalize">
//                       {batch.currentStage}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <ShieldCheck className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Status</p>
//                     <p className="font-medium capitalize">{batch.status}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <Eye className="h-5 w-5 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Views</p>
//                     <p className="font-medium">{batch.views || 0}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-yellow-100 rounded-lg">
//                     <Star className="h-5 w-5 text-yellow-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Rating</p>
//                     <p className="font-medium">{averageRating.toFixed(1)}/5</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Supply Chain Timeline */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Supply Chain Timeline</CardTitle>
//               <CardDescription>
//                 Track the journey of this batch through the supply chain
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 {Object.values(SupplyChainStage).map((stage) => {
//                   const status = getStageStatus(stage);
//                   const stageData = batch.stages.find((s) => s.stage === stage);

//                   return (
//                     <div key={stage} className="flex items-start gap-4">
//                       <div className="flex flex-col items-center">
//                         {getStageIcon(status)}
//                         {stage !== SupplyChainStage.SOLD && (
//                           <div
//                             className={`w-px h-8 mt-2 ${
//                               status === "completed"
//                                 ? "bg-green-200"
//                                 : "bg-gray-200"
//                             }`}
//                           />
//                         )}
//                       </div>

//                       <div className="flex-1 pb-6">
//                         <div className="flex items-center justify-between">
//                           <h3
//                             className={`font-medium capitalize ${
//                               status === "current"
//                                 ? "text-blue-600"
//                                 : status === "completed"
//                                   ? "text-green-600"
//                                   : "text-gray-500"
//                             }`}
//                           >
//                             {stage}
//                           </h3>
//                           {stageData && (
//                             <Badge
//                               variant={
//                                 stageData.verified ? "default" : "secondary"
//                               }
//                             >
//                               {stageData.verified
//                                 ? "Verified"
//                                 : "Pending Verification"}
//                             </Badge>
//                           )}
//                         </div>

//                         {stageData ? (
//                           <div className="mt-2 space-y-2">
//                             <div className="text-sm text-muted-foreground">
//                               <div className="flex items-center gap-2">
//                                 <Calendar className="h-4 w-4" />
//                                 {formatDateTime(stageData.timestamp)}
//                               </div>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <User className="h-4 w-4" />
//                                 {stageData.operator.name} (
//                                 {stageData.operator.organization})
//                               </div>
//                               {stageData.blockchainTxHash && (
//                                 <div className="flex items-center gap-2 mt-1">
//                                   <ShieldCheck className="h-4 w-4" />
//                                   Blockchain verified
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ) : (
//                           <p className="text-sm text-muted-foreground mt-2">
//                             {status === "current"
//                               ? "In progress..."
//                               : "Pending"}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Detailed Information Tabs */}
//           <Tabs defaultValue="source" className="w-full">
//             <TabsList>
//               <TabsTrigger value="source">Source Info</TabsTrigger>
//               <TabsTrigger value="stages">Stage Details</TabsTrigger>
//               <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
//               <TabsTrigger value="documents">Documents</TabsTrigger>
//               <TabsTrigger value="ratings">Ratings</TabsTrigger>
//             </TabsList>

//             <TabsContent value="source">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Source Information</CardTitle>
//                   <CardDescription>
//                     {batch.productType === ProductType.WILD_CAPTURE
//                       ? "Harvest details"
//                       : "Farm details"}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {batch.productType === ProductType.WILD_CAPTURE &&
//                     batch.harvest && (
//                       <div className="space-y-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <h4 className="font-medium mb-3">
//                               Harvest Details
//                             </h4>
//                             <div className="space-y-2 text-sm">
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Method:
//                                 </span>{" "}
//                                 {batch.harvest.method}
//                               </div>
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Gear Type:
//                                 </span>{" "}
//                                 {batch.harvest.gearType}
//                               </div>
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Date:
//                                 </span>{" "}
//                                 {formatDateTime(batch.harvest.harvestDate)}
//                               </div>
//                             </div>
//                           </div>

//                           {batch.harvest.vesselInfo && (
//                             <div>
//                               <h4 className="font-medium mb-3">
//                                 Vessel Information
//                               </h4>
//                               <div className="space-y-2 text-sm">
//                                 <div>
//                                   <span className="text-muted-foreground">
//                                     Name:
//                                   </span>{" "}
//                                   {batch.harvest.vesselInfo.name}
//                                 </div>
//                                 <div>
//                                   <span className="text-muted-foreground">
//                                     Registration:
//                                   </span>{" "}
//                                   {batch.harvest.vesselInfo.registration}
//                                 </div>
//                                 <div>
//                                   <span className="text-muted-foreground">
//                                     Captain:
//                                   </span>{" "}
//                                   {batch.harvest.vesselInfo.captain}
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                         </div>

//                         <div>
//                           <h4 className="font-medium mb-3">Location</h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="space-y-2 text-sm">
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Name:
//                                 </span>{" "}
//                                 {batch.harvest.location.name}
//                               </div>
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Region:
//                                 </span>{" "}
//                                 {batch.harvest.location.region}
//                               </div>
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Water Body:
//                                 </span>{" "}
//                                 {batch.harvest.location.waterBodyType}
//                               </div>
//                             </div>
//                             <div className="space-y-2 text-sm">
//                               <div>
//                                 <span className="text-muted-foreground">
//                                   Coordinates:
//                                 </span>{" "}
//                                 {batch.harvest.location.coordinates.latitude.toFixed(
//                                   4
//                                 )}
//                                 ,{" "}
//                                 {batch.harvest.location.coordinates.longitude.toFixed(
//                                   4
//                                 )}
//                               </div>
//                               {batch.harvest.location.description && (
//                                 <div>
//                                   <span className="text-muted-foreground">
//                                     Description:
//                                   </span>{" "}
//                                   {batch.harvest.location.description}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {batch.harvest.waterConditions && (
//                           <div>
//                             <h4 className="font-medium mb-3">
//                               Water Conditions
//                             </h4>
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                               {Object.entries(
//                                 batch.harvest.waterConditions
//                               ).map(([key, value]) => (
//                                 <div
//                                   key={key}
//                                   className="text-center p-3 bg-gray-50 rounded-lg"
//                                 >
//                                   <div className="text-lg font-bold">
//                                     {value}
//                                   </div>
//                                   <div className="text-sm text-muted-foreground capitalize">
//                                     {key}
//                                     {key === "temperature" && " °C"}
//                                     {key === "salinity" && " ppt"}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         {batch.harvest.permits &&
//                           batch.harvest.permits.length > 0 && (
//                             <div>
//                               <h4 className="font-medium mb-3">
//                                 Permits & Licenses
//                               </h4>
//                               <div className="space-y-2">
//                                 {batch.harvest.permits.map((permit, index) => (
//                                   <div
//                                     key={index}
//                                     className="p-3 border rounded-lg"
//                                   >
//                                     <div className="flex justify-between items-start">
//                                       <div>
//                                         <div className="font-medium">
//                                           {permit.type}
//                                         </div>
//                                         <div className="text-sm text-muted-foreground">
//                                           {permit.number}
//                                         </div>
//                                         <div className="text-sm text-muted-foreground">
//                                           Issued by: {permit.issuer}
//                                         </div>
//                                       </div>
//                                       <Badge
//                                         variant={
//                                           new Date(permit.validUntil) >
//                                           new Date()
//                                             ? "default"
//                                             : "destructive"
//                                         }
//                                       >
//                                         Valid until{" "}
//                                         {formatDate(permit.validUntil)}
//                                       </Badge>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                       </div>
//                     )}

//                   {batch.productType === ProductType.FARMED && batch.farm && (
//                     <div className="space-y-6">
//                       {/* Farm details would go here */}
//                       <p className="text-muted-foreground">
//                         Farm information not available for this batch.
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="stages" className="space-y-4">
//               {batch.stages.map((stage, index) => (
//                 <Card key={index}>
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="text-lg capitalize">
//                         {stage.stage} Stage
//                       </CardTitle>
//                       <Badge variant={stage.verified ? "default" : "secondary"}>
//                         {stage.verified ? "Verified" : "Pending Verification"}
//                       </Badge>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-medium mb-3">
//                           Operator Information
//                         </h4>
//                         <div className="space-y-2 text-sm">
//                           <div>
//                             <span className="text-muted-foreground">Name:</span>{" "}
//                             {stage.operator.name}
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">
//                               Organization:
//                             </span>{" "}
//                             {stage.operator.organization}
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">Role:</span>{" "}
//                             {stage.operator.role}
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">
//                               Timestamp:
//                             </span>{" "}
//                             {formatDateTime(stage.timestamp)}
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="font-medium mb-3">Stage Details</h4>
//                         <div className="space-y-2 text-sm">
//                           {Object.entries(stage.details).map(([key, value]) => (
//                             <div key={key}>
//                               <span className="text-muted-foreground capitalize">
//                                 {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
//                               </span>{" "}
//                               {typeof value === "object"
//                                 ? JSON.stringify(value)
//                                 : String(value)}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </TabsContent>

//             <TabsContent value="quality" className="space-y-4">
//               {batch.stages
//                 .filter((stage) => stage.qualityMetrics)
//                 .map((stage, index) => (
//                   <Card key={index}>
//                     <CardHeader>
//                       <CardTitle className="text-lg capitalize">
//                         {stage.stage} Quality Metrics
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div className="text-center p-3 bg-gray-50 rounded-lg">
//                           <div className="text-2xl font-bold">
//                             {stage.qualityMetrics?.appearance}
//                           </div>
//                           <div className="text-sm text-muted-foreground">
//                             Appearance /10
//                           </div>
//                         </div>
//                         <div className="text-center p-3 bg-gray-50 rounded-lg">
//                           <div className="text-2xl font-bold">
//                             {stage.qualityMetrics?.freshness}
//                           </div>
//                           <div className="text-sm text-muted-foreground">
//                             Freshness /10
//                           </div>
//                         </div>
//                         <div className="text-center p-3 bg-gray-50 rounded-lg">
//                           <div className="text-2xl font-bold">
//                             {stage.qualityMetrics?.weight.totalKg}
//                           </div>
//                           <div className="text-sm text-muted-foreground">
//                             Total Weight (kg)
//                           </div>
//                         </div>
//                         <div className="text-center p-3 bg-gray-50 rounded-lg">
//                           <div className="text-2xl font-bold">
//                             {stage.qualityMetrics?.size?.average}
//                           </div>
//                           <div className="text-sm text-muted-foreground">
//                             Avg Size ({stage.qualityMetrics?.size?.unit})
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//             </TabsContent>

//             <TabsContent value="documents">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Documents & Certificates</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {batch.stages.flatMap((stage) =>
//                       stage.documents.map((doc, index) => (
//                         <div
//                           key={`${stage.stage}-${index}`}
//                           className="flex items-center justify-between p-3 border rounded-lg"
//                         >
//                           <div className="flex items-center gap-3">
//                             <FileText className="h-5 w-5 text-gray-500" />
//                             <div>
//                               <div className="font-medium">{doc.name}</div>
//                               <div className="text-sm text-muted-foreground">
//                                 {stage.stage} stage • {doc.type} • IPFS:{" "}
//                                 {doc.hash.slice(0, 20)}...
//                               </div>
//                             </div>
//                           </div>
//                           <Button variant="outline" size="sm" asChild>
//                             <a
//                               href={doc.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               <ExternalLink className="h-4 w-4 mr-2" />
//                               View
//                             </a>
//                           </Button>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="ratings">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Customer Ratings & Reviews</CardTitle>
//                   <CardDescription>
//                     Average rating: {averageRating.toFixed(1)}/5 (
//                     {batch.ratings?.length || 0} reviews)
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {batch.ratings?.map((rating, index) => (
//                       <div key={index} className="p-4 border rounded-lg">
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center gap-2">
//                             <div className="flex">
//                               {[...Array(5)].map((_, i) => (
//                                 <Star
//                                   key={i}
//                                   className={`h-4 w-4 ${
//                                     i < rating.rating
//                                       ? "text-yellow-400 fill-current"
//                                       : "text-gray-300"
//                                   }`}
//                                 />
//                               ))}
//                             </div>
//                             {rating.verifiedPurchase && (
//                               <Badge variant="outline" className="text-xs">
//                                 Verified Purchase
//                               </Badge>
//                             )}
//                           </div>
//                           <span className="text-sm text-muted-foreground">
//                             {formatDate(rating.date)}
//                           </span>
//                         </div>
//                         {rating.comment && (
//                           <p className="text-sm text-gray-600">
//                             {rating.comment}
//                           </p>
//                         )}
//                       </div>
//                     )) || (
//                       <p className="text-muted-foreground">No ratings yet.</p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Basic Info */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Batch Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <h4 className="font-medium">Product Type</h4>
//                 <Badge variant="outline" className="mt-1 capitalize">
//                   {batch.productType.replace("-", " ")}
//                 </Badge>
//               </div>

//               <div>
//                 <h4 className="font-medium">Category</h4>
//                 <p className="text-sm text-muted-foreground capitalize">
//                   {batch.category}
//                 </p>
//               </div>

//               <div>
//                 <h4 className="font-medium">Status</h4>
//                 <Badge
//                   className={`mt-1 capitalize ${
//                     batch.status === "active"
//                       ? "bg-green-100 text-green-800"
//                       : "bg-gray-100 text-gray-800"
//                   }`}
//                 >
//                   {batch.status}
//                 </Badge>
//               </div>

//               <Separator />

//               <div>
//                 <h4 className="font-medium">Created</h4>
//                 <p className="text-sm text-muted-foreground">
//                   {formatDate(batch.createdAt)}
//                 </p>
//               </div>

//               <div>
//                 <h4 className="font-medium">Last Updated</h4>
//                 <p className="text-sm text-muted-foreground">
//                   {formatDate(batch.updatedAt)}
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* QR Code */}
//           <Card>
//             <CardHeader>
//               <CardTitle>QR Code</CardTitle>
//               <CardDescription>
//                 Scan to view public trace information
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="text-center">
//               <QRGenerator productId={batch.batchNumber} />
//               <Button variant="outline" size="sm" className="mt-4 w-full">
//                 <Download className="h-4 w-4 mr-2" />
//                 Download QR Code
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Tags */}
//           {batch.tags && batch.tags.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Tags</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-wrap gap-2">
//                   {batch.tags.map((tag, index) => (
//                     <Badge key={index} variant="secondary">
//                       {tag}
//                     </Badge>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Notes */}
//           {batch.notes && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notes</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm text-gray-600">{batch.notes}</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

const Batches = () => {
  return (
    <div>jkjhkjkh</div>
  )
}

export default Batches