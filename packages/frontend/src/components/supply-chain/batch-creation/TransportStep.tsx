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

export default function TransportStep() {
  const { register } = useFormContext<BatchCreationData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transport Data</CardTitle>
        <CardDescription>Transportation details and conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Transport Method</label>
            <input
              {...register("transportData.transportMethod")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Origin Location</label>
            <input
              {...register("transportData.originLocation")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Destination Location</label>
            <input
              {...register("transportData.destinationLocation")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Transport Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("transportData.transportTemperature", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Transport Duration (hours)
            </label>
            <input
              type="number"
              {...register("transportData.transportDuration", {
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
