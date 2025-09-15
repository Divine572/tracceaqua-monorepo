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

export default function TransportStep() {
  const { register, control } = useFormContext<BatchCreationData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transport Data</CardTitle>
        <CardDescription>Transportation details and conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            // control={control}
            name="transportData.transportMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Method</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            // control={control}
            name="transportData.originLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Origin Location
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            // control={control}
            name="transportData.destinationLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Location</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="transportData.transportTemperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Temperature (°C)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="transportData.transportDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
