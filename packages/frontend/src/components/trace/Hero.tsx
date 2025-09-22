import {
  QrCode,
  Shield,
  Leaf,
  Fish,
  Factory,
  Building,
  Truck,
  Store,
  AlertCircle,
  Globe
} from "lucide-react";
import { Card } from "../ui/card";

import { formatFullDate } from "@/helper/formatter";
import { getStageStatus } from "@/helper/getters";
import { TraceData } from "@/lib/trace";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'BLOCKCHAIN_FAILED': return 'text-red-600 bg-red-50';
    case 'ACTIVE': return 'text-green-600 bg-green-50';
    case 'PENDING': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'BLOCKCHAIN_FAILED': return 'Blockchain Verification Failed';
    case 'ACTIVE': return 'Active & Verified';
    case 'PENDING': return 'Pending Verification';
    default: return status;
  }
};

const TraceHero = ({traceData}: {traceData: TraceData}) => {
  return (
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
            <h1 className="text-4xl font-bold mb-2">{traceData.productName}</h1>
            <p className="text-xl text-blue-100 mb-4">{traceData.speciesName}</p>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                {traceData.blockchainVerified ? (
                  <>
                    <Shield className="h-4 w-4" />
                    Blockchain Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-300" />
                    Blockchain Pending
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {traceData.isPublic ? 'Public Record' : 'Private Record'}
              </div>
            </div>

            {/* Status Warning */}
            {traceData.status === 'BLOCKCHAIN_FAILED' && (
              <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-medium">
                    Blockchain verification is pending - some features may be limited
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card className="p-4 text-center">
              <div className={`text-lg font-bold ${getStatusColor(traceData.status)}`}>
                {getStatusText(traceData.status)}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-lg font-bold text-gray-900">
                {formatFullDate(traceData.createdAt)}
              </div>
              <div className="text-sm text-gray-600">Created</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-lg font-bold text-gray-900">
                {traceData.daysInSupplyChain} days
              </div>
              <div className="text-sm text-gray-600">In Supply Chain</div>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default TraceHero
