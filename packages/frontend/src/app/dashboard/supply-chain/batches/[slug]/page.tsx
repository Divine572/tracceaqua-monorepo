// "use client";

// import React, { useState } from "react";
// // import { QRCodeSVG } from 'qr-code';
// import {
//   ArrowLeft,
//   Edit,
//   Share2,
//   Download,
//   MapPin,
//   Calendar,
//   User,
//   Building,
//   Fish,
//   Truck,
//   ShieldCheck,
//   CheckCircle,
//   Clock,
//   Eye,
//   EyeOff,
//   ExternalLink,
//   FileText,
//   Thermometer,
//   Star,
//   Package,
//   Factory,
//   Anchor,
//   Database,
//   Activity,
//   TrendingUp,
//   Globe,
//   AlertCircle,
//   BarChart3,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import OverviewCards from "@/components/supply-chain/batch-creation/view/OverviewCards";


// type SupplyStage = "HARVEST" | "PROCESSING" | "STORAGE" | "TRANSPORT" | "RETAIL" | "SOLD"

// // Mock data based on your API structure
// const mockBatchData = {
//   id: "batch_001",
//   productId: "BAC_2024_001",
//   userId: "user_123",
//   batchId: "BATCH_20240115_001",
//   sourceType: "WILD_CAPTURE",
//   speciesName: "Crassostrea gigas",
//   productName: "Fresh Pacific Oysters",
//   productDescription:
//     "Premium quality Pacific oysters harvested from sustainable beds in Lagos Lagoon",
//   currentStage: "PROCESSING",
//   status: "ACTIVE",
//   isPublic: true,
//   location: "Lagos, Nigeria",
//   notes:
//     "High quality harvest from certified sustainable area with excellent water conditions",
//   hatcheryData: null,
//   growOutData: null,
//   fishingData: {
//     fishingMethod: "Hand Collection",
//     coordinates: {
//       latitude: 6.5244,
//       longitude: 3.3792,
//     },
//     waterDepth: 12,
//     vesselDetails: {
//       name: "Sea Explorer",
//       registration: "LN-2024-001",
//       captain: "John Fisher",
//     },
//     catchComposition: [
//       {
//         species: "Crassostrea gigas",
//         quantity: 150,
//         averageSize: 8.5,
//       },
//     ],
//     seaConditions: "Clear skies, calm waters, optimal conditions",
//   },
//   harvestData: {
//     harvestMethod: "Manual collection with sustainable practices",
//     harvestLocation: "Lagos Lagoon Oyster Beds - Zone A",
//     totalWeight: 150,
//     pieceCount: 1250,
//     averageSize: 8.5,
//     qualityGrade: "Premium",
//     postHarvestHandling:
//       "Immediate ice packing and transport to processing facility",
//   },
//   processingData: {
//     facilityName: "Lagos Seafood Processing Ltd",
//     processingMethod: "Fresh cleaning, grading, and packaging",
//     processingDate: "2024-01-16T10:00:00Z",
//     inputWeight: 150,
//     outputWeight: 138,
//     processingYield: 92,
//     qualityTests: [
//       {
//         testType: "Microbiological",
//         result: "Negative for harmful bacteria",
//         standard: "HACCP",
//         passed: true,
//       },
//       {
//         testType: "Heavy metals",
//         result: "Within acceptable limits",
//         standard: "EU Standards",
//         passed: true,
//       },
//     ],
//     packaging: {
//       type: "Vacuum sealed",
//       size: "5kg boxes",
//       material: "Food-grade containers",
//       labelInfo: "TracceAqua certified, batch tracked",
//     },
//   },
//   storageData: {
//     storageFacility: "Cold Storage Warehouse A",
//     storageTemperature: -2,
//     storageMethod: "Refrigerated storage",
//     storageDuration: 5,
//     humidityLevel: 85,
//     qualityChecks: [
//       {
//         checkDate: "2024-01-17T08:00:00Z",
//         temperature: -2,
//         quality: "Excellent",
//         notes: "Product maintaining optimal freshness",
//       },
//     ],
//   },
//   transportData: {
//     transportMethod: "Refrigerated truck",
//     vehicleDetails: {
//       type: "Refrigerated truck",
//       registration: "ABC-123-DE",
//       driver: "Mohammed Ali",
//     },
//     originLocation: "Lagos Processing Plant",
//     destinationLocation: "Abuja Distribution Center",
//     transportTemperature: -2,
//     transportDuration: 8,
//     coldChainMonitoring: [
//       {
//         timestamp: "2024-01-18T06:00:00Z",
//         temperature: -2,
//         location: "Departure - Lagos",
//       },
//       {
//         timestamp: "2024-01-18T10:00:00Z",
//         temperature: -1.8,
//         location: "Highway checkpoint - Ogun State",
//       },
//     ],
//   },
//   fileHashes: ["QmXYZ123abc...", "QmABC456def..."],
//   dataHash: "0xabcdef1234567890...",
//   blockchainHash: "0x1234567890abcdef1234567890abcdef12345678",
//   createdAt: "2024-01-15T08:00:00Z",
//   updatedAt: "2024-01-18T14:30:00Z",
//   user: {
//     id: "user_123",
//     name: "John Fisher",
//     email: "john.fisher@example.com",
//     role: "FISHERMAN",
//   },
//   stageHistory: [
//     {
//       id: "stage_001",
//       stage: "HARVEST",
//       userId: "user_123",
//       timestamp: "2024-01-15T08:00:00Z",
//       data: {
//         method: "Hand Collection",
//         location: "Lagos Lagoon",
//         weather: "Clear, calm",
//       },
//       location: "Lagos Lagoon Oyster Beds",
//       notes: "Sustainable harvest using traditional methods",
//       fileHashes: ["QmXYZ123abc..."],
//       blockchainHash: "0x1234567890abcdef...",
//       user: {
//         name: "John Fisher",
//         role: "FISHERMAN",
//       },
//     },
//     {
//       id: "stage_002",
//       stage: "PROCESSING",
//       userId: "user_456",
//       timestamp: "2024-01-16T10:00:00Z",
//       data: {
//         facility: "Lagos Seafood Processing Ltd",
//         method: "Fresh cleaning and grading",
//         yield: 92,
//       },
//       location: "Apapa Processing Plant",
//       notes: "HACCP compliant processing with quality testing",
//       fileHashes: ["QmABC456def..."],
//       blockchainHash: "0x2345678901bcdef0...",
//       user: {
//         name: "Lagos Seafood Processing",
//         role: "PROCESSOR",
//       },
//     },
//     {
//       id: "stage_003",
//       stage: "STORAGE",
//       userId: "user_789",
//       timestamp: "2024-01-17T14:00:00Z",
//       data: {
//         facility: "Cold Storage Warehouse A",
//         temperature: -2,
//         duration: 5,
//       },
//       location: "Lagos Cold Storage Facility",
//       notes: "Optimal storage conditions maintained",
//       fileHashes: [],
//       blockchainHash: "0x3456789012cdef01...",
//       user: {
//         name: "Cold Storage Co.",
//         role: "STORAGE_MANAGER",
//       },
//     },
//   ],
//   feedbackCount: 12,
//   averageRating: 4.7,
// };

