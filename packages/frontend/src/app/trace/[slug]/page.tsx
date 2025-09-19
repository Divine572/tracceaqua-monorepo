"use client"

import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import {
  MapPin,
  Calendar,
  Shield,
  Fish,
  Factory,
  Building,
  Truck,
  Store,
  CheckCircle,
  Clock,
  Star,
  ThermometerSun,
  Waves,
  Leaf,
  Award,
  Eye,
  Share2,
  Download,
  ExternalLink,
  AlertCircle,
  Info,
  Heart,
  Globe,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Camera,
  QrCode
} from 'lucide-react';
import { formatDate } from '@/helper/formatter';
import { formatFullDate } from '@/helper/formatter';
import { getStageStatus } from '@/helper/getters';
// import formatFull

// const getDaysUntilExpiry = (expiryDate: string) => {
//   const now = new Date();
//   const expiry = new Date(expiryDate);
//   const diffTime = expiry - now;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// };

// Mock data based on the tracing URL structure
const mockTraceData = {
  productId: "BAC_dc029378-f52d-47a7-8442-7498f3244ee5",
  qrCodeId: "f586e277-b840-4b13-8cda-4444b191ea84",
  productName: "Fresh Giant Tiger Prawn",
  speciesName: "Penaeus monodon",
  sourceType: "WILD_CAPTURE",
  currentStage: "RETAIL",
  status: "ACTIVE",
  isVerified: true,
  sustainabilityScore: 85,
  qualityGrade: "Premium",
  origin: "Lagos Lagoon, Nigeria",
  harvestDate: "2024-09-15T06:00:00Z",
  bestBefore: "2024-09-25T23:59:59Z",
  batchNumber: "TGP-2024-001",
  
  // Consumer-focused journey
  journey: [
    {
      stage: "HARVEST",
      title: "Wild Caught",
      icon: Fish,
      date: "2024-09-15T06:00:00Z",
      location: "Lagos Lagoon Sustainable Fishing Zone",
      coordinates: { lat: 6.5244, lng: 3.3792 },
      operator: "Ocean Harvest Cooperative",
      method: "Traditional trap fishing",
      sustainability: "MSC Certified Sustainable",
      conditions: "Excellent water quality, optimal weather",
      verified: true,
      highlights: [
        "Sustainable fishing methods used",
        "No overfishing - quota compliant",
        "Excellent water quality verified"
      ]
    },
    {
      stage: "PROCESSING",
      title: "Quality Processing",
      icon: Factory,
      date: "2024-09-15T14:00:00Z",
      location: "Lagos Premium Seafood Processing",
      operator: "Seafood Excellence Ltd",
      method: "Fresh processing & grading",
      certifications: ["HACCP", "ISO 22000", "BRC"],
      temperature: "2°C maintained",
      qualityTests: [
        { test: "Freshness", result: "Excellent", passed: true },
        { test: "Microbiological", result: "Safe", passed: true },
        { test: "Chemical residues", result: "Below limits", passed: true }
      ],
      verified: true,
      highlights: [
        "HACCP certified facility",
        "All quality tests passed",
        "Cold chain maintained"
      ]
    },
    {
      stage: "STORAGE",
      title: "Cold Storage",
      icon: Building,
      date: "2024-09-16T08:00:00Z",
      location: "Premium Cold Storage Facility",
      operator: "ColdChain Solutions",
      temperature: "-2°C",
      humidity: "85%",
      duration: "48 hours",
      verified: true,
      highlights: [
        "Optimal storage conditions",
        "Continuous monitoring",
        "Energy efficient facility"
      ]
    },
    {
      stage: "TRANSPORT",
      title: "Cold Chain Transport",
      icon: Truck,
      date: "2024-09-18T10:00:00Z",
      location: "En route to retail",
      operator: "FreshLink Logistics",
      method: "Refrigerated transport",
      temperature: "-1°C",
      trackingData: [
        { time: "10:00", temp: "-1°C", location: "Lagos depot" },
        { time: "14:00", temp: "-1°C", location: "Highway checkpoint" },
        { time: "18:00", temp: "-1°C", location: "Abuja distribution" }
      ],
      verified: true,
      highlights: [
        "Temperature monitored throughout",
        "GPS tracked delivery",
        "Professional cold chain handling"
      ]
    },
    {
      stage: "RETAIL",
      title: "Available for Purchase",
      icon: Store,
      date: "2024-09-19T09:00:00Z",
      location: "FreshMart Premium Store, Abuja",
      operator: "FreshMart Chain",
      currentLocation: "Premium seafood section",
      verified: true,
      highlights: [
        "Available in premium section",
        "Properly refrigerated display",
        "Expert staff available for questions"
      ]
    }
  ],

  // Quality & Safety
  qualityMetrics: {
    freshness: 9.2,
    appearance: 9.0,
    size: "Large (15-20cm)",
    weight: "25-30g per piece",
    packaging: "Vacuum sealed, eco-friendly"
  },

  // Sustainability
  sustainability: {
    score: 85,
    certifications: ["MSC Sustainable", "Ocean Positive"],
    environmentalImpact: "Low",
    carbonFootprint: "2.1kg CO2/kg product",
    practices: [
      "Sustainable fishing quotas respected",
      "No harmful fishing methods",
      "Supports local fishing communities",
      "Biodiversity protection measures"
    ]
  },

  // Consumer info
  nutritionHighlights: [
    "High in protein (20g per 100g)",
    "Rich in Omega-3 fatty acids",
    "Low in saturated fat",
    "Source of vitamin B12"
  ],

  cookingTips: [
    "Best grilled or pan-fried for 2-3 minutes per side",
    "Do not overcook to maintain texture",
    "Pairs well with garlic and herbs",
    "Great for curries and stir-fries"
  ],

  // Ratings & Reviews
  averageRating: 4.7,
  totalReviews: 28,
  recentReviews: [
    {
      rating: 5,
      comment: "Amazing quality! Very fresh and tasty.",
      author: "Sarah K.",
      date: "2024-09-18",
      verified: true
    },
    {
      rating: 4,
      comment: "Good size prawns, cooked perfectly in curry.",
      author: "Michael O.",
      date: "2024-09-17",
      verified: true
    }
  ]
};


