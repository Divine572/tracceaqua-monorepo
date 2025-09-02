'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FlaskConical, Clock, Hash, Refrigerator, UserCheck, AlertCircle, Calendar, Plus, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SamplingMethodsStepProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const samplingMethods = [
  'Hand Collection',
  'Dredging',
  'Trawling',
  'Grab Sampling',
  'Core Sampling',
  'Transect Sampling',
  'Quadrat Sampling',
  'Seine Netting',
  'Trap Sampling',
  'Dive Collection'
]

const availableEquipment = [
  'Van Veen Grab',
  'Petersen Grab', 
  'Dredge Net',
  'Sampling Sieve',
  'Collection Bags',
  'GPS Device',
  'Water Quality Meter',
  'Digital Calipers',
  'Precision Scale',
  'Camera',
  'Field Notebook',
  'Sample Containers',
  'Preservation Solution',
  'Thermometer',
  'pH Meter',
  'Salinity Refractometer'
]

const preservationMethods = [
  'Fresh (Live)',
  '70% Ethanol',
  '95% Ethanol', 
  '10% Formalin',
  'Frozen (-20°C)',
  'Refrigerated (4°C)',
  'RNA Later',
  'DMSO Buffer',
  'Dried',
  'None'
]

export default function SamplingMethodsStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: SamplingMethodsStepProps) {
  const [samplingData, setSamplingData] = useState(data.sampling || {
    equipment: [],
    collectionDate: new Date().toISOString().split('T')[0],
    collectionTime: new Date().toTimeString().split(' ')[0].substring(0, 5)
  })
  const { toast } = useToast()

  // Update parent data when local data changes
  useEffect(() => {
    updateData({ sampling: samplingData })
  }, [samplingData, updateData])

  const updateField = (field: string, value: any) => {
    setSamplingData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle equipment selection
  const toggleEquipment = (equipment: string) => {
    const currentEquipment = samplingData.equipment || []
    const isSelected = currentEquipment.includes(equipment)
    
    if (isSelected) {
      updateField('equipment', currentEquipment.filter((item: string) => item !== equipment))
    } else {
      updateField('equipment', [...currentEquipment, equipment])
    }
  }

  // Add custom equipment
  const [customEquipment, setCustomEquipment] = useState('')
  const addCustomEquipment = () => {
    if (customEquipment.trim()) {
      const currentEquipment = samplingData.equipment || []
      if (!currentEquipment.includes(customEquipment.trim())) {
        updateField('equipment', [...currentEquipment, customEquipment.trim()])
        setCustomEquipment('')
        toast({
          title: "Equipment Added",
          description: `"${customEquipment}" has been added to the equipment list.`,
        })
      } else {
        toast({
          title: "Duplicate Equipment",
          description: "This equipment is already in the list.",
          variant: "destructive"
        })
      }
    }
  }

  // Remove custom equipment
  const removeEquipment = (equipment: string) => {
    const currentEquipment = samplingData.equipment || []
    updateField('equipment', currentEquipment.filter((item: string) => item !== equipment))
  }

  // Validation
  const isStepValid = () => {
    return (
      samplingData.method &&
      samplingData.collectionDate &&
      samplingData.collectionTime &&
      samplingData.sampleSize > 0 &&
      samplingData.preservationMethod &&
      (samplingData.equipment || []).length > 0
    )
  }

  const handleNext = () => {
    if (isStepValid()) {
      onNext()
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields to continue.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Sampling Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Sampling Method
          </CardTitle>
          <CardDescription>
            Specify the primary collection method used for sampling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="method">Collection Method *</Label>
            <Select
              value={samplingData.method || ''}
              onValueChange={(value) => updateField('method', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select sampling method" />
              </SelectTrigger>
              <SelectContent>
                {samplingMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      {method}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="collectionDate">Collection Date *</Label>
              <Input
                id="collectionDate"
                type="date"
                value={samplingData.collectionDate || ''}
                onChange={(e) => updateField('collectionDate', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="collectionTime">Collection Time *</Label>
              <div className="relative">
                <Input
                  id="collectionTime"
                  type="time"
                  value={samplingData.collectionTime || ''}
                  onChange={(e) => updateField('collectionTime', e.target.value)}
                  className="mt-1 pr-10"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sampleSize">Sample Size *</Label>
              <div className="relative">
                <Input
                  id="sampleSize"
                  type="number"
                  min="1"
                  placeholder="e.g., 50"
                  value={samplingData.sampleSize || ''}
                  onChange={(e) => updateField('sampleSize', parseInt(e.target.value))}
                  className="mt-1 pr-10"
                />
                <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Number of specimens collected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Used */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Used *</CardTitle>
          <CardDescription>
            Select all equipment and tools used during sampling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Equipment Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableEquipment.map((equipment) => {
              const isSelected = (samplingData.equipment || []).includes(equipment)
              return (
                <div
                  key={equipment}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-900' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => toggleEquipment(equipment)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleEquipment(equipment)}
                  />
                  <span className="text-sm font-medium">{equipment}</span>
                </div>
              )
            })}
          </div>

          {/* Selected Equipment Summary */}
          {(samplingData.equipment || []).length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Selected Equipment:</Label>
              <div className="flex flex-wrap gap-2">
                {(samplingData.equipment || []).map((equipment: string) => (
                  <Badge 
                    key={equipment} 
                    variant="secondary" 
                    className="gap-1 cursor-pointer hover:bg-red-100"
                    onClick={() => removeEquipment(equipment)}
                  >
                    {equipment}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Equipment */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Add Custom Equipment:</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom equipment name"
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomEquipment()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomEquipment}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preservation Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Refrigerator className="h-5 w-5" />
            Sample Preservation
          </CardTitle>
          <CardDescription>
            Specify how samples are being preserved for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="preservationMethod">Preservation Method *</Label>
            <Select
              value={samplingData.preservationMethod || ''}
              onValueChange={(value) => updateField('preservationMethod', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select preservation method" />
              </SelectTrigger>
              <SelectContent>
                {preservationMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    <div className="flex items-center gap-2">
                      <Refrigerator className="h-4 w-4" />
                      {method}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chain of Custody */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Chain of Custody
          </CardTitle>
          <CardDescription>
            Document the handling and transfer of samples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Collected by Dr. Jane Smith at 10:30 AM. Samples immediately placed in cooler with ice packs. Transported to marine lab by research vessel at 2:00 PM. Received by lab technician Mark Johnson at 4:30 PM..."
            value={samplingData.chainOfCustody || ''}
            onChange={(e) => updateField('chainOfCustody', e.target.value)}
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
                  {samplingData.method ? '✅' : '❌'} Collection Method
                </li>
                <li className="flex items-center gap-2">
                  {samplingData.collectionDate ? '✅' : '❌'} Collection Date
                </li>
                <li className="flex items-center gap-2">
                  {samplingData.collectionTime ? '✅' : '❌'} Collection Time
                </li>
                <li className="flex items-center gap-2">
                  {samplingData.sampleSize > 0 ? '✅' : '❌'} Sample Size
                </li>
                <li className="flex items-center gap-2">
                  {samplingData.preservationMethod ? '✅' : '❌'} Preservation Method
                </li>
                <li className="flex items-center gap-2">
                  {(samplingData.equipment || []).length > 0 ? '✅' : '❌'} Equipment Selection
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
          Continue to Lab Tests
          <span className="text-xs">→</span>
        </Button>
      </div>
    </div>
  )
}