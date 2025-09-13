import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { batchCreationSchema } from "@/zod/schemas/batch-creation-schema";

type BatchCreationData = z.infer<typeof batchCreationSchema>;

export default function GrowOutStep() {
  const { register } = useFormContext<BatchCreationData>();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grow-Out Data</CardTitle>
        <CardDescription>Growth and farming information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Growing Location</label>
            <input {...register("growOutData.growingLocation")} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Stocking Density</label>
            <input type="number" {...register("growOutData.stockingDensity", { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Growth Period (days)</label>
            <input type="number" {...register("growOutData.growthPeriod", { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Feed Conversion Ratio</label>
            <input type="number" step="0.01" {...register("growOutData.feedConversionRatio", { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Disease Treatments</label>
          <textarea 
            {...register("growOutData.diseaseTreatments")} 
            className="w-full p-2 border rounded-md" 
            rows={2}
            placeholder="Enter treatments separated by commas"
          />
        </div>
      </CardContent>
    </Card>
  );
}
