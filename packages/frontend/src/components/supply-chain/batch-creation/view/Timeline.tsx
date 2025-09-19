import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User } from "lucide-react";

import { formatDateTime } from "@/helper/formatter";
import { getStageColor, getStageIcon, getStageStatus } from "@/helper/getters";
import { SupplyChainRecord } from "@/lib/supply-chain-types";

const Timeline = ({batch}: {batch: SupplyChainRecord | undefined}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supply Chain Journey</CardTitle>
        <CardDescription>
          Track the journey of this batch through the supply chain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[
            "HARVEST",
            "PROCESSING",
            "STORAGE",
            "TRANSPORT",
            "RETAIL",
            "SOLD",
          ].map((stageName, index) => {
            const status = getStageStatus(stageName);
            const StageIcon = getStageIcon(stageName);
            const stageHistory = batch?.stageHistory?.find(
              (stage) => stage.stage === stageName
            );

            return (
              <div key={stageName} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`p-2 rounded-full ${getStageColor(stageName, status === "completed", status === "current")}`}
                  >
                    <StageIcon className="h-5 w-5" />
                  </div>
                  {index < 5 && (
                    <div
                      className={`w-px h-8 mt-2 ${
                        status === "completed" ? "bg-green-200" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-medium capitalize ${
                        status === "current"
                          ? "text-blue-600"
                          : status === "completed"
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      {stageName.toLowerCase()}
                    </h3>
                    {stageHistory && (
                      <div className="flex items-center gap-2">
                        {stageHistory.blockchainHash && (
                          <Badge variant="default">Blockchain Verified</Badge>
                        )}
                        <Badge
                          variant={
                            status === "completed" ? "default" : "secondary"
                          }
                        >
                          {status === "completed" ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {stageHistory ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(stageHistory.timestamp)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4" />
                          {stageHistory.user?.profile?.firstName} (
                          {stageHistory.user?.role})
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {stageHistory.location}
                        </div>
                      </div>
                      {stageHistory.notes && (
                        <p className="text-sm text-gray-700 italic">
                          "{stageHistory.notes}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {status === "current" ? "In progress..." : "Pending"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Timeline;
