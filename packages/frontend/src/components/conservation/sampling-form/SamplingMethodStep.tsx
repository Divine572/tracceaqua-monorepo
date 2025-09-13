"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Waves,
  Clock,
  Zap,
  Cloud,
  Navigation,
  Timer,
  Settings,
} from "lucide-react";

export function SamplingMethodStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Sampling Method Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sampling Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="samplingData.samplingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sampling Method *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Bottom trawl, Gill net, Hand collection"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Primary method used for specimen collection
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="samplingData.gearSpecs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gear Specifications *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 15m bottom trawl net with 2cm mesh size, cod-end mesh 1cm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Detailed specifications of sampling equipment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Sampling Effort Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Sampling Effort
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="samplingData.samplingDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Sampling Duration (minutes) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 60"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Duration of active sampling in minutes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="samplingData.effortHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Effort Hours *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g., 2.5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0.1)
                      }
                    />
                  </FormControl>
                  <FormDescription>Total effort time in hours</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Environmental Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="samplingData.weatherConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Weather Conditions *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Clear sky, light breeze, 28°C air temperature"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Weather conditions during sampling
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="samplingData.seaState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Waves className="h-4 w-4" />
                    Sea State *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Calm (0-1), Moderate (2-3), Rough (4-5)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sea state according to Douglas scale
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="samplingData.tidalConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Tidal Conditions *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., High tide, Low tide, Rising, Falling"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Tidal phase during sampling</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
