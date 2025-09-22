import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Heart,
  Star,
  Fish,
  Factory,
  Building,
  Truck,
  Store,
} from "lucide-react";

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
        "Excellent water quality verified",
      ],
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
        { test: "Chemical residues", result: "Below limits", passed: true },
      ],
      verified: true,
      highlights: [
        "HACCP certified facility",
        "All quality tests passed",
        "Cold chain maintained",
      ],
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
        "Energy efficient facility",
      ],
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
        { time: "18:00", temp: "-1°C", location: "Abuja distribution" },
      ],
      verified: true,
      highlights: [
        "Temperature monitored throughout",
        "GPS tracked delivery",
        "Professional cold chain handling",
      ],
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
        "Expert staff available for questions",
      ],
    },
  ],

  // Quality & Safety
  qualityMetrics: {
    freshness: 9.2,
    appearance: 9.0,
    size: "Large (15-20cm)",
    weight: "25-30g per piece",
    packaging: "Vacuum sealed, eco-friendly",
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
      "Biodiversity protection measures",
    ],
  },

  // Consumer info
  nutritionHighlights: [
    "High in protein (20g per 100g)",
    "Rich in Omega-3 fatty acids",
    "Low in saturated fat",
    "Source of vitamin B12",
  ],

  cookingTips: [
    "Best grilled or pan-fried for 2-3 minutes per side",
    "Do not overcook to maintain texture",
    "Pairs well with garlic and herbs",
    "Great for curries and stir-fries",
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
      verified: true,
    },
    {
      rating: 4,
      comment: "Good size prawns, cooked perfectly in curry.",
      author: "Michael O.",
      date: "2024-09-17",
      verified: true,
    },
  ],
};

const CustomerFeedback = () => {
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  return (
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
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">
            {mockTraceData.averageRating}
          </span>
          <span className="text-sm text-gray-600">
            ({mockTraceData.totalReviews} reviews)
          </span>
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
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900">
                  {review.author}
                </span>
                {review.verified && (
                  <Badge variant="default" className="text-xs">
                    Verified Purchase
                  </Badge>
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
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 hover:text-yellow-200"
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
  );
};

export default CustomerFeedback;
