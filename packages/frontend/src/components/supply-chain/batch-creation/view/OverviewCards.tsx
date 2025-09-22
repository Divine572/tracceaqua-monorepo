import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SupplyChainRecord } from "@/lib/supply-chain-types";
import { Activity, ShieldCheck, BarChart3, Star } from "lucide-react";

const OverviewCards = ({batch}: {batch: SupplyChainRecord | undefined}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Stage</p>
              <p className="font-semibold text-gray-900 capitalize">
                {batch!.currentStage.toLowerCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-gray-900 capitalize">
                {batch!.status === "Blockchain_failed" ? "No status" : batch!.status.toLowerCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Feedback</p>
              <p className="font-semibold text-gray-900">
                {batch!.feedbackCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="font-semibold text-gray-900">
                {batch!.averageRating.toFixed(1)}/5
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