const ProductTrace = () => {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [showNutrition, setShowNutrition] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  // Extract URL parameters (in real app, use router)
  const urlParams = new URLSearchParams(window.location.search);
  const productName = urlParams.get('name') || mockTraceData.productName;
  const qrId = urlParams.get('qr') || mockTraceData.qrCodeId;

  // const daysUntilExpiry = getDaysUntilExpiry(mockTraceData.bestBefore);

  const getStageStatus = (stageIndex: number, currentStageIndex: number) => {
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'upcoming';
  };

  const currentStageIndex = mockTraceData.journey.findIndex(
    stage => stage.stage === mockTraceData.currentStage
  );

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TracceAqua - ${productName}`,
          text: `Check out the traceability journey of this ${productName}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="h-6 w-6" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Scanned via QR Code
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{productName}</h1>
            <p className="text-xl text-blue-100 mb-4">{mockTraceData.speciesName}</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Blockchain Verified
              </div>
              <div className="flex items-center gap-1">
                <Leaf className="h-4 w-4" />
                Sustainably Sourced
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card className="p-4 text-center">
              <div className="text-lg font-bold text-gray-900">{mockTraceData.qualityGrade}</div>
              <div className="text-sm text-gray-600">Quality Grade</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-lg font-bold text-gray-900">{formatFullDate(mockTraceData.harvestDate)}</div>
              <div className="text-sm text-gray-600">Harvest Date</div>
            </Card>
            {/* <Card className="p-4 text-center">
              <div className="text-lg font-bold text-gray-900">
                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
              </div>
              <div className="text-sm text-gray-600">Until Best Before</div>
            </Card> */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={shareProduct}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Product
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          <Button variant="outline" onClick={() => setShowNutrition(!showNutrition)}>
            <Info className="h-4 w-4 mr-2" />
            Nutrition Info
          </Button>
        </div>

        {/* Nutrition Panel */}
        {showNutrition && (
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition & Cooking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Nutritional Highlights</h4>
                <ul className="space-y-2">
                  {mockTraceData.nutritionHighlights.map((highlight, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cooking Tips</h4>
                <ul className="space-y-2">
                  {mockTraceData.cookingTips.map((tip, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <ArrowRight className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Journey Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Journey</h2>
            <Badge variant="default">Fully Tracked</Badge>
          </div>

          <div className="space-y-6">
            {mockTraceData.journey.map((stage, index) => {
              const StageIcon = stage.icon;
              const status = getStageStatus(index, currentStageIndex);
              const isExpanded = expandedStage === index;
              
              return (
                <div key={index} className="relative">
                  {/* Timeline Line */}
                  {index < mockTraceData.journey.length - 1 && (
                    <div className={`absolute left-6 top-12 w-px h-16 ${
                      status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                  
                  <div className={`flex gap-4 p-4 rounded-lg transition-all duration-200 ${
                    status === 'current' ? 'bg-blue-50 border-2 border-blue-200' :
                    status === 'completed' ? 'bg-green-50 border border-green-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}>
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      status === 'current' ? 'bg-blue-100 text-blue-600' :
                      status === 'completed' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : status === 'current' ? (
                        <Clock className="h-6 w-6" />
                      ) : (
                        <StageIcon className="h-6 w-6" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
                          <p className="text-sm text-gray-600">{formatDate(stage.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {stage.verified && (
                            <Badge variant="default">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedStage(isExpanded ? null : index)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-4 w-4" />
                          {stage.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {stage.operator}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {stage.highlights.slice(0, isExpanded ? undefined : 2).map((highlight, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                        {!isExpanded && stage.highlights.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{stage.highlights.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                              <div className="space-y-1 text-sm">
                                <div><strong>Method:</strong> {stage.method}</div>
                                {stage.temperature && <div><strong>Temperature:</strong> {stage.temperature}</div>}
                                {stage.conditions && <div><strong>Conditions:</strong> {stage.conditions}</div>}
                                {stage.sustainability && <div><strong>Sustainability:</strong> {stage.sustainability}</div>}
                              </div>
                            </div>
                            
                            {stage.qualityTests && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Quality Tests</h4>
                                <div className="space-y-2">
                                  {stage.qualityTests.map((test, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span>{test.test}:</span>
                                      <div className="flex items-center gap-1">
                                        <span className={test.passed ? 'text-green-600' : 'text-red-600'}>
                                          {test.result}
                                        </span>
                                        {test.passed ? (
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sustainability Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sustainability</h2>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {mockTraceData.sustainability.score}/100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
              <div className="space-y-2">
                {mockTraceData.sustainability.certifications.map((cert, index) => (
                  <Badge key={index} variant="default" className="mr-2 mb-2">
                    <Award className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Environmental Impact:</strong> {mockTraceData.sustainability.environmentalImpact}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Carbon Footprint:</strong> {mockTraceData.sustainability.carbonFootprint}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sustainable Practices</h3>
              <ul className="space-y-2">
                {mockTraceData.sustainability.practices.map((practice, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Customer Feedback */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= mockTraceData.averageRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{mockTraceData.averageRating}</span>
              <span className="text-sm text-gray-600">({mockTraceData.totalReviews} reviews)</span>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-4 mb-6">
            {mockTraceData.recentReviews.map((review, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">{review.author}</span>
                    {review.verified && (
                      <Badge variant="default" className="text-xs">Verified Purchase</Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Add Review */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Your Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${
                            star <= userRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
              <Button className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Powered by TracceAqua Blockchain Traceability
            </span>
          </div>
          <p className="text-xs text-gray-500">
            This product's journey has been verified and recorded on the blockchain for transparency and authenticity.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Learn More
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Scan Another Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTrace;