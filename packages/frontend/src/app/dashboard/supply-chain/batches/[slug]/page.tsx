import React, { FC } from "react";
import { cookies } from "next/headers";
import { toast } from "sonner";
// import { QRCodeSVG } from 'qr-code';
import { QRGenerator } from "@/components/qr-code/QRGenerator";
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  MapPin,
  Calendar,
  User,
  Building,
  Fish,
  Truck,
  ShieldCheck,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Thermometer,
  Star,
  Package,
  Factory,
  Anchor,
  Database,
  Activity,
  TrendingUp,
  Globe,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OverviewCards from "@/components/supply-chain/batch-creation/view/OverviewCards";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { SupplyChainRecord, StageHistory } from "@/lib/supply-chain-types";
import Timeline from "@/components/supply-chain/batch-creation/view/Timeline";
import DetailedInformationTabs from "@/components/supply-chain/batch-creation/view/DetailedInfo";
import BasicInfo from "@/components/supply-chain/batch-creation/view/BasicInfo";

interface BatchProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Main Component
const BatchDetailsPage: FC<BatchProps> = async ({ params }) => {
  // Mock params - replace with actual routing in real implementation
  const batchId = "batch_001";
  // const {productId} = await params
  // console.log(productId)

  const { slug } = await params;
  console.log(slug);

  // const cookie = new Cookies()
  const cookieStore = cookies();
  const userToken = (await cookieStore).get("user-token")?.value;
  console.log(userToken);

  // if(userToken) window.location.replace("/")

  // const batchData: SupplyChainRecord = {}

  const getBatchData = async (): Promise<{
    batch: SupplyChainRecord | undefined;
    isFetching: boolean;
  }> => {
    let isFetching = true;
    try {
      const response = await axios.get(
        `${process.env.BACKEND_URL_DEV}/supply-chain/${slug}`,
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

      console.log(response.data);

      const batch: SupplyChainRecord = response.data.data;
      isFetching = false;

      return { batch, isFetching };
    } catch (error) {
      console.error(error);
      const batch = undefined;
      isFetching = false;
      return { batch, isFetching };
      // toast.error("Failed to fetch Batch data")
    }
  };

  const { batch, isFetching } = await getBatchData();
  console.log(batch);

  if (isFetching && !batch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading batch details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {batch!.productId}
              </h1>
              <p className="text-gray-600">
                {batch!.speciesName} • {batch!.productName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button>
              <Eye className="h-4 w-4 mr-2" />
              Public View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Cards */}
            <OverviewCards batch={batch} />

            {/* Supply Chain Timeline */}
            <Timeline batch={batch}/>

            {/* Detailed Information Tabs */}
            <DetailedInformationTabs batch={batch}/>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BasicInfo batch={batch}/>
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>
                  Scan to view public trace information
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <QRGenerator productId={batch?.productId} displayName={batch?.productName} />
                  </div>
                </div>
                {/* <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button> */}
              </CardContent>
            </Card>

            {/* User Info */}
            {batch!.user && (
              <Card>
                <CardHeader>
                  <CardTitle>Created By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {batch?.user.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {batch!.user.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {batch!.user.role.toLowerCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {/* {batch!.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{batch.notes}</p>
                </CardContent>
              </Card>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailsPage;