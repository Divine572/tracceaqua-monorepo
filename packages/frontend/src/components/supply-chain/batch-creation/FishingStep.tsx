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

export default function FishingStep() {
  const { register } = useFormContext<BatchCreationData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fishing Data</CardTitle>
        <CardDescription>Wild capture fishing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Fishing Method</label>
            <input
              {...register("fishingData.fishingMethod")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Water Depth (m)</label>
            <input
              type="number"
              {...register("fishingData.waterDepth", { valueAsNumber: true })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Sea Conditions</label>
            <input
              {...register("fishingData.seaConditions")}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
