"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Award,
  Shield,
  Leaf,
  Fish,
  Globe,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

interface CertificationBadgesProps {
  certifications: string[]
}

export function CertificationBadges({ certifications }: CertificationBadgesProps) {
  const getCertificationInfo = (cert: string) => {
    const certInfo = {
      'SUSTAINABLE_SEAFOOD': {
        name: 'Sustainable Seafood',
        description: 'Certified sustainable fishing practices',
        icon: <Fish className="h-5 w-5 text-blue-600" />,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        authority: 'Marine Stewardship Council'
      },
      'ORGANIC_AQUACULTURE': {
        name: 'Organic Aquaculture',
        description: 'Certified organic farming methods',
        icon: <Leaf className="h-5 w-5 text-green-600" />,
        color: 'bg-green-50 border-green-200 text-green-800',
        authority: 'Organic Aquaculture Association'
      },
      'FAIR_TRADE': {
        name: 'Fair Trade Certified',
        description: 'Ethical labor and trade practices',
        icon: <Globe className="h-5 w-5 text-purple-600" />,
        color: 'bg-purple-50 border-purple-200 text-purple-800',
        authority: 'Fair Trade International'
      },
      'HACCP': {
        name: 'HACCP Certified',
        description: 'Hazard Analysis Critical Control Points',
        icon: <Shield className="h-5 w-5 text-red-600" />,
        color: 'bg-red-50 border-red-200 text-red-800',
        authority: 'Food Safety Authority'
      },
      'BAP_CERTIFIED': {
        name: 'BAP 4-Star',
        description: 'Best Aquaculture Practices certification',
        icon: <Award className="h-5 w-5 text-amber-600" />,
        color: 'bg-amber-50 border-amber-200 text-amber-800',
        authority: 'Global Aquaculture Alliance'
      },
      'ISO_22000': {
        name: 'ISO 22000',
        description: 'Food Safety Management System',
        icon: <CheckCircle className="h-5 w-5 text-indigo-600" />,
        color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        authority: 'International Organization for Standardization'
      }
    }

    return certInfo[cert as keyof typeof certInfo] || {
      name: cert.replace(/_/g, ' '),
      description: 'Industry certification',
      icon: <Award className="h-5 w-5 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200 text-gray-800',
      authority: 'Certifying Body'
    }
  }

  if (certifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            No certifications available for this product
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Certification Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications & Standards
          </CardTitle>
          <CardDescription>
            This product meets the following industry standards and certifications
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Certification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((cert) => {
          const info = getCertificationInfo(cert)
          
          return (
            <Card key={cert} className={`${info.color} hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">
                      {info.name}
                    </h3>
                    <p className="text-sm opacity-80 mb-3">
                      {info.description}
                    </p>
                    <div className="text-xs opacity-70">
                      <p className="font-medium mb-1">Certified by:</p>
                      <p>{info.authority}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <button className="flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" />
                    Verify Certificate
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Certification Benefits */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Why Certifications Matter
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Guaranteed Food Safety</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span>Environmental Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span>Ethical Sourcing</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              These certifications ensure that your seafood meets the highest standards 
              for safety, sustainability, and ethical production practices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}