// // Utility functions
// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// const formatDateTime = (dateString: string) => {
//   return new Date(dateString).toLocaleString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const getStageIcon = (
//   stage: SupplyStage
// ) => {
//   switch (stage) {
//     case "HARVEST":
//       return Fish;
//     case "PROCESSING":
//       return Factory;
//     case "STORAGE":
//       return Building;
//     case "TRANSPORT":
//       return Truck;
//     case "RETAIL":
//       return Package;
//     case "SOLD":
//       return CheckCircle;
//     default:
//       return Activity;
//   }
// };

// const getStageColor = (stage: SupplyStage, isCompleted = false, isCurrent = false) => {
//   if (isCurrent) return "text-blue-600 bg-blue-50";
//   if (isCompleted) return "text-green-600 bg-green-50";
//   return "text-gray-400 bg-gray-50";
// };

// const Separator = ({ className = "" }) => (
//   <hr className={`border-gray-200 ${className}`} />
// );

// // Main Component
// const BatchDetailsPage = () => {
//   // Mock params - replace with actual routing in real implementation
//   const batchId = "batch_001";

//   // Mock loading state - replace with actual API call
//   const [isLoading, setIsLoading] = useState(false);
//   const batch = mockBatchData;

//   const getCompletedStages = () => {
//     return batch.stageHistory?.map((stage) => stage.stage) || [];
//   };

