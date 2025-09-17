import { useFormContext, useFieldArray } from "react-hook-form";
import { Building, Plus, Trash2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GrowOutStep = () => {
  const { register, control } = useFormContext();
  const {
    fields: treatmentFields,
    append: appendTreatment,
    remove: removeTreatment,
  } = useFieldArray({
    control,
    name: "growOutData.diseaseTreatments",
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">
          Grow-Out Information
        </h2>
        <p className="text-gray-600 mt-2">
          Enter details about the growing process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="growOutData.growingLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Growing Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lagos Aquaculture Farm" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="growOutData.stockingDensity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stocking Density (per m²)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 25" {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="growOutData.growthPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Growth Period (days)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 180" {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="growOutData.feedConversionRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feed Conversion Ratio</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 1.5"
                  {...field}
                  type="number"
                  step="0.1"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Water Quality Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="growOutData.waterQuality.temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 24.5"
                    type="number"
                    step="0.1"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="growOutData.waterQuality.oxygen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oxygen (mg/L)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 7.2"
                    {...field}
                    type="number"
                    step="0.1"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="growOutData.waterQuality.ph"
            render={({ field }) => (
              <FormItem>
                <FormLabel>pH Level</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 7.8"
                    {...field}
                    type="number"
                    step="0.1"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="growOutData.waterQuality.ammonia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ammonia (mg/L)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 0.05"
                    {...field}
                    type="number"
                    step="0.1"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Disease Treatments
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendTreatment("")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Treatment
          </Button>
        </div>

        {treatmentFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`growOutData.diseaseTreatments.${index}`)}
              placeholder="e.g., Antibiotics, Vaccination"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeTreatment(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {treatmentFields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No treatments added yet. Click "Add Treatment" to add one.
          </p>
        )}
      </div>
    </div>
  );
};

export default GrowOutStep;
