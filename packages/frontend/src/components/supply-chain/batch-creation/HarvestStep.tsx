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

export default function HarvestStep() {
  const { register } = useFormContext<BatchCreationData>();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Harvest Data</CardTitle>
        <CardDescription>Harvest and collection information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Harvest Method</label>
            <input {...register("harvestData.harvestMethod")} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Harvest Location</label>
            <input {...register("harvestData.harvestLocation")} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Total Weight (kg)</label>
            <input type="number" step="0.1" {...register("harvestData.totalWeight", { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Piece Count</label>
            <input type="number" {...register("harvestData.pieceCount", { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Average Size</label>
            <input type="number" step="0.1" {...register("harvestData.averageSize", { valueAsNumber: true })} className="w-full p-2 border rounded-md" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Quality Grade</label>
            <select {...register("harvestData.qualityGrade")} className="w-full p-2 border rounded-md">
              <option value="">Select grade</option>
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
              <option value="Grade C">Grade C</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Post-Harvest Handling</label>
          <textarea {...register("harvestData.postHarvestHandling")} className="w-full p-2 border rounded-md" rows={2} />
        </div>
      </CardContent>
    </Card>
  );
}
