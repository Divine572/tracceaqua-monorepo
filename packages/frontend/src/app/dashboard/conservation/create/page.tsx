import { Metadata } from 'next'
import ConservationFormWizard from '@/components/conservation/ConservationFormWizard'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'New Conservation Record | TracceAqua Dashboard',
  description: 'Create a new shellfish conservation record with comprehensive data collection.',
}

interface ConservationCreatePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ConservationCreatePage({ searchParams }: ConservationCreatePageProps) {
  const handleClose = () => {
    redirect('/dashboard/conservation')
  }

  const handleSubmit = async (formData: any) => {
    // Handle form submission
    console.log('Conservation record submitted:', formData)
    // TODO: Integrate with API service
    redirect('/dashboard/conservation')
  }

  const handleSaveDraft = async (draftData: any) => {
    // Handle draft saving
    console.log('Draft saved:', draftData)
    // TODO: Integrate with API service
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <ConservationFormWizard
        mode="create"
        onClose={handleClose}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  )
}