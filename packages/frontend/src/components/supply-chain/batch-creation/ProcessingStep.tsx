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

export default function ProcessingStep() {
  const { register } = useFormContext<BatchCreationData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Data</CardTitle>
        <CardDescription>Processing facility and methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Facility Name</label>
            <input
              {...register("processingData.facilityName")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Processing Method</label>
            <input
              {...register("processingData.processingMethod")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Processing Date</label>
            <input
              type="date"
              {...register("processingData.processingDate")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Input Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              {...register("processingData.inputWeight", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Output Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              {...register("processingData.outputWeight", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Processing Yield (%)</label>
            <input
              type="number"
              step="0.1"
              {...register("processingData.processingYield", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
