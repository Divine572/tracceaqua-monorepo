import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  FormField,
  FormLabel,
  FormControl,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { batchCreationSchema } from "@/zod/schemas/batch-creation-schema";

type BatchCreationData = z.infer<typeof batchCreationSchema>;

export default function HatcheryStep() {
  const { register, control } = useFormContext<BatchCreationData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hatchery Data</CardTitle>
        <CardDescription>
          Spawning and early development information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Species Spawned</label>
            <input
              {...register("hatcheryData.speciesSpawned")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Egg Count</label>
            <input
              type="number"
              {...register("hatcheryData.eggCount", { valueAsNumber: true })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Spawning Date</label>
            <input
              type="date"
              {...register("hatcheryData.spawningDate")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Water Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("hatcheryData.waterTemperature", {
                valueAsNumber: true,
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Salinity (ppt)</label>
            <input
              type="number"
              step="0.1"
              {...register("hatcheryData.salinity", { valueAsNumber: true })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Feed Type</label>
            <input
              {...register("hatcheryData.feedType")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Survival Rate (%)</label>
            <input
              type="number"
              step="0.1"
              {...register("hatcheryData.survivalRate", {
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
