import { useForm, useFormContext } from "react-hook-form";
import {z} from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {batchCreationSchema} from "@/zod/schemas/batch-creation-schema"

type BatchCreationData = z.infer<typeof batchCreationSchema>;


export default function BasicInfoStep() {
  const { register, formState: { errors } } = useFormContext<BatchCreationData>();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Enter the core product and source details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Source Type *</label>
            <select 
              {...register("sourceType")} 
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select source type</option>
              <option value="hatchery">Hatchery</option>
              <option value="wild-capture">Wild Capture</option>
              <option value="aquaculture">Aquaculture</option>
              <option value="imported">Imported</option>
            </select>
            {errors.sourceType && <p className="text-red-500 text-sm">{errors.sourceType.message}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Species Name *</label>
            <input 
              {...register("speciesName")} 
              className="w-full p-2 border rounded-md" 
              placeholder="e.g., Clarias gariepinus"
            />
            {errors.speciesName && <p className="text-red-500 text-sm">{errors.speciesName.message}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Product Name *</label>
            <input 
              {...register("productName")} 
              className="w-full p-2 border rounded-md" 
              placeholder="e.g., Fresh Catfish"
            />
            {errors.productName && <p className="text-red-500 text-sm">{errors.productName.message}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Current Stage</label>
            <select {...register("currentStage")} className="w-full p-2 border rounded-md">
              <option value="">Select current stage</option>
              <option value="hatchery">Hatchery</option>
              <option value="grow-out">Grow-Out</option>
              <option value="fishing">Fishing</option>
              <option value="harvest">Harvest</option>
              <option value="processing">Processing</option>
              <option value="storage">Storage</option>
              <option value="transport">Transport</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Product Description</label>
          <textarea 
            {...register("productDescription")} 
            className="w-full p-2 border rounded-md" 
            rows={3}
            placeholder="Describe the product..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <select {...register("status")} className="w-full p-2 border rounded-md">
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              {...register("isPublic")} 
              className="rounded"
            />
            <label className="text-sm font-medium">Make this batch public</label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}