//   const getStageStatus = (stageName: string) => {
//     const completedStages = getCompletedStages();
//     const isCompleted = completedStages.includes(stageName);
//     const isCurrent = batch.currentStage === stageName;

//     if (isCompleted) return "completed";
//     if (isCurrent) return "current";
//     return "pending";
//   };

//   const renderStageData = (stageData, stageType) => {
//     if (!stageData) return null;

//     const renderObjectData = (obj, title) => (
//       <div className="mb-4">
//         <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {Object.entries(obj).map(([key, value]) => (
//             <div key={key} className="text-sm">
//               <span className="text-gray-600 capitalize">
//                 {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
//               </span>
//               <span className="ml-2 text-gray-900">
//                 {typeof value === "object"
//                   ? JSON.stringify(value)
//                   : String(value)}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );

//     return (
//       <div className="space-y-4">
//         {Object.entries(stageData).map(([key, value]) => {
//           if (
//             typeof value === "object" &&
//             value !== null &&
//             !Array.isArray(value)
//           ) {
//             return renderObjectData(value, key.replace(/([A-Z])/g, " $1"));
//           } else if (Array.isArray(value)) {
//             return (
//               <div key={key} className="mb-4">
//                 <h4 className="font-medium text-gray-900 mb-2 capitalize">
//                   {key.replace(/([A-Z])/g, " $1")}
//                 </h4>
//                 {value.map((item, index) => (
//                   <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
//                     {typeof item === "object" ? (
//                       Object.entries(item).map(([itemKey, itemValue]) => (
//                         <div key={itemKey} className="text-sm">
//                           <span className="text-gray-600 capitalize">
//                             {itemKey.replace(/([A-Z])/g, " $1").toLowerCase()}:
//                           </span>
//                           <span className="ml-2 text-gray-900">
//                             {String(itemValue)}
//                           </span>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-sm text-gray-900">
//                         {String(item)}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             );
//           } else {
//             return (
//               <div key={key} className="text-sm">
//                 <span className="text-gray-600 capitalize">
//                   {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
//                 </span>
//                 <span className="ml-2 text-gray-900">{String(value)}</span>
//               </div>
//             );
//           }
//         })}
//       </div>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-3 text-gray-600">Loading batch details...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
//           <div className="flex items-center gap-4 mb-4 sm:mb-0">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Batches
//             </Button>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 {batch.productId}
//               </h1>
//               <p className="text-gray-600">
//                 {batch.speciesName} • {batch.productName}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm">
//               <Share2 className="h-4 w-4 mr-2" />
//               Share
//             </Button>
//             <Button variant="outline" size="sm">
//               <Download className="h-4 w-4 mr-2" />
//               Export
//             </Button>
//             <Button variant="outline" size="sm">
//               <Edit className="h-4 w-4 mr-2" />
//               Edit
//             </Button>
//             <Button>
//               <Eye className="h-4 w-4 mr-2" />
//               Public View
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Overview Cards */}
//             <OverviewCards batch={batch} />

