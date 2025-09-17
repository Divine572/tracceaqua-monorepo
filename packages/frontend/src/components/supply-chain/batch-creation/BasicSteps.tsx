// import { useFormContext } from "react-hook-form";
// import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card"
// import { Input } from "@/components/ui/input";
// import {
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Fish } from "lucide-react";
// import { Control } from "react-hook-form";
// import { SourceType } from "@/zod/schemas/supply-chain-form-schema";

// // interface BasicStepsProps {
// //     control: Control
// // }

// const BasicSteps = () => {
//     const {control} = useFormContext()
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Fish className="h-5 w-5" />
//           Basic Information
//         </CardTitle>
//         <CardDescription>Core product details and source type</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <FormField
//             control={control}
//             name="productId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Product ID *</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g., PROD-2024-001" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="sourceType"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Source Type *</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={field.value}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select source type" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value={SourceType.FARMED}>Farmed</SelectItem>
//                     <SelectItem value={SourceType.WILD_CAPTURE}>
//                       Wild Capture
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="speciesName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Species Name *</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g., Oreochromis niloticus" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="productName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Product Name *</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g., Fresh Tilapia" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="batchId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Batch ID</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g., BATCH-001" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={control}
//             name="location"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Current Location</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g., Lagos, Nigeria" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormField
//           control={control}
//           name="productDescription"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Product Description</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="Describe the product characteristics..."
//                   className="min-h-[100px]"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={control}
//           name="isPublic"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//               <div className="space-y-0.5">
//                 <FormLabel className="text-base">Public Traceability</FormLabel>
//                 <FormDescription>
//                   Allow consumers to trace this product using QR codes
//                 </FormDescription>
//               </div>
//               <FormControl>
//                 <Switch
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default BasicSteps;
