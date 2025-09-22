import {
  AlertCircle,
  Shield
} from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

import { formatFullDate } from "@/helper/formatter";
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

const BlockchainInfo = ({traceData}: {traceData: TraceData}) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Verification & Creator Details
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creator Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Created By
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {traceData.creator.organization}
                </h4>
                <Badge variant="outline" className="capitalize">
                  {traceData.creator.role.toLowerCase()}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Role:</strong> {traceData.creator.role}
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {formatFullDate(traceData.createdAt)}
                </div>
                <div>
                  <strong>Last Updated:</strong>{" "}
                  {formatFullDate(traceData.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Blockchain Verification
          </h3>
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                traceData.blockchainVerified
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {traceData.blockchainVerified ? (
                  <>
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Blockchain Verified
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      Verification Pending
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-gray-700">Status:</strong>
                  <span
                    className={`ml-2 ${getStatusColor(traceData.status)}`}
                  >
                    {getStatusText(traceData.status)}
                  </span>
                </div>

                <div>
                  <strong className="text-gray-700">Data Hash:</strong>
                  <div className="font-mono text-xs bg-white p-2 rounded mt-1 break-all">
                    {traceData.dataHash}
                  </div>
                </div>

                <div>
                  <strong className="text-gray-700">Blockchain Hash:</strong>
                  <div className="font-mono text-xs bg-white p-2 rounded mt-1">
                    {traceData.blockchainHash || "Not yet available"}
                  </div>
                </div>
              </div>

              {traceData.status === "BLOCKCHAIN_FAILED" && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600 inline mr-1" />
                  Blockchain verification is in progress. Some features may be
                  limited until verification is complete.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BlockchainInfo;