//             {/* Supply Chain Timeline */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Supply Chain Journey</CardTitle>
//                 <CardDescription>
//                   Track the journey of this batch through the supply chain
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-6">
//                   {[
//                     "HARVEST",
//                     "PROCESSING",
//                     "STORAGE",
//                     "TRANSPORT",
//                     "RETAIL",
//                     "SOLD",
//                   ].map((stageName, index) => {
//                     const status = getStageStatus(stageName);
//                     const StageIcon = getStageIcon(stageName);
//                     const stageHistory = batch.stageHistory?.find(
//                       (stage) => stage.stage === stageName
//                     );

//                     return (
//                       <div key={stageName} className="flex items-start gap-4">
//                         <div className="flex flex-col items-center">
//                           <div
//                             className={`p-2 rounded-full ${getStageColor(stageName, status === "completed", status === "current")}`}
//                           >
//                             <StageIcon className="h-5 w-5" />
//                           </div>
//                           {index < 5 && (
//                             <div
//                               className={`w-px h-8 mt-2 ${
//                                 status === "completed"
//                                   ? "bg-green-200"
//                                   : "bg-gray-200"
//                               }`}
//                             />
//                           )}
//                         </div>

//                         <div className="flex-1 pb-6">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3
//                               className={`font-medium capitalize ${
//                                 status === "current"
//                                   ? "text-blue-600"
//                                   : status === "completed"
//                                     ? "text-green-600"
//                                     : "text-gray-500"
//                               }`}
//                             >
//                               {stageName.toLowerCase()}
//                             </h3>
//                             {stageHistory && (
//                               <div className="flex items-center gap-2">
//                                 {stageHistory.blockchainHash && (
//                                   <Badge variant="default">
//                                     Blockchain Verified
//                                   </Badge>
//                                 )}
//                                 <Badge
//                                   variant={
//                                     status === "completed"
//                                       ? "default"
//                                       : "secondary"
//                                   }
//                                 >
//                                   {status === "completed"
//                                     ? "Completed"
//                                     : "In Progress"}
//                                 </Badge>
//                               </div>
//                             )}
//                           </div>

//                           {stageHistory ? (
//                             <div className="space-y-2">
//                               <div className="text-sm text-gray-600">
//                                 <div className="flex items-center gap-2">
//                                   <Calendar className="h-4 w-4" />
//                                   {formatDateTime(stageHistory.timestamp)}
//                                 </div>
//                                 <div className="flex items-center gap-2 mt-1">
//                                   <User className="h-4 w-4" />
//                                   {stageHistory.user?.name} (
//                                   {stageHistory.user?.role})
//                                 </div>
//                                 <div className="flex items-center gap-2 mt-1">
//                                   <MapPin className="h-4 w-4" />
//                                   {stageHistory.location}
//                                 </div>
//                               </div>
//                               {stageHistory.notes && (
//                                 <p className="text-sm text-gray-700 italic">
//                                   "{stageHistory.notes}"
//                                 </p>
//                               )}
//                             </div>
//                           ) : (
//                             <p className="text-sm text-gray-500">
//                               {status === "current"
//                                 ? "In progress..."
//                                 : "Pending"}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Detailed Information Tabs */}
//             <Tabs defaultValue="source" className="w-full">
//               <TabsList>
//                 <TabsTrigger value="source">Source Data</TabsTrigger>
//                 <TabsTrigger value="stages">Stage Details</TabsTrigger>
//                 <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
//                 <TabsTrigger value="quality">Quality & Tests</TabsTrigger>
//               </TabsList>

//               <TabsContent value="source">
//                 <div className="space-y-6">
//                   {batch.sourceType === "WILD_CAPTURE" && batch.fishingData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Anchor className="h-5 w-5" />
//                           Fishing Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.fishingData, "fishing")}
//                       </CardContent>
//                     </Card>
//                   )}

//                   {batch.sourceType === "FARMED" && batch.hatcheryData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Fish className="h-5 w-5" />
//                           Hatchery Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.hatcheryData, "hatchery")}
//                       </CardContent>
//                     </Card>
//                   )}

