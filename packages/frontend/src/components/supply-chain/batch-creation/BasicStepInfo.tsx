import { FileText } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

const BasicInfoStep = () => {
  const { register, watch, control } = useFormContext();
  const sourceType = watch("sourceType");

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <p className="text-gray-600 mt-2">
          Enter the basic details of your seafood product
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          // label="productId"
          control={control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product ID</FormLabel>
              <FormControl>
                <Input
                  // {...register('productId')}
                  placeholder="e.g., BAC_001"
                  {...field}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <FormControl className="w-full">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FARMED">Farmed</SelectItem>
                    <SelectItem value="WILD_CAPTURE">Wild Capture</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="speciesName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Atlantic Salmon" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Fresh Atlantic Salmon Fillet"
                  {...field}
                />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="batchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch ID</FormLabel>
              <FormControl>
                <Input placeholder="Optional batch identifier" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lagos, Nigeria" {...field} />
              </FormControl>
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="productDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your product..." {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information..."
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          {...register("isPublic")}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Make this record publicly traceable
        </label>
      </div>

      {sourceType && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Next steps:</strong> You've selected{" "}
            {sourceType === "FARMED" ? "Farmed" : "Wild Capture"} as your source
            type.
            {sourceType === "FARMED"
              ? " You will be able to enter hatchery and grow-out data in the following steps."
              : " You will be able to enter fishing data in the next step."}
          </p>
        </div>
      )}
    </div>
  );
};

export default BasicInfoStep;
