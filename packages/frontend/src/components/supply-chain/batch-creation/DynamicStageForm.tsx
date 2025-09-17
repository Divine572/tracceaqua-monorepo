import { useFormContext } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// interface DynamicStageFormProps {
//     activeStages: string[]
// }

const DynamicStageForm = ({ activeStages }: { activeStages: string[] }) => {
  const { control } = useFormContext();

  return (
    <Tabs defaultValue={activeStages[0]} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        {activeStages.includes("hatchery") && (
          <TabsTrigger value="hatchery">Hatchery</TabsTrigger>
        )}
        {activeStages.includes("growOut") && (
          <TabsTrigger value="growOut">Grow-out</TabsTrigger>
        )}
        {activeStages.includes("fishing") && (
          <TabsTrigger value="fishing">Fishing</TabsTrigger>
        )}
        {activeStages.includes("harvest") && (
          <TabsTrigger value="harvest">Harvest</TabsTrigger>
        )}
        {activeStages.includes("processing") && (
          <TabsTrigger value="processing">Processing</TabsTrigger>
        )}
        {activeStages.includes("storage") && (
          <TabsTrigger value="storage">Storage</TabsTrigger>
        )}
        {activeStages.includes("transport") && (
          <TabsTrigger value="transport">Transport</TabsTrigger>
        )}
      </TabsList>

      {/* Hatchery Data */}
      {activeStages.includes("hatchery") && (
        <TabsContent value="hatchery">
          <Card>
            <CardHeader>
              <CardTitle>Hatchery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="hatcheryData.speciesSpawned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species Spawned</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hatcheryData.eggCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Egg Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hatcheryData.waterTemperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Temperature (°C)</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hatcheryData.salinity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salinity</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hatcheryData.feedType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feed Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hatcheryData.survivalRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survival Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {/* Add similar TabsContent sections for other stages... */}
      {/* This is a condensed version - each stage would have similar detailed forms */}
    </Tabs>
  );
};

export default DynamicStageForm
