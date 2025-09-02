import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import ProductJourneyVisualization from '@/components/supply-chain/ProductJourneyVisualization'
import SupplyChainWorkflowForm from '@/components/supply-chain/SupplyChainWorkflowForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

interface SupplyChainDetailPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: SupplyChainDetailPageProps): Promise<Metadata> {
  return {
    title: `Product Journey ${params.id} | TracceAqua Dashboard`,
    description: `View and manage supply chain record ${params.id}.`,
  }
}

// Mock function to simulate fetching record data
async function getSupplyChainRecord(id: string) {
  // TODO: Replace with actual API call
  if (id === 'not-found') {
    return null
  }
  
  return {
    productId: `SC-2025-${id.padStart(3, '0')}`,
    batchId: `BATCH-${id.padStart(3, '0')}`,
    sourceType: 'FARMED' as const,
    species: {
      scientificName: 'Crassostrea gasar',
      commonName: 'West African Oyster'
    },
    quantity: 5000,
    unit: 'pieces',
    origin: {
      location: 'Lagos Lagoon Oyster Farm',
      coordinates: '6.4541, 3.3947',
      facility: 'Aqua-Tech Farms Ltd'
    },
    stages: [
      {
        id: 'hatchery',
        name: 'Hatchery',
        status: 'COMPLETED' as const,
        startedAt: '2025-06-01T08:00:00Z',
        completedAt: '2025-06-15T17:00:00Z',
        location: 'Lagos Hatchery',
        responsible: 'Dr. James Adebayo',
        data: {
          broodstock: 'Local strain',
          larvaeCount: 1000000,
          fertilizationRate: 85
        },
        notes: 'Successful spawning with high fertilization rate'
      },
      {
        id: 'growout',
        name: 'Grow-out',
        status: 'COMPLETED' as const,
        startedAt: '2025-06-15T09:00:00Z',
        completedAt: '2025-08-15T16:00:00Z',
        location: 'Lagos Lagoon Farm',
        responsible: 'John Okafor',
        data: {
          stockingDensity: 500,
          growthRate: '2.5mm/month',
          mortality: 15
        },
        notes: 'Good growth conditions, low mortality rate'
      },
      {
        id: 'harvest',
        name: 'Harvest',
        status: 'COMPLETED' as const,
        startedAt: '2025-08-20T06:00:00Z',
        completedAt: '2025-08-20T14:00:00Z',
        location: 'Lagos Lagoon Farm',
        responsible: 'John Okafor',
        data: {
          harvestMethod: 'Hand Picking',
          quantity: 5000,
          size: '45-60mm',
          quality: 'Premium'
        },
        notes: 'Excellent quality harvest, market size reached'
      },
      {
        id: 'processing',
        name: 'Processing',
        status: 'IN_PROGRESS' as const,
        startedAt: '2025-08-21T08:00:00Z',
        location: 'Marina Processing Plant',
        responsible: 'Sarah Williams',
        data: {
          processMethod: 'Fresh (Live)',
          packagingType: 'Mesh bags, 50 pieces each'
        },
        notes: 'Processing for fresh market distribution'
      },
      {
        id: 'distribution',
        name: 'Distribution',
        status: 'PENDING' as const
      },
      {
        id: 'retail',
        name: 'Retail',
        status: 'PENDING' as const
      }
    ],
    currentStage: 'Processing',
    creator: {
      name: 'John Okafor',
      organization: 'Aqua-Tech Farms Ltd'
    },
    qrCodeGenerated: true,
    blockchainRecorded: false,
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2025-08-21T14:30:00Z'
  }
}

export default async function SupplyChainDetailPage({ 
  params, 
  searchParams 
}: SupplyChainDetailPageProps) {
  const record = await getSupplyChainRecord(params.id)
  const mode = searchParams.mode as string

  if (!record) {
    notFound()
  }

  // If in edit mode, show the workflow form
  if (mode === 'edit') {
    const handleBack = () => {
      redirect(`/dashboard/supply-chain/${params.id}`)
    }

    const handleSubmit = async (formData: any) => {
      console.log('Supply chain record updated:', formData)
      // TODO: Integrate with API service
      redirect(`/dashboard/supply-chain/${params.id}`)
    }

    const handleSaveDraft = async (draftData: any) => {
      console.log('Draft saved:', draftData)
      // TODO: Integrate with API service
    }

    const handleClose = () => {
      redirect(`/dashboard/supply-chain/${params.id}`)
    }

    // Convert record data to form data format
    const initialFormData = {
      productId: record.productId,
      batchId: record.batchId,
      sourceType: record.sourceType,
      species: record.species,
      estimatedQuantity: record.quantity,
      unit: record.unit,
      stages: record.stages.reduce((acc, stage) => ({
        ...acc,
        [stage.id]: {
          completed: stage.status === 'COMPLETED',
          startDate: stage.startedAt?.split('T')[0],
          completedDate: stage.completedAt?.split('T')[0],
          location: stage.location,
          responsible: stage.responsible,
          data: stage.data || {},
          photos: [],
          documents: [],
          notes: stage.notes || ''
        }
      }), {}),
      tags: [],
      publiclyVisible: true,
      qrCodeGenerated: record.qrCodeGenerated
    }

    return (
      <SupplyChainWorkflowForm
        sourceType={record.sourceType}
        initialData={initialFormData}
        mode="edit"
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onBack={handleBack}
        onClose={handleClose}
      />
    )
  }

  // View mode - show product journey
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/supply-chain">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Supply Chain
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Journey</h1>
            <p className="text-gray-600">{record.productId} - {record.species.commonName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record.currentStage !== 'Retail' && (
            <Link href={`/dashboard/supply-chain/${params.id}?mode=edit`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Update Record
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Product Journey Visualization */}
      <ProductJourneyVisualization
        data={record}
        mode="full"
        showTimeline={true}
        showDetails={true}
      />
    </div>
  )
}