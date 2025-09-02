import { Metadata } from 'next'
import SourceTypeSelector from '@/components/supply-chain/SourceTypeSelector'
import SupplyChainWorkflowForm from '@/components/supply-chain/SupplyChainWorkflowForm'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'New Supply Chain Record | TracceAqua Dashboard',
  description: 'Create a new shellfish supply chain traceability record.',
}

interface SupplyChainCreatePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SupplyChainCreatePage({ searchParams }: SupplyChainCreatePageProps) {
  const sourceType = searchParams.source as 'FARMED' | 'WILD_CAPTURE' | undefined

  const handleBack = () => {
    if (sourceType) {
      // Go back to source selection
      redirect('/dashboard/supply-chain/create')
    } else {
      // Go back to dashboard
      redirect('/dashboard/supply-chain')
    }
  }

  const handleSourceSelect = (selectedType: 'FARMED' | 'WILD_CAPTURE') => {
    redirect(`/dashboard/supply-chain/create?source=${selectedType}`)
  }

  const handleSubmit = async (formData: any) => {
    console.log('Supply chain record submitted:', formData)
    // TODO: Integrate with API service
    redirect('/dashboard/supply-chain')
  }

  const handleSaveDraft = async (draftData: any) => {
    console.log('Draft saved:', draftData)
    // TODO: Integrate with API service
  }

  const handleClose = () => {
    redirect('/dashboard/supply-chain')
  }

  // If no source type selected, show source selector
  if (!sourceType) {
    return (
      <SourceTypeSelector
        onSelect={handleSourceSelect}
        onBack={handleBack}
      />
    )
  }

  // Show the workflow form for selected source type
  return (
    <SupplyChainWorkflowForm
      sourceType={sourceType}
      mode="create"
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
      onBack={handleBack}
      onClose={handleClose}
    />
  )
}