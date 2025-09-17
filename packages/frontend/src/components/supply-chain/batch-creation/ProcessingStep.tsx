import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Factory, Plus, Trash2 } from "lucide-react";

const ProcessingStep = () => {
  const { control } = useFormContext();

  const {
    fields: testFields,
    append: appendTest,
    remove: removeTest,
  } = useFieldArray({
    control,
    name: "processingData.qualityTests",
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Factory className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold">Processing Information</h2>
        <p className="text-gray-600 mt-2">
          Enter details about the processing stage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="processingData.facilityName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facility Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Lagos Seafood Processing Ltd"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="processingData.processingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Method</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Flash freezing, Filleting"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="processingData.processingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="processingData.inputWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 500"
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
          name="processingData.outputWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 400"
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
          name="processingData.processingYield"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Yield (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 80"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Packaging Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="processingData.packaging.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Vacuum sealed, Ice packed"
                    {...field}
                  />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="processingData.packaging.size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Size</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 1kg, 500g" {...field} />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="processingData.packaging.material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Material</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Food-grade plastic, Biodegradable"
                    {...field}
                  />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="processingData.packaging.labelInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label Information</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Batch number, Expiry date"
                    {...field}
                  />
                </FormControl>
                {/* <FormMessage /> */}
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quality Tests</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendTest({
                testType: "",
                result: "",
                standard: "",
                passed: false,
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Test
          </Button>
        </div>

        {testFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <FormField
              control={control}
              name={`processingData.qualityTests.${index}.testType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Microbiological" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`processingData.qualityTests.${index}.result`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Negative" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`processingData.qualityTests.${index}.standard`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HACCP" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`processingData.qualityTests.${index}.passed`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passed</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeTest(index)}
                className="mb-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {testFields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No quality tests added yet. Click "Add Test" to add quality test
            information.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProcessingStep;
