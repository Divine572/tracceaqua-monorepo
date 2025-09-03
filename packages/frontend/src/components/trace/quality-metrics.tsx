"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Award,
  CheckCircle,
  AlertTriangle,
  Thermometer,
  Shield,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'

interface QualityTest {
  id: string
  type: string
  result: string
  value?: number
  unit?: string
  passedStandards: boolean
  testedBy: string
  timestamp: string
}

interface QualityMetricsProps {
  tests: QualityTest[]
  qualityGrade?: string
}

export function QualityMetrics({ tests, qualityGrade }: QualityMetricsProps) {
  const passedTests = tests.filter(test => test.passedStandards)
  const failedTests = tests.filter(test => !test.passedStandards)
  const passRate = tests.length > 0 ? (passedTests.length / tests.length) * 100 : 100

  return (
    <div className="space-y-6">
      {/* Quality Grade Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quality Grade & Testing Summary
          </CardTitle>
          <CardDescription>
            Independent quality testing and certification results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quality Grade */}
            <div className="text-center p-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {qualityGrade || 'Premium'}
              </div>
              <p className="text-sm text-amber-700">Quality Grade</p>
            </div>
            
            {/* Pass Rate */}
            <div className="text-center p-6 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {passRate.toFixed(1)}%
              </div>
              <p className="text-sm text-green-700">Tests Passed</p>
            </div>
            
            {/* Total Tests */}
            <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {tests.length}
              </div>
              <p className="text-sm text-blue-700">Total Tests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detailed Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{test.type}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={test.passedStandards ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {test.passedStandards ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              PASS
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              FAIL
                            </>
                          )}
                        </Badge>
                        
                        {test.value !== undefined && (
                          <span className="text-sm font-medium">
                            {test.value} {test.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="font-medium">{test.testedBy}</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(test.timestamp), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Result: </span>
                    <span className={
                      test.passedStandards 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }>
                      {test.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Standards Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                Safety & Quality Standards
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                All tests are conducted by certified laboratories following international 
                standards for seafood safety and quality.
              </p>
              <div className="space-y-1 text-sm text-blue-600">
                <p>✓ FDA Food Safety Modernization Act compliance</p>
                <p>✓ HACCP certified processing facilities</p>
                <p>✓ ISO 22000 food safety management</p>
                <p>✓ Regular third-party audits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
