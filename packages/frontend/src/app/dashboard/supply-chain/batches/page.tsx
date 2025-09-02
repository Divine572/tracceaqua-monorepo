// File: packages/frontend/src/app/dashboard/supply-chain/batches/page.tsx
import { Metadata } from 'next'
import BatchManagementInterface from '@/components/supply-chain/BatchManagementInterface'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Batch Management | TracceAqua Dashboard',
  description: 'Manage groups of products in batches for efficient supply chain tracking.',
  keywords: ['batch management', 'supply chain', 'product groups', 'traceability'],
}

export default function BatchesPage() {
  const handleCreateBatch = () => {
    redirect('/dashboard/supply-chain/create')
  }

  const handleEditBatch = (batchId: string) => {
    redirect(`/dashboard/supply-chain/batches/${batchId}?mode=edit`)
  }

  const handleViewBatch = (batchId: string) => {
    redirect(`/dashboard/supply-chain/batches/${batchId}`)
  }

  const handleDeleteBatch = async (batchId: string) => {
    // TODO: Integrate with API service
    console.log('Deleting batch:', batchId)
  }

  return (
    <div className="space-y-6">
      <BatchManagementInterface
        onCreateBatch={handleCreateBatch}
        onEditBatch={handleEditBatch}
        onViewBatch={handleViewBatch}
        onDeleteBatch={handleDeleteBatch}
      />
    </div>
  )
}