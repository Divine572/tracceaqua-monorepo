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

export default function StorageStep() {
  const { register } = useFormContext<BatchCreationData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Data</CardTitle>
        <CardDescription>Storage conditions and duration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Storage Facility</label>
            <input
              {...register("storageData.storageFacility")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Storage Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("storageData.storageTemperature", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Storage Method</label>
            <input
              {...register("storageData.storageMethod")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Storage Duration (hours)
            </label>
            <input
              type="number"
              {...register("storageData.storageDuration", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Humidity Level (%)</label>
            <input
              type="number"
              step="0.1"
              {...register("storageData.humidityLevel", {
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
