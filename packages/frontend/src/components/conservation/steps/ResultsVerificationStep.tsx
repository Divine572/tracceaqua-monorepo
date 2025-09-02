'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, FileCheck, MapPin, Fish, FlaskConical, Upload, Globe, Lock, AlertCircle, Eye, Tag, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResultsVerificationStepProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const suggestedTags = [
  'Conservation Study',
  'Biodiversity Assessment',
  'Water Quality',
  'Species Monitoring', 
  'Environmental Impact',
  'Sustainable Fishing',
  'Marine Biology',
  'Ecosystem Health',
  'Pollution Study',
  'Climate Change',
  'Habitat Assessment',
  'Population Survey'
]

export default function ResultsVerificationStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: ResultsVerificationStepProps) {
  const [resultsData, setResultsData] = useState(data.results || {
    tags: [],
    publiclyVisible: true,
    researchPurpose: ''
  })
  const [newTag, setNewTag] = useState('')
  const { toast } = useToast()

  // Update parent data when local data changes
  useEffect(() => {
    updateData({ results: resultsData })
  }, [resultsData, updateData])

  const updateField = (field: string, value: any) => {
    setResultsData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  // Add tag
  const addTag = (tag: string) => {
    const currentTags = resultsData.tags || []
    if (!currentTags.includes(tag)) {
      updateField('tags', [...currentTags, tag])
    }
  }

  // Add custom tag
  const addCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim())
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    const currentTags = resultsData.tags || []
    updateField('tags', currentTags.filter((t: string) => t !== tag))
  }

  // Format data for display
  const formatLocationData = () => {
    const location = data.location || {}
    return {
      name: location.locationName || 'Not specified',
      waterBody: location.waterBody || 'Not specified',
      coordinates: location.latitude && location.longitude 
        ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        : 'Not available',
      depth: location.depth ? `${location.depth}m` : 'Not specified',
      weather: location.weather || 'Not specified'
    }
  }

  const formatSpeciesData = () => {
    const species = data.species || {}
    return {
      scientific: species.scientificName || 'Not specified',
      common: species.commonName || 'Not specified', 
      family: species.family || 'Not specified',
      photos: (species.photos || []).length,
      size: species.size ? `${species.size.length || 0}mm, ${species.size.weight || 0}g` : 'Not measured',
      condition: species.condition || 'Not assessed'
    }
  }

  const formatSamplingData = () => {
    const sampling = data.sampling || {}
    return {
      method: sampling.method || 'Not specified',
      date: sampling.collectionDate || 'Not specified',
      time: sampling.collectionTime || 'Not specified',
      sampleSize: sampling.sampleSize || 0,
      equipment: (sampling.equipment || []).length,
      preservation: sampling.preservationMethod || 'Not specified'
    }
  }

  const formatLabData = () => {
    const lab = data.labTests || {}
    return {
      testTypes: (lab.testTypes || []).length,
      testResults: (lab.testResults || []).length,
      certificates: (lab.certificates || []).length,
      laboratory: lab.laboratoryName || 'Not specified',
      date: lab.testDate || 'Not specified'
    }
  }

  // Validation
  const isStepValid = () => {
    return (
      resultsData.summary?.trim() &&
      (resultsData.tags || []).length > 0
    )
  }

  const handleSubmit = () => {
    if (isStepValid()) {
      onNext() // This will trigger the final submission in the parent component
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please provide a summary and at least one tag.",
        variant: "destructive"
      })
    }
  }

  const locationData = formatLocationData()
  const speciesData = formatSpeciesData()
  const samplingData = formatSamplingData()
  const labData = formatLabData()

  return (
    <div className="space-y-6">
      {/* Record Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Record Summary
          </CardTitle>
          <CardDescription>
            Review all the information collected for this conservation record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Summary */}
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <MapPin className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Location & Environment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Location:</strong> {locationData.name}</div>
                <div><strong>Water Body:</strong> {locationData.waterBody}</div>
                <div><strong>Coordinates:</strong> {locationData.coordinates}</div>
                <div><strong>Depth:</strong> {locationData.depth}</div>
                <div><strong>Weather:</strong> {locationData.weather}</div>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          </div>

          {/* Species Summary */}
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
            <Fish className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">Species Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Scientific:</strong> <em>{speciesData.scientific}</em></div>
                <div><strong>Common:</strong> {speciesData.common}</div>
                <div><strong>Family:</strong> {speciesData.family}</div>
                <div><strong>Photos:</strong> {speciesData.photos} uploaded</div>
                <div><strong>Size:</strong> {speciesData.size}</div>
                <div><strong>Condition:</strong> {speciesData.condition}</div>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          </div>

          {/* Sampling Summary */}
          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
            <FlaskConical className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">Sampling Methods</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Method:</strong> {samplingData.method}</div>
                <div><strong>Date & Time:</strong> {samplingData.date} {samplingData.time}</div>
                <div><strong>Sample Size:</strong> {samplingData.sampleSize} specimens</div>
                <div><strong>Equipment:</strong> {samplingData.equipment} items</div>
                <div><strong>Preservation:</strong> {samplingData.preservation}</div>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          </div>

          {/* Lab Tests Summary */}
          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
            <Upload className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-2">Laboratory Tests</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Test Types:</strong> {labData.testTypes} selected</div>
                <div><strong>Test Date:</strong> {labData.date}</div>
                <div><strong>Results:</strong> {labData.testResults} files uploaded</div>
                <div><strong>Certificates:</strong> {labData.certificates} files uploaded</div>
                <div><strong>Laboratory:</strong> {labData.laboratory}</div>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Final Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary & Conclusions *</CardTitle>
          <CardDescription>
            Provide a comprehensive summary of this conservation record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Summarize the key findings, observations, and conclusions from this conservation record. Include any important patterns, anomalies, or recommendations for future research..."
            value={resultsData.summary || ''}
            onChange={(e) => updateField('summary', e.target.value)}
            rows={6}
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Suggest future actions, research directions, or conservation measures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Based on the findings, what recommendations do you have for future conservation efforts, additional research, or management actions?"
            value={resultsData.recommendations || ''}
            onChange={(e) => updateField('recommendations', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags & Keywords *
          </CardTitle>
          <CardDescription>
            Add tags to help categorize and make this record discoverable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested Tags */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Suggested Tags:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Add Custom Tag:</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomTag}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Selected Tags */}
          {(resultsData.tags || []).length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Selected Tags:</Label>
              <div className="flex flex-wrap gap-2">
                {(resultsData.tags || []).map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-red-100"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Privacy & Sharing Settings
          </CardTitle>
          <CardDescription>
            Control who can access this conservation record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              {resultsData.publiclyVisible ? (
                <Eye className="h-5 w-5 text-green-600 mt-1" />
              ) : (
                <Lock className="h-5 w-5 text-gray-600 mt-1" />
              )}
              <div>
                <h4 className="font-semibold">
                  {resultsData.publiclyVisible ? 'Public Access' : 'Private Access'}
                </h4>
                <p className="text-sm text-gray-600">
                  {resultsData.publiclyVisible 
                    ? 'This record will be visible to all users and researchers'
                    : 'This record will only be visible to you and authorized personnel'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={resultsData.publiclyVisible || false}
              onCheckedChange={(checked) => updateField('publiclyVisible', checked)}
            />
          </div>

          <div>
            <Label htmlFor="researchPurpose">Research Purpose</Label>
            <Input
              id="researchPurpose"
              placeholder="e.g., Biodiversity assessment for marine protected area planning"
              value={resultsData.researchPurpose || ''}
              onChange={(e) => updateField('researchPurpose', e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Ready for Submission</h4>
              <p className="text-sm text-orange-700 mb-2">
                Final requirements:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li className="flex items-center gap-2">
                  {resultsData.summary ? '✅' : '❌'} Summary & Conclusions
                </li>
                <li className="flex items-center gap-2">
                  {(resultsData.tags || []).length > 0 ? '✅' : '❌'} Tags & Keywords
                </li>
              </ul>
              {isStepValid() && (
                <p className="text-sm text-green-700 mt-2 font-medium">
                  ✅ All requirements met - ready to submit!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={!isStepValid()}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <FileCheck className="h-4 w-4" />
          Submit Conservation Record
        </Button>
      </div>
    </div>
  )
}