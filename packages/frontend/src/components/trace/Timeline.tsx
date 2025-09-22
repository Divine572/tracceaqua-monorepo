import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  MapPin,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Fish,
  Factory,
  Building,
  Truck,
  Store,
} from "lucide-react";

// import { getStageStatus } from "@/helper/getters";
import { formatDate } from "@/helper/formatter";
import { formatFullDate } from "@/helper/formatter";
import { getStageStatus } from "@/helper/getters";
import { TraceData } from "@/lib/trace";

const ALL_STAGES = [
  { name: 'HARVEST', title: 'Harvest', icon: Fish },
  { name: 'PROCESSING', title: 'Processing', icon: Factory },
  { name: 'STORAGE', title: 'Storage', icon: Building },
  { name: 'TRANSPORT', title: 'Transport', icon: Truck },
  { name: 'RETAIL', title: 'Retail', icon: Store }
];

const Timeline = ({traceData}: {traceData : TraceData}) => {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

//   const getStageStatus = (stageIndex: number, currentStageIndex: number) => {
//     if (stageIndex < currentStageIndex) return "completed";
//     if (stageIndex === currentStageIndex) return "current";
//     return "upcoming";
//   };

//   const currentStageIndex = traceData.journey.findIndex(
//     (stage) => stage.stage === traceData.currentStage
//   );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Supply Chain Journey
        </h2>
        <div className="flex items-center gap-2">
          {traceData.blockchainVerified ? (
            <Badge variant="default">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending Verification
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {ALL_STAGES.map((stage, index) => {
          const StageIcon = stage.icon;
          const status = getStageStatus(stage.name);
          const stageData = traceData.stageHistory.find(
            (s) => s.stage === stage.name
          );
          const isExpanded = expandedStage === index;

          return (
            <div key={stage.name} className="relative">
              {/* Timeline Line */}
              {index < ALL_STAGES.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-px h-16 ${
                    status === "completed" ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}

              <div
                className={`flex gap-4 p-4 rounded-lg transition-all duration-200 ${
                  status === "current"
                    ? "bg-blue-50 border-2 border-blue-200"
                    : status === "completed"
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    status === "current"
                      ? "bg-blue-100 text-blue-600"
                      : status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : status === "current" ? (
                    <Clock className="h-6 w-6" />
                  ) : (
                    <StageIcon className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stage.title}
                      </h3>
                      {stageData && (
                        <p className="text-sm text-gray-600">
                          {formatDate(stageData.timestamp)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {stageData && (
                        <>
                          <Badge
                            variant={
                              traceData.blockchainVerified
                                ? "default"
                                : "destructive"
                            }
                          >
                            {traceData.blockchainVerified
                              ? "Verified"
                              : "Pending"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedStage(isExpanded ? null : index)
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {stageData ? (
                    <>
                      <div className="text-sm text-gray-700 mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-4 w-4" />
                          {stageData.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {stageData.updatedBy.organization} (
                          {stageData.updatedBy.role})
                        </div>
                      </div>

                      {stageData.notes && (
                        <div className="text-sm text-gray-600 italic mb-3">
                          "{stageData.notes}"
                        </div>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Stage Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <strong>Stage:</strong> {stageData.stage}
                                </div>
                                <div>
                                  <strong>Timestamp:</strong>{" "}
                                  {formatFullDate(stageData.timestamp)}
                                </div>
                                <div>
                                  <strong>Location:</strong>{" "}
                                  {stageData.location}
                                </div>
                                <div>
                                  <strong>Updated By:</strong>{" "}
                                  {stageData.updatedBy.organization}
                                </div>
                                <div>
                                  <strong>Role:</strong>{" "}
                                  {stageData.updatedBy.role}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Additional Data
                              </h4>
                              <div className="space-y-1 text-sm">
                                {Object.keys(stageData.data).length > 0 ? (
                                  Object.entries(stageData.data).map(
                                    ([key, value]) => (
                                      <div key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                      </div>
                                    )
                                  )
                                ) : (
                                  <div className="text-gray-500 italic">
                                    No additional data available
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {status === "current" ? "In progress..." : "Pending"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default Timeline;
