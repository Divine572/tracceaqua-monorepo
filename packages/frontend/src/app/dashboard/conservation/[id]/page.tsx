
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import ConservationFormWizard from '@/components/conservation/ConservationFormWizard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Eye, Calendar, User, MapPin, Fish } from 'lucide-react'
import Link from 'next/link'
import { conservationApi } from '@/services/conservationApi'
import type { ConservationFormData } from '@/components/conservation/ConservationFormWizard'

interface ConservationDetailPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: ConservationDetailPageProps): Promise<Metadata> {
  try {
    const record = await conservationApi.getRecord(params.id)
    if (!record) {
      return {
        title: 'Conservation Record Not Found | TracceAqua Dashboard',
        description: 'The requested conservation record could not be found.',
      }
    }
    
    return {
      title: `${record.samplingId} - ${record.species.commonName} | TracceAqua Dashboard`,
      description: `Conservation record for ${record.species.commonName} (${record.species.scientificName}) at ${record.location.name}.`,
    }
  } catch (error) {
    return {
      title: `Conservation Record ${params.id} | TracceAqua Dashboard`,
      description: `View and manage conservation record ${params.id}.`,
    }
  }
}

// Mock function to simulate fetching record data
async function getConservationRecord(id: string) {
  try {
    // Use the actual API service
    return await conservationApi.getRecord(id)
  } catch (error) {
    console.error('Failed to fetch conservation record:', error)
    return null
  }
}

export default async function ConservationDetailPage({ 
  params, 
  searchParams 
}: ConservationDetailPageProps) {
  const record = await getConservationRecord(params.id)
  const mode = searchParams.mode as string

  if (!record) {
    notFound()
  }

  // If in edit mode, show the form wizard
  if (mode === 'edit') {
    const handleClose = () => {
      redirect(`/dashboard/conservation/${params.id}`)
    }

    const handleSubmit = async (formData: ConservationFormData) => {
      try {
        await conservationApi.updateRecord({
          id: params.id,
          // Map form data to update request format
          locationName: formData.location.locationName,
          waterBody: formData.location.waterBody,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          depth: formData.location.depth,
          waterTemperature: formData.location.waterTemperature,
          salinity: formData.location.salinity,
          ph: formData.location.ph,
          dissolvedOxygen: formData.location.dissolvedOxygen,
          weather: formData.location.weather,
          locationNotes: formData.location.notes,
          scientificName: formData.species.scientificName,
          commonName: formData.species.commonName,
          family: formData.species.family,
          characteristics: formData.species.characteristics,
          estimatedAge: formData.species.estimatedAge,
          length: formData.species.size.length,
          weight: formData.species.size.weight,
          condition: formData.species.condition,
          method: formData.sampling.method,
          collectionDate: formData.sampling.collectionDate,
          collectionTime: formData.sampling.collectionTime,
          sampleSize: formData.sampling.sampleSize,
          equipment: formData.sampling.equipment,
          preservationMethod: formData.sampling.preservationMethod,
          chainOfCustody: formData.sampling.chainOfCustody,
          testTypes: formData.labTests.testTypes,
          testDate: formData.labTests.testDate,
          laboratoryName: formData.labTests.laboratoryName,
          technicianName: formData.labTests.technicianName,
          labNotes: formData.labTests.notes,
          summary: formData.results.summary,
          recommendations: formData.results.recommendations,
          tags: formData.results.tags,
          publiclyVisible: formData.results.publiclyVisible,
          researchPurpose: formData.results.researchPurpose,
        })
        redirect(`/dashboard/conservation/${params.id}`)
      } catch (error) {
        console.error('Failed to update conservation record:', error)
        throw error
      }
    }

    const handleSaveDraft = async (draftData: Partial<ConservationFormData>) => {
      try {
        await conservationApi.saveDraft(draftData)
      } catch (error) {
        console.error('Failed to save draft:', error)
        throw error
      }
    }

    // Convert record data to form data format
    const initialData: Partial<ConservationFormData> = {
      location: {
        locationName: record.location.name,
        waterBody: record.location.waterBody,
        latitude: record.location.coordinates ? parseFloat(record.location.coordinates.split(',')[0]) : undefined,
        longitude: record.location.coordinates ? parseFloat(record.location.coordinates.split(',')[1]) : undefined,
        depth: record.location.depth || 0,
        waterTemperature: record.location.environmentalData?.waterTemperature || 0,
        salinity: record.location.environmentalData?.salinity || 0,
        ph: record.location.environmentalData?.ph || 0,
        dissolvedOxygen: record.location.environmentalData?.dissolvedOxygen || 0,
        weather: record.location.environmentalData?.weather || '',
        notes: record.location.environmentalData?.notes || ''
      },
      species: {
        scientificName: record.species.scientificName,
        commonName: record.species.commonName,
        family: record.species.family,
        photos: [], // Files would be handled separately in a real implementation
        characteristics: record.species.characteristics || '',
        estimatedAge: '',
        size: {
          length: record.species.size?.length || 0,
          weight: record.species.size?.weight || 0
        },
        condition: record.species.condition || ''
      },
      sampling: {
        method: record.sampling.method,
        equipment: record.sampling.equipment,
        collectionDate: record.sampling.collectionDate,
        collectionTime: '',
        sampleSize: record.sampling.sampleSize,
        preservationMethod: record.sampling.preservationMethod || '',
        chainOfCustody: ''
      },
      labTests: {
        testTypes: record.labTests.testTypes,
        testResults: [], // Files would be handled separately
        certificates: [], // Files would be handled separately
        testDate: record.labTests.testDate || '',
        laboratoryName: record.labTests.laboratoryName || '',
        technicianName: '',
        notes: ''
      },
      results: {
        summary: record.results.summary,
        recommendations: record.results.recommendations || '',
        tags: record.results.tags,
        publiclyVisible: record.results.publiclyVisible,
        researchPurpose: ''
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <ConservationFormWizard
          mode="edit"
          recordId={params.id}
          initialData={initialData}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    )
  }

  // View mode - show record details
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/conservation">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Conservation
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conservation Record</h1>
            <p className="text-gray-600">{record.samplingId} - {record.species.commonName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(record.status === 'DRAFT' || record.status === 'REJECTED') && (
            <Link href={`/dashboard/conservation/${params.id}?mode=edit`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Record
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Record Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Record Overview</CardTitle>
            <Badge 
              variant={
                record.status === 'VERIFIED' ? 'default' :
                record.status === 'SUBMITTED' ? 'secondary' :
                'outline'
              }
            >
              {record.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Fish className="h-4 w-4" />
                Species Information
              </div>
              <div>
                <p className="font-medium">{record.species.commonName}</p>
                <p className="text-sm text-gray-600 italic">{record.species.scientificName}</p>
                <p className="text-sm text-gray-600">{record.species.family}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <div>
                <p className="font-medium">{record.location.name}</p>
                <p className="text-sm text-gray-600">{record.location.waterBody}</p>
                {record.location.coordinates && (
                  <p className="text-sm text-gray-600">{record.location.coordinates}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Sampling Details
              </div>
              <div>
                <p className="font-medium">{record.sampling.method}</p>
                <p className="text-sm text-gray-600">
                  {new Date(record.sampling.collectionDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">{record.sampling.sampleSize} specimens</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Creator
              </div>
              <div>
                <p className="font-medium">{record.creator.name}</p>
                {record.creator.organization && (
                  <p className="text-sm text-gray-600">{record.creator.organization}</p>
                )}
                <p className="text-sm text-gray-600">
                  {new Date(record.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Research Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{record.results.summary}</p>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {record.results.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}