//                   {batch.sourceType === "FARMED" && batch.growOutData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Building className="h-5 w-5" />
//                           Grow-Out Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.growOutData, "growout")}
//                       </CardContent>
//                     </Card>
//                   )}

//                   {batch.harvestData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Package className="h-5 w-5" />
//                           Harvest Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.harvestData, "harvest")}
//                       </CardContent>
//                     </Card>
//                   )}
//                 </div>
//               </TabsContent>

//               <TabsContent value="stages">
//                 <div className="space-y-6">
//                   {batch.processingData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Factory className="h-5 w-5" />
//                           Processing Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.processingData, "processing")}
//                       </CardContent>
//                     </Card>
//                   )}

//                   {batch.storageData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Building className="h-5 w-5" />
//                           Storage Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.storageData, "storage")}
//                       </CardContent>
//                     </Card>
//                   )}

//                   {batch.transportData && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                           <Truck className="h-5 w-5" />
//                           Transport Data
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageData(batch.transportData, "transport")}
//                       </CardContent>
//                     </Card>
//                   )}
//                 </div>
//               </TabsContent>

//               <TabsContent value="blockchain">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Database className="h-5 w-5" />
//                       Blockchain & IPFS Data
//                     </CardTitle>
//                     <CardDescription>
//                       Immutable records and decentralized storage
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <h4 className="font-medium text-gray-900 mb-3">
//                             Blockchain Information
//                           </h4>
//                           <div className="space-y-2 text-sm">
//                             <div>
//                               <span className="text-gray-600">Data Hash:</span>
//                               <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
//                                 {batch.dataHash}
//                               </div>
//                             </div>
//                             <div>
//                               <span className="text-gray-600">
//                                 Blockchain Hash:
//                               </span>
//                               <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
//                                 {batch.blockchainHash}
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div>
//                           <h4 className="font-medium text-gray-900 mb-3">
//                             IPFS Files
//                           </h4>
//                           <div className="space-y-2">
//                             {batch.fileHashes.map((hash, index) => (
//                               <div
//                                 key={index}
//                                 className="flex items-center justify-between p-2 bg-gray-50 rounded"
//                               >
//                                 <div className="font-mono text-xs">{hash}</div>
//                                 <Button variant="outline" size="sm">
//                                   <ExternalLink className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="font-medium text-gray-900 mb-3">
//                           Stage History Verification
//                         </h4>
//                         <div className="space-y-3">
//                           {batch.stageHistory.map((stage, index) => (
//                             <div
//                               key={index}
//                               className="flex items-center justify-between p-3 border rounded-lg"
//                             >
//                               <div>
//                                 <div className="font-medium capitalize">
//                                   {stage.stage}
//                                 </div>
//                                 <div className="text-sm text-gray-600">
//                                   {formatDateTime(stage.timestamp)}
//                                 </div>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 {stage.blockchainHash ? (
//                                   <Badge variant="default">
//                                     <ShieldCheck className="h-3 w-3 mr-1" />
//                                     Verified
//                                   </Badge>
//                                 ) : (
//                                   <Badge variant="secondary">
//                                     <AlertCircle className="h-3 w-3 mr-1" />
//                                     Pending
//                                   </Badge>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="quality">
//                 <div className="space-y-6">
//                   {batch.processingData?.qualityTests && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle>Quality Tests</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="space-y-3">
//                           {batch.processingData.qualityTests.map(
//                             (test, index) => (
//                               <div
//                                 key={index}
//                                 className="p-4 border rounded-lg"
//                               >
//                                 <div className="flex items-center justify-between mb-2">
//                                   <h4 className="font-medium">
//                                     {test.testType}
//                                   </h4>
//                                   <Badge>
//                                     {test.passed ? "Passed" : "Failed"}
//                                   </Badge>
//                                 </div>
//                                 <div className="text-sm text-gray-600">
//                                   <div>
//                                     <strong>Result:</strong> {test.result}
//                                   </div>
//                                   <div>
//                                     <strong>Standard:</strong> {test.standard}
//                                   </div>
//                                 </div>
//                               </div>
//                             )
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {batch.storageData?.qualityChecks && (
//                     <Card>
//                       <CardHeader>
//                         <CardTitle>Storage Quality Checks</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="space-y-3">
//                           {batch.storageData.qualityChecks.map(
//                             (check, index) => (
//                               <div
//                                 key={index}
//                                 className="p-4 border rounded-lg"
//                               >
//                                 <div className="flex items-center justify-between mb-2">
//                                   <h4 className="font-medium">
//                                     {formatDate(check.checkDate)}
//                                   </h4>
//                                   <Badge variant="outline">
//                                     {check.quality}
//                                   </Badge>
//                                 </div>
//                                 <div className="text-sm text-gray-600">
//                                   <div>
//                                     <strong>Temperature:</strong>{" "}
//                                     {check.temperature}°C
//                                   </div>
//                                   {check.notes && (
//                                     <div>
//                                       <strong>Notes:</strong> {check.notes}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Basic Info */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Batch Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <h4 className="font-medium text-gray-900">Product ID</h4>
//                   <p className="text-sm text-gray-600">{batch.productId}</p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">Batch ID</h4>
//                   <p className="text-sm text-gray-600">{batch.batchId}</p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">Source Type</h4>
//                   <Badge variant="outline" className="capitalize">
//                     {batch.sourceType.replace("_", " ").toLowerCase()}
//                   </Badge>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">Status</h4>
//                   <Badge
//                     variant={
//                       batch.status === "ACTIVE" ? "default" : "secondary"
//                     }
//                   >
//                     {batch.status}
//                   </Badge>
//                 </div>

//                 <Separator />

//                 <div>
//                   <h4 className="font-medium text-gray-900">Created</h4>
//                   <p className="text-sm text-gray-600">
//                     {formatDate(batch.createdAt)}
//                   </p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">Last Updated</h4>
//                   <p className="text-sm text-gray-600">
//                     {formatDate(batch.updatedAt)}
//                   </p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">Visibility</h4>
//                   <div className="flex items-center gap-2">
//                     {batch.isPublic ? (
//                       <>
//                         <Globe className="h-4 w-4 text-green-600" />
//                         <span className="text-sm text-green-600">Public</span>
//                       </>
//                     ) : (
//                       <>
//                         <EyeOff className="h-4 w-4 text-gray-600" />
//                         <span className="text-sm text-gray-600">Private</span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* QR Code */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>QR Code</CardTitle>
//                 <CardDescription>
//                   Scan to view public trace information
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="text-center">
//                 <div className="flex justify-center mb-4">
//                   <div className="bg-white p-4 rounded-lg border">
//                     {/* <QRCodeSVG 
//                       value={JSON.stringify({
//                         productId: batch.productId,
//                         batchId: batch.batchId,
//                         traceUrl: `https://tracceaqua.vercel.app/trace/${batch.productId}`
//                       })} 
//                       size={150} 
//                     /> */}
//                   </div>
//                 </div>
//                 <Button variant="outline" size="sm" className="w-full">
//                   <Download className="h-4 w-4 mr-2" />
//                   Download QR Code
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* User Info */}
//             {batch.user && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Created By</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <div>
//                       <h4 className="font-medium text-gray-900">
//                         {batch.user.name}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {batch.user.email}
//                       </p>
//                     </div>
//                     <Badge variant="outline" className="capitalize">
//                       {batch.user.role?.toLowerCase()}
//                     </Badge>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Notes */}
//             {batch.notes && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Notes</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-sm text-gray-600">{batch.notes}</p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BatchDetailsPage;

const BatchDetailsPage = () => {
  return (
    <div>Can't view batch now</div>
  )
}

export default BatchDetailsPage
