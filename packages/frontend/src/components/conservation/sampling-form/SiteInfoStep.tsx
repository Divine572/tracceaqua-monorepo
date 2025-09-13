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
import { MapPin, Thermometer, Droplets, FlaskConical } from "lucide-react";

export function SiteInfoStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Sampling ID Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sampling Identification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="samplingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sampling ID *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., SAMP_2025_001"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Unique identifier for this sampling session
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Location Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="locationData.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 6.5244"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Decimal degrees (-90 to 90)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="locationData.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 3.3792"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Decimal degrees (-180 to 180)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="locationData.waterBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Body Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Lagos Lagoon, Atlantic Ocean"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Name of the water body where sampling occurred
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="locationData.locationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the sampling location, including landmarks, habitat characteristics, etc."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Detailed description of the sampling site
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="locationData.waterDepth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Depth (m) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 15.5"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Depth in meters at sampling location</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Water Parameters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Water Quality Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="locationData.waterTemperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Water Temperature (°C) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 25.5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Temperature in Celsius</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="locationData.salinity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Salinity (ppt) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="e.g., 35.0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Parts per thousand (0-50)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="locationData.phLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>pH Level *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      placeholder="e.g., 8.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>pH scale (0-14)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="locationData.dissolvedOxygen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dissolved Oxygen (mg/L) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g., 6.5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Milligrams per liter</FormDescription>
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