'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, X, Fish, Ruler, Weight, Calendar, AlertCircle, ImageIcon, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SpeciesIdentificationStepProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

// Common shellfish families in Nigerian waters
const shellfishFamilies = [
  'Ostreidae (Oysters)',
  'Mytilidae (Mussels)', 
  'Pectinidae (Scallops)',
  'Cardiidae (Cockles)',
  'Veneridae (Venus clams)',
  'Arcidae (Ark shells)',
  'Penaeidae (Prawns/Shrimps)',
  'Portunidae (Swimming crabs)',
  'Ocypodidae (Fiddler crabs)',
  'Palinuridae (Spiny lobsters)'
]

const conditionOptions = [
  'Excellent',
  'Good', 
  'Fair',
  'Poor',
  'Diseased',
  'Parasitized',
  'Damaged'
]

const ageEstimates = [
  'Juvenile',
  'Sub-adult',
  'Adult',
  'Mature adult',
  'Senescent',
  'Unknown'
]

export default function SpeciesIdentificationStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: SpeciesIdentificationStepProps) {
  const [speciesData, setSpeciesData] = useState(data.species || {
    photos: [],
    size: { length: 0, weight: 0 }
  })
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Update parent data when local data changes
  useEffect(() => {
    updateData({ species: speciesData })
  }, [speciesData, updateData])

  // Generate preview URLs for images
  useEffect(() => {
    const newPreviews = speciesData.photos?.map((file: File) => 
      URL.createObjectURL(file)
    ) || []
    
    // Clean up old preview URLs
    previews.forEach((url: string) => URL.revokeObjectURL(url))
    setPreviews(newPreviews)
    
    return () => {
      newPreviews.forEach((url: string) => URL.revokeObjectURL(url))
    }
  }, [speciesData.photos])

  const updateField = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields like size.length
      const [parentField, childField] = field.split('.')
      setSpeciesData((prev: any) => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: value
        }
      }))
    } else {
      setSpeciesData((prev: any) => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please only upload JPEG, PNG, or WebP images.",
        variant: "destructive"
      })
      return
    }

    // Validate file sizes (max 5MB per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large", 
        description: "Each image must be smaller than 5MB.",
        variant: "destructive"
      })
      return
    }

    // Limit total number of photos to 5
    const currentPhotos = speciesData.photos || []
    const totalPhotos = currentPhotos.length + files.length
    
    if (totalPhotos > 5) {
      toast({
        title: "Too Many Photos",
        description: "You can upload a maximum of 5 photos.",
        variant: "destructive"
      })
      return
    }

    // Add new files
    const newPhotos = [...currentPhotos, ...files]
    updateField('photos', newPhotos)
    
    toast({
      title: "Photos Added",
      description: `${files.length} photo(s) uploaded successfully.`,
    })
  }

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = [...(speciesData.photos || [])]
    newPhotos.splice(index, 1)
    updateField('photos', newPhotos)
    
    toast({
      title: "Photo Removed",
      description: "Photo has been removed from the record.",
    })
  }

  // Validation
  const isStepValid = () => {
    return (
      speciesData.scientificName?.trim() &&
      speciesData.commonName?.trim() &&
      speciesData.family &&
      speciesData.photos?.length > 0
    )
  }

  const handleNext = () => {
    if (isStepValid()) {
      onNext()
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields and upload at least one photo.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Species Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5" />
            Species Information
          </CardTitle>
          <CardDescription>
            Provide detailed taxonomic identification of the species
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scientificName">Scientific Name *</Label>
              <Input
                id="scientificName"
                placeholder="e.g., Crassostrea gasar"
                value={speciesData.scientificName || ''}
                onChange={(e) => updateField('scientificName', e.target.value)}
                className="mt-1 italic"
              />
              <p className="text-xs text-gray-500 mt-1">Use proper binomial nomenclature</p>
            </div>
            
            <div>
              <Label htmlFor="commonName">Common Name *</Label>
              <Input
                id="commonName"
                placeholder="e.g., West African Oyster"
                value={speciesData.commonName || ''}
                onChange={(e) => updateField('commonName', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="family">Taxonomic Family *</Label>
            <Select
              value={speciesData.family || ''}
              onValueChange={(value) => updateField('family', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select taxonomic family" />
              </SelectTrigger>
              <SelectContent>
                {shellfishFamilies.map((family) => (
                  <SelectItem key={family} value={family}>
                    {family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Species Photos *
          </CardTitle>
          <CardDescription>
            Upload clear, high-quality photos showing key identifying features (1-5 photos)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drop photos here or click to upload
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose Photos
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              JPEG, PNG, or WebP • Max 5MB each • Up to 5 photos
            </p>
          </div>

          {/* Photo Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Species photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                    {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Physical Characteristics
          </CardTitle>
          <CardDescription>
            Record physical measurements and observations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="length">Length (mm)</Label>
              <div className="relative">
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 45.5"
                  value={speciesData.size?.length || ''}
                  onChange={(e) => updateField('size.length', parseFloat(e.target.value))}
                  className="mt-1 pr-10"
                />
                <Ruler className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (grams)</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 12.8"
                  value={speciesData.size?.weight || ''}
                  onChange={(e) => updateField('size.weight', parseFloat(e.target.value))}
                  className="mt-1 pr-10"
                />
                <Weight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="estimatedAge">Estimated Age</Label>
              <Select
                value={speciesData.estimatedAge || ''}
                onValueChange={(value) => updateField('estimatedAge', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {ageEstimates.map((age) => (
                    <SelectItem key={age} value={age}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {age}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={speciesData.condition || ''}
                onValueChange={(value) => updateField('condition', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {condition}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle>Identifying Characteristics</CardTitle>
          <CardDescription>
            Describe key morphological features that help identify this species
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Shell color and pattern, distinctive markings, shell shape and texture, presence of spines or ridges, coloration patterns..."
            value={speciesData.characteristics || ''}
            onChange={(e) => updateField('characteristics', e.target.value)}
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
              <h4 className="font-medium text-orange-900 mb-1">Required Information</h4>
              <p className="text-sm text-orange-700 mb-2">
                Complete the following to continue:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li className="flex items-center gap-2">
                  {speciesData.scientificName ? '✅' : '❌'} Scientific Name
                </li>
                <li className="flex items-center gap-2">
                  {speciesData.commonName ? '✅' : '❌'} Common Name
                </li>
                <li className="flex items-center gap-2">
                  {speciesData.family ? '✅' : '❌'} Taxonomic Family
                </li>
                <li className="flex items-center gap-2">
                  {(speciesData.photos?.length > 0) ? '✅' : '❌'} At Least One Photo
                </li>
              </ul>
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
          onClick={handleNext}
          disabled={!isStepValid()}
          className="gap-2"
        >
          Continue to Sampling Methods
          <span className="text-xs">→</span>
        </Button>
      </div>
    </div>
  )
}