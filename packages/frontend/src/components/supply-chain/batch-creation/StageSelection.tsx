// import { useState } from "react";
// import { useFormContext } from "react-hook-form";
// import {
//   Card,
//   CardContent,
//   CardTitle,
//   CardHeader,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { SourceType } from "@/zod/schemas/supply-chain-form-schema";

// interface StageSelectionProps {
//     activeStages: string[]
//     toggleStage: (stage: string) => void
// }

// const StageSelection = ({activeStages, toggleStage}: StageSelectionProps) => {
  
//   const { watch } = useFormContext();
//   const sourceType = watch("sourceType");

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Supply Chain Stages</CardTitle>
//         <CardDescription>
//           Select which stages to include in this record
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="flex flex-wrap gap-2">
//           {sourceType === SourceType.FARMED && (
//             <>
//               <Button
//                 type="button"
//                 variant={
//                   activeStages.includes("hatchery") ? "default" : "outline"
//                 }
//                 onClick={() => toggleStage("hatchery")}
//               >
//                 Hatchery
//               </Button>
//               <Button
//                 type="button"
//                 variant={
//                   activeStages.includes("growOut") ? "default" : "outline"
//                 }
//                 onClick={() => toggleStage("growOut")}
//               >
//                 Grow-out
//               </Button>
//             </>
//           )}

//           {sourceType === SourceType.WILD_CAPTURE && (
//             <Button
//               type="button"
//               variant={activeStages.includes("fishing") ? "default" : "outline"}
//               onClick={() => toggleStage("fishing")}
//             >
//               Fishing
//             </Button>
//           )}

//           <Button
//             type="button"
//             variant={activeStages.includes("harvest") ? "default" : "outline"}
//             onClick={() => toggleStage("harvest")}
//           >
//             Harvest
//           </Button>
//           <Button
//             type="button"
//             variant={
//               activeStages.includes("processing") ? "default" : "outline"
//             }
//             onClick={() => toggleStage("processing")}
//           >
//             Processing
//           </Button>
//           <Button
//             type="button"
//             variant={activeStages.includes("storage") ? "default" : "outline"}
//             onClick={() => toggleStage("storage")}
//           >
//             Storage
//           </Button>
//           <Button
//             type="button"
//             variant={activeStages.includes("transport") ? "default" : "outline"}
//             onClick={() => toggleStage("transport")}
//           >
//             Transport
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default StageSelection
