'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileText, X, FlaskConical, Calendar, User, AlertCircle, CheckCircle, FileIcon, Award } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LabTestUploadStepProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const availableTestTypes = [
  'Heavy Metals Analysis',
  'Microbiological Testing',
  'Biotoxin Analysis', 
  'Pesticide Residues',
  'Antibiotic Residues',
  'Nutritional Analysis',
  'DNA Barcoding',
  'Parasite Examination',
  'Water Quality Assessment',
  'Tissue Analysis',
  'Genetic Analysis',
  'Histopathology',
  'Morphometric Analysis'
]

interface FileWithType {
  file: File
  type: 'result' | 'certificate'
}

export default function LabTestUploadStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: LabTestUploadStepProps) {
  const [labData, setLabData] = useState(data.labTests || {
    testTypes: [],
    testResults: [],
    certificates: [],
    testDate: new Date().toISOString().split('T')[0]
  })
  
  const [uploadedFiles, setUploadedFiles] = useState<FileWithType[]>([])
  const resultFileInputRef = useRef<HTMLInputElement>(null)
  const certificateFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Update parent data when local data changes
  useEffect(() => {
    const testResults = uploadedFiles.filter(f => f.type === 'result').map(f => f.file)
    const certificates = uploadedFiles.filter(f => f.type === 'certificate').map(f => f.file)
    
    const updatedLabData = {
      ...labData,
      testResults,
      certificates
    }
    
    setLabData(updatedLabData)
    updateData({ labTests: updatedLabData })
  }, [uploadedFiles, labData.testTypes, labData.testDate, labData.laboratoryName, labData.technicianName, labData.notes])

  const updateField = (field: string, value: any) => {
    const newData = { ...labData, [field]: value }
    setLabData(newData)
  }

  // Handle test type selection
  const toggleTestType = (testType: string) => {
    const currentTests = labData.testTypes || []
    const isSelected = currentTests.includes(testType)
    
    if (isSelected) {
      updateField('testTypes', currentTests.filter((item: string) => item !== testType))
    } else {
      updateField('testTypes', [...currentTests, testType])
    }
  }

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'result' | 'certificate') => {
    const files = Array.from(event.target.files || [])
    
    // Validate file types
    const validTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, image, Word, or Excel files only.",
        variant: "destructive"
      })
      return
    }

    // Validate file sizes (max 10MB per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each file must be smaller than 10MB.",
        variant: "destructive"
      })
      return
    }

    // Add new files
    const newFiles = files.map(file => ({ file, type: fileType }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    toast({
      title: "Files Uploaded",
      description: `${files.length} ${fileType} file(s) uploaded successfully.`,
    })

    // Clear input
    if (event.target) {
      event.target.value = ''
    }
  }

  // Remove file
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
    
    toast({
      title: "File Removed",
      description: "File has been removed from the upload list.",
    })
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(extension || '')) return <FileText className="h-4 w-4 text-red-500" />
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) return <FileIcon className="h-4 w-4 text-blue-500" />
    if (['doc', 'docx'].includes(extension || '')) return <FileText className="h-4 w-4 text-blue-600" />
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) return <FileText className="h-4 w-4 text-green-600" />
    return <FileIcon className="h-4 w-4 text-gray-500" />
  }

  // Validation
  const isStepValid = () => {
    return (
      (labData.testTypes || []).length > 0 &&
      labData.testDate &&
      uploadedFiles.some(f => f.type === 'result') // At least one test result required
    )
  }

  const handleNext = () => {
    if (isStepValid()) {
      onNext()
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please select test types, enter test date, and upload at least one test result file.",
        variant: "destructive"
      })
    }
  }

  const testResults = uploadedFiles.filter(f => f.type === 'result')
  const certificates = uploadedFiles.filter(f => f.type === 'certificate')

  return (
    <div className="space-y-6">
      {/* Test Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Test Types *
          </CardTitle>
          <CardDescription>
            Select all laboratory tests that were or will be performed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTestTypes.map((testType) => {
              const isSelected = (labData.testTypes || []).includes(testType)
              return (
                <div
                  key={testType}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-900' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => toggleTestType(testType)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleTestType(testType)}
                  />
                  <span className="text-sm font-medium">{testType}</span>
                </div>
              )
            })}
          </div>

          {/* Selected Tests Summary */}
          {(labData.testTypes || []).length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Selected Tests:</Label>
              <div className="flex flex-wrap gap-2">
                {(labData.testTypes || []).map((testType: string) => (
                  <Badge key={testType} variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {testType}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Test Results *
          </CardTitle>
          <CardDescription>
            Upload laboratory test result files (PDF, images, Excel, Word documents)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={resultFileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv"
              onChange={(e) => handleFileSelect(e, 'result')}
              className="hidden"
            />
            
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drop test result files here or click to upload
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => resultFileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Test Results
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              PDF, Word, Excel, CSV, or Images • Max 10MB each
            </p>
          </div>

          {/* Test Results List */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploaded Test Results:</Label>
              {testResults.map((fileWithType, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(fileWithType.file.name)}
                    <div>
                      <p className="text-sm font-medium">{fileWithType.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(fileWithType.file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFile(uploadedFiles.indexOf(fileWithType))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificates & Accreditation
          </CardTitle>
          <CardDescription>
            Upload laboratory accreditation certificates or quality assurance documents (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={certificateFileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleFileSelect(e, 'certificate')}
              className="hidden"
            />
            
            <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drop certificate files here or click to upload
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => certificateFileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Certificates
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              PDF, Word, or Images • Max 10MB each
            </p>
          </div>

          {/* Certificates List */}
          {certificates.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploaded Certificates:</Label>
              {certificates.map((fileWithType, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(fileWithType.file.name)}
                    <div>
                      <p className="text-sm font-medium">{fileWithType.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(fileWithType.file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFile(uploadedFiles.indexOf(fileWithType))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Information */}
      <Card>
        <CardHeader>
          <CardTitle>Laboratory Information</CardTitle>
          <CardDescription>
            Provide details about the testing laboratory and personnel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testDate">Test Date *</Label>
              <div className="relative">
                <Input
                  id="testDate"
                  type="date"
                  value={labData.testDate || ''}
                  onChange={(e) => updateField('testDate', e.target.value)}
                  className="mt-1 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="laboratoryName">Laboratory Name</Label>
              <Input
                id="laboratoryName"
                placeholder="e.g., Marine Biology Research Lab"
                value={labData.laboratoryName || ''}
                onChange={(e) => updateField('laboratoryName', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="technicianName">Technician/Analyst Name</Label>
            <div className="relative">
              <Input
                id="technicianName"
                placeholder="e.g., Dr. Sarah Wilson"
                value={labData.technicianName || ''}
                onChange={(e) => updateField('technicianName', e.target.value)}
                className="mt-1 pr-10"
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Any additional information about the laboratory tests or procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Special testing protocols used, deviations from standard procedures, additional quality control measures..."
            value={labData.notes || ''}
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
              <h4 className="font-medium text-orange-900 mb-1">Required Information</h4>
              <p className="text-sm text-orange-700 mb-2">
                Complete the following to continue:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li className="flex items-center gap-2">
                  {(labData.testTypes || []).length > 0 ? '✅' : '❌'} Test Types Selected
                </li>
                <li className="flex items-center gap-2">
                  {labData.testDate ? '✅' : '❌'} Test Date
                </li>
                <li className="flex items-center gap-2">
                  {testResults.length > 0 ? '✅' : '❌'} Test Results Uploaded
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
          Continue to Final Review
          <span className="text-xs">→</span>
        </Button>
      </div>
    </div>
  )
}