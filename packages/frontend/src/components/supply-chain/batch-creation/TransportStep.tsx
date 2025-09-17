import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Plus, Trash2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const TransportStep = () => {
  const { register, watch, control } = useFormContext();

  const {
    fields: monitoringFields,
    append: appendMonitoring,
    remove: removeMonitoring,
  } = useFieldArray({
    control,
    name: "transportData.coldChainMonitoring",
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold">Transport Information</h2>
        <p className="text-gray-600 mt-2">Enter details about transportation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="transportData.transportMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transport Method</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Refrigerated truck, Air freight"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="transportData.originLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lagos Processing Plant" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="transportData.destinationLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Abuja Distribution Center"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
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
          name="transportData.transportDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transport Duration (hours)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 8"
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
        <h3 className="text-lg font-semibold">Vehicle Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="transportData.vehicleDetails.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Refrigerated truck" {...field} />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="transportData.vehicleDetails.registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ABC-123-DE" {...field} />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="transportData.vehicleDetails.driver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cold Chain Monitoring</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendMonitoring({ timestamp: "", temperature: 0, location: "" })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Monitoring Point
          </Button>
        </div>

        {monitoringFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <FormField
              control={control}
              name={`transportData.coldChainMonitoring.${index}.timestamp`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timestamp</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`"transportData.coldChainMonitoring.${index}.temperature`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., -18"
                      {...field}
                      type="number"
                      step="0.1"
                    />
                  </FormControl>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`transportData.coldChainMonitoring.${index}.location`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Highway checkpoint" {...field} />
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
                onClick={() => removeMonitoring(index)}
                className="mb-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {monitoringFields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No monitoring points added yet. Click "Add Monitoring Point" to add
            cold chain monitoring data.
          </p>
        )}
      </div>
    </div>
  );
};

export default TransportStep;
