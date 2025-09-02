'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Thermometer, Droplets, Activity, CloudRain, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LocationEnvironmentalStepProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const weatherOptions = [
  'Clear',
  'Partly Cloudy', 
  'Overcast',
  'Light Rain',
  'Heavy Rain',
  'Storm',
  'Fog',
  'Windy'
]

export default function LocationEnvironmentalStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: LocationEnvironmentalStepProps) {
  const [locationData, setLocationData] = useState(data.location || {})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const { toast } = useToast()

  // Update parent data when local data changes
  useEffect(() => {
    updateData({ location: locationData })
  }, [locationData, updateData])

  const updateField = (field: string, value: any) => {
    setLocationData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  // Get current GPS location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      })
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateField('latitude', latitude)
        updateField('longitude', longitude)
        
        toast({
          title: "Location Updated",
          description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        })
        
        setIsGettingLocation(false)
      },
      (error) => {
        let errorMessage = 'Unable to get location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        setLocationError(errorMessage)
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        })
        
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Validation
  const isStepValid = () => {
    return (
      locationData.locationName?.trim() &&
      locationData.waterBody?.trim() &&
      locationData.depth > 0 &&
      locationData.weather
    )
  }

  const handleNext = () => {
    if (isStepValid()) {
      onNext()
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields to continue",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Location
          </CardTitle>
          <CardDescription>
            Specify the exact location where sampling will take place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locationName">Location Name *</Label>
              <Input
                id="locationName"
                placeholder="e.g., Lagos Lagoon - Marina District"
                value={locationData.locationName || ''}
                onChange={(e) => updateField('locationName', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="waterBody">Water Body *</Label>
              <Input
                id="waterBody"
                placeholder="e.g., Lagos Lagoon, Ogun River"
                value={locationData.waterBody || ''}
                onChange={(e) => updateField('waterBody', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">GPS Coordinates</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="gap-2"
              >
                <Navigation className="h-4 w-4" />
                {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 6.4541"
                  value={locationData.latitude || ''}
                  onChange={(e) => updateField('latitude', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 3.3947"
                  value={locationData.longitude || ''}
                  onChange={(e) => updateField('longitude', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            
            {locationError && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {locationError}
              </div>
            )}
            
            {locationData.latitude && locationData.longitude && (
              <div className="mt-2">
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Environmental Conditions
          </CardTitle>
          <CardDescription>
            Record the environmental parameters at the sampling location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="depth">Water Depth (meters) *</Label>
              <Input
                id="depth"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 2.5"
                value={locationData.depth || ''}
                onChange={(e) => updateField('depth', parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="waterTemperature">Water Temperature (°C)</Label>
              <div className="relative">
                <Input
                  id="waterTemperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 28.5"
                  value={locationData.waterTemperature || ''}
                  onChange={(e) => updateField('waterTemperature', parseFloat(e.target.value))}
                  className="mt-1 pr-10"
                />
                <Thermometer className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="salinity">Salinity (ppt)</Label>
              <div className="relative">
                <Input
                  id="salinity"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 35.0"
                  value={locationData.salinity || ''}
                  onChange={(e) => updateField('salinity', parseFloat(e.target.value))}
                  className="mt-1 pr-10"
                />
                <Droplets className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="ph">pH Level</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="e.g., 7.8"
                value={locationData.ph || ''}
                onChange={(e) => updateField('ph', parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="dissolvedOxygen">Dissolved Oxygen (mg/L)</Label>
              <Input
                id="dissolvedOxygen"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 6.5"
                value={locationData.dissolvedOxygen || ''}
                onChange={(e) => updateField('dissolvedOxygen', parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="weather">Weather Conditions *</Label>
              <Select
                value={locationData.weather || ''}
                onValueChange={(value) => updateField('weather', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((weather) => (
                    <SelectItem key={weather} value={weather}>
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4" />
                        {weather}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Any additional observations about the location or environmental conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., High tide conditions, nearby industrial activities, unusual water coloration..."
            value={locationData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Required Fields</h4>
              <p className="text-sm text-orange-700 mb-2">
                Please ensure all required fields (*) are completed before proceeding:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li className="flex items-center gap-2">
                  {locationData.locationName ? '✅' : '❌'} Location Name
                </li>
                <li className="flex items-center gap-2">
                  {locationData.waterBody ? '✅' : '❌'} Water Body
                </li>
                <li className="flex items-center gap-2">
                  {locationData.depth > 0 ? '✅' : '❌'} Water Depth
                </li>
                <li className="flex items-center gap-2">
                  {locationData.weather ? '✅' : '❌'} Weather Conditions
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious} disabled>
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isStepValid()}
          className="gap-2"
        >
          Continue to Species Identification
          <span className="text-xs">→</span>
        </Button>
      </div>
    </div>
  )
}