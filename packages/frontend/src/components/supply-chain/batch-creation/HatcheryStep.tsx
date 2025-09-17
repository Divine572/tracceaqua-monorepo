import { Fish } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

const HatcheryStep = () => {
  const { control } = useFormContext();
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Fish className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">
          Hatchery Information
        </h2>
        <p className="text-gray-600 mt-2">
          Enter details about the hatchery process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="speciesSpawned"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species Spawned</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Atlantic Salmon" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="eggCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Egg Count</FormLabel>
              <FormControl>
                <Input
                  placeholder="Number of eggs/larvae"
                  {...field}
                  type="number"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="spawningDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spawning Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="waterTemperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Water Temperature (°C)</FormLabel>
              <FormControl>
                <Input
                  step="0.1"
                  placeholder="e.g., 15.5"
                  {...field}
                  type="number"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="salinity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salinity Level</FormLabel>
              <FormControl>
                <Input {...field} step="0.1" placeholder="e.g., 35.0" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="feedType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feed Type</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Artemia, Commercial feed"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="survivalRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Survival Rate (%)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 85.5"
                  {...field}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default HatcheryStep;
