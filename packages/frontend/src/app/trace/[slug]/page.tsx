"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Cookies from "universal-cookie";

import {
  Shield,
  Fish,
  Factory,
  Building,
  Truck,
  Store,
  Share2,
  Download,
  Info,
  Globe,
  QrCode,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatDate } from "@/helper/formatter";
import { formatFullDate } from "@/helper/formatter";
import { getStageStatus } from "@/helper/getters";
import TraceHero from "@/components/trace/Hero";
import Nutrition from "@/components/trace/ProductInfo";
import Timeline from "@/components/trace/Timeline";
import BlockchainInfo from "@/components/trace/BlockchainInfo";
import CustomerFeedback from "@/components/trace/CustomerFeedback";
import ProductInfo from "@/components/trace/ProductInfo";
import { TraceData } from "@/lib/trace";

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
  speciesName: "Giant Tiger Prawn",
  productName: "Fresh Giant Tiger Prawn",
  productDescription: "",
  sourceType: "WILD_CAPTURE",
  currentStage: "HARVEST",
  status: "BLOCKCHAIN_FAILED",
  batchId: "",
  isPublic: true,
  createdAt: "2025-09-17T11:10:23.535Z",
  updatedAt: "2025-09-17T11:10:33.519Z",
  creator: {
    organization: "J0shcodes",
    role: "FARMER",
  },
  stageHistory: [
    {
      stage: "HARVEST",
      timestamp: "2025-09-17T11:10:27.095Z",
      location: "Lagos, Nigeria",
      notes: "",
      data: {},
      updatedBy: {
        organization: "J0shcodes",
        role: "FARMER",
      },
    },
  ],
  blockchainVerified: false,
  blockchainHash: null,
  dataHash: "e4557224af4e27c0c404404e86d7b4332757e7679bf81c38ee8a6879d7fda4ad",
  attachments: 0,
  totalStages: 1,
  daysInSupplyChain: 4,
};

// Define all possible stages for the supply chain
const ALL_STAGES = [
  { name: "HARVEST", title: "Harvest", icon: Fish },
  { name: "PROCESSING", title: "Processing", icon: Factory },
  { name: "STORAGE", title: "Storage", icon: Building },
  { name: "TRANSPORT", title: "Transport", icon: Truck },
  { name: "RETAIL", title: "Retail", icon: Store },
];

const ProductTrace = () => {
  const [showNutrition, setShowNutrition] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [traceData, setTraceData] = useState<TraceData | null>(null);

  const { slug } = useParams<{ slug: string }>();
  console.log(slug);

  const cookie = new Cookies();

  const userToken = cookie.get("user-token");

  useEffect(() => {
    const getTraceData = async () => {
      let isFetching = true;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/supply-chain/public/trace/${slug}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch Batch data");
        }

        setTraceData(response.data.data);

        // const batch = response.data.data;
        // isFetching = false;

        // return { batch, isFetching };
      } catch (error) {
        console.error(error);
        // const batch = undefined;
        // isFetching = false;
        // return { batch, isFetching };
        // toast.error("Failed to fetch Batch data")
      }
    };

    getTraceData();
  }, []);

  // Extract URL parameters (in real app, use router)
  const urlParams = new URLSearchParams(window.location.search);
  const productName = urlParams.get("name") || mockTraceData.productName;
  // const qrId = urlParams.get("qr") || mockTraceData.qrCodeId;

  // const daysUntilExpiry = getDaysUntilExpiry(mockTraceData.bestBefore);

  const getStageStatus = (stageIndex: number, currentStageIndex: number) => {
    if (stageIndex < currentStageIndex) return "completed";
    if (stageIndex === currentStageIndex) return "current";
    return "upcoming";
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TracceAqua - ${productName}`,
          text: `Check out the traceability journey of this ${productName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!traceData) {
    return <div>Could not get trace data</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Hero Section */}
      <TraceHero traceData={traceData} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={shareProduct}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Product
          </Button>
          <Button
            variant="outline"
            disabled={!mockTraceData.blockchainVerified}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNutrition(!showNutrition)}
          >
            <Info className="h-4 w-4 mr-2" />
            Product Info
          </Button>
        </div>

        {/* Product Info Panel */}
        <ProductInfo showNutrition={showNutrition} traceData={traceData} />

        {/* Journey Timeline */}
        <Timeline traceData={traceData} />

        {/* Creator & Blockchain Information */}
        <BlockchainInfo traceData={traceData} />

        {/* Attachments & Documents */}
        {mockTraceData.attachments > 0 ? (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Documents & Attachments
            </h2>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {mockTraceData.attachments} attachment(s) available
              </p>
              <Button
                variant="outline"
                className="mt-4"
                disabled={!mockTraceData.blockchainVerified}
              >
                <Download className="h-4 w-4 mr-2" />
                View Attachments
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Documents & Attachments
            </h2>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No attachments available for this product
              </p>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield
              className={`h-5 w-5 ${mockTraceData.blockchainVerified ? "text-green-600" : "text-yellow-600"}`}
            />
            <span className="text-sm font-medium text-gray-700">
              {mockTraceData.blockchainVerified
                ? "Verified by TracceAqua Blockchain Traceability"
                : "TracceAqua Blockchain Verification in Progress"}
            </span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-xs text-gray-500">
              This product's supply chain data is recorded using TracceAqua's
              blockchain technology to ensure transparency and authenticity.
            </p>

            {mockTraceData.status === "BLOCKCHAIN_FAILED" && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  Blockchain verification is currently processing. Full features
                  will be available once verification is complete.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Learn About TracceAqua
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Scan Another Product
            </Button>
          </div>

          {/* Product Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">Product Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <strong>ID:</strong> {mockTraceData.productId}
              </div>
              <div>
                <strong>Species:</strong> {mockTraceData.speciesName}
              </div>
              <div>
                <strong>Source:</strong>{" "}
                {mockTraceData.sourceType.replace("_", " ")}
              </div>
              <div>
                <strong>Current Stage:</strong> {mockTraceData.currentStage}
              </div>
              <div>
                <strong>Days in Supply Chain:</strong>{" "}
                {mockTraceData.daysInSupplyChain}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTrace;
