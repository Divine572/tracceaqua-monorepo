import { useFormContext, useFieldArray } from "react-hook-form";
import { Fish, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const FishingStep = () => {
  const { register, watch, control } = useFormContext();

  const {
    fields: catchFields,
    append: appendCatch,
    remove: removeCatch,
  } = useFieldArray({
    control,
    name: "fishingData.catchComposition",
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Fish className="w-8 h-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold">
          Fishing Information
        </h2>
        <p className="text-gray-600 mt-2">
          Enter details about the wild capture process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="fishingData.fishingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fishing Method</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Trawling, Line fishing" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fishingData.waterDepth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Water Depth (meters)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 45" {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fishingData.seaConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sea Conditions</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Calm, Moderate waves" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Coordinates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="fishingData.coordinates.latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 6.5244"
                    {...field}
                    type="number"
                    step="any"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="fishingData.coordinates.longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 3.3792"
                    {...field}
                    type="number"
                    step="any"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vessel Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="fishingData.vesselDetails.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vessel Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sea Explorer" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="fishingData.vesselDetails.registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., NIG-001" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="fishingData.vesselDetails.captain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Captain</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Captain John" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Catch Composition
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendCatch({ species: "", quantity: 0, averageSize: 0 })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Catch
          </Button>
        </div>

        {catchFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <FormField
              control={control}
              name="fishingData.catchComposition.species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tuna" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="fishingData.catchComposition.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 50" {...field} type="number" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="fishingData.catchComposition.averageSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Size (cm)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 45" {...field} type="number" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCatch(index)}
                className="mb-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {catchFields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No catch data added yet. Click "Add Catch" to add catch information.
          </p>
        )}
      </div>
    </div>
  );
};

export default FishingStep;
