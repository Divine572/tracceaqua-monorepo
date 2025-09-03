import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  QrCode, 
  Search, 
  ArrowRight,
  Fish,
  Home
} from 'lucide-react'
import Link from 'next/link'

export default function TraceNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Error Card */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Product Not Found
            </CardTitle>
            <CardDescription className="text-lg">
              We couldn't find the seafood product you're looking for in our traceability system.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Possible Reasons */}
            <Alert>
              <Fish className="h-4 w-4" />
              <AlertDescription>
                <strong>Possible reasons:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Invalid or expired product code</li>
                  <li>Product not yet registered in our system</li>
                  <li>QR code from a different traceability system</li>
                  <li>Temporary system issue</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/scan">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan Another Code
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/dashboard/trace">
                  <Search className="h-4 w-4 mr-2" />
                  Search Products
                </Link>
              </Button>
            </div>

            {/* Help Section */}
            <div className="pt-6 border-t text-left">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>Need Help?</span>
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Make sure you're scanning a TracceAqua QR code</p>
                <p>• Check that the product code is complete and correct</p>
                <p>• Contact your seafood supplier if the product should be traceable</p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="pt-4 border-t">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-900 mb-3">
              Looking for TracceAqua Products?
            </h4>
            <p className="text-blue-700 text-sm mb-4">
              Find retailers and suppliers who use TracceAqua for verified sustainable seafood.
            </p>
            <Button asChild variant="outline" size="sm" className="border-blue-300 text-blue-700">
              <Link href="/dashboard">
                Find Suppliers
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
