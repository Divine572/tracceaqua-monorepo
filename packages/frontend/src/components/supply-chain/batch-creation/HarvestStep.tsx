import { useFormContext } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PackageCheck } from "lucide-react";

const HarvestStep = () => {
  const { register, watch, control } = useFormContext();
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackageCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">
          Harvest Information
        </h2>
        <p className="text-gray-600 mt-2">
          Enter details about the harvest process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="harvestMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harvest Method</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Net harvesting, Seine nets"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="harvestLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harvest Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lagos Fish Farm, Pond 3" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="totalWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 500"
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
          name="pieceCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Piece Count</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 100" {...field} type="number" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="averageSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Average Size (cm)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 35.5"
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
          name="qualityGrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality Grade</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="postHarvestHandling"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Post-Harvest Handling</FormLabel>
            <FormControl>
              <Input
                placeholder="Describe post-harvest handling procedures..."
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default HarvestStep;
