import React from 'react'
import { notFound } from 'next/navigation'
import { ProductTraceView } from '@/components/trace/product-trace-view'
import { getTraceabilityData } from '@/lib/traceability'

interface TracePageProps {
  params: {
    productId: string
  }
}

export async function generateMetadata({ params }: TracePageProps) {
  try {
    const data = await getTraceabilityData(params.productId)
    return {
      title: `Trace ${data.productName} | TracceAqua`,
      description: `Track the journey of ${data.productName} from source to your plate. Verified sustainable seafood traceability.`,
      openGraph: {
        title: `Trace ${data.productName}`,
        description: `Track this ${data.speciesName} from ${data.sourceType === 'FARMED' ? 'farm' : 'wild capture'} to your plate`,
        type: 'website',
      },
    }
  } catch (error) {
    return {
      title: 'Product Not Found | TracceAqua',
      description: 'The requested product could not be found in our traceability system.',
    }
  }
}

export default async function TracePage({ params }: TracePageProps) {
  try {
    const traceData = await getTraceabilityData(params.productId)
    
    if (!traceData) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <ProductTraceView traceData={traceData} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching trace data:', error)
    notFound()
  }
}
