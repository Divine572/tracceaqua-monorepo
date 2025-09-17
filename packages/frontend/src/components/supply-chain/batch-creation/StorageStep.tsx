import { useFormContext, useFieldArray } from "react-hook-form";
import { Building, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

const StorageStep = () => {
  const { register, watch, control } = useFormContext();

  const {
    fields: checkFields,
    append: appendCheck,
    remove: removeCheck,
  } = useFieldArray({
    control,
    name: "storageData.qualityChecks",
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold">
          Storage Information
        </h2>
        <p className="text-gray-600 mt-2">
          Enter details about storage conditions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="storageData.storageFacility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Facility</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Cold Storage Warehouse A"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storageData.storageTemperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Temperature (°C)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., -18"
                  type="number"
                  step="0.1"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storageData.storageMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Method</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Frozen storage, Refrigerated"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storageData.storageDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Duration (days)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 30" type="number" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storageData.humidityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Humidity Level (%)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 85"
                  type="number"
                  step="0.1"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Quality Checks
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendCheck({
                checkDate: "",
                temperature: 0,
                quality: "",
                notes: "",
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Check
          </Button>
        </div>

        {checkFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <FormField
              control={control}
              name="checkDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., -18"
                      type="number"
                      step="0.1"
                      {...field}
                    />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quality Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes" {...field} />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCheck(index)}
                className="mb-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {checkFields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No quality checks added yet. Click "Add Check" to add quality check
            information.
          </p>
        )}
      </div>
    </div>
  );
};

export default StorageStep;
