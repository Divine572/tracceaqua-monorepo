import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";
import { EyeOff } from "lucide-react";

import { SupplyChainRecord } from "@/lib/supply-chain-types";
import { formatDate } from "@/helper/formatter";

const BasicInfo = ({batch}: {batch: SupplyChainRecord | undefined}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Product ID</h4>
          <p className="text-sm text-gray-600">{batch?.productId}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Batch ID</h4>
          <p className="text-sm text-gray-600">{batch?.batchId}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Source Type</h4>
          <Badge variant="outline" className="capitalize">
            {batch?.sourceType.replace("_", " ").toLowerCase()}
          </Badge>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Status</h4>
          <Badge variant={batch?.status === "ACTIVE" ? "default" : "secondary"}>
            {batch?.status}
          </Badge>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-gray-900">Created</h4>
          <p className="text-sm text-gray-600">
            {formatDate(batch!.createdAt)}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Last Updated</h4>
          <p className="text-sm text-gray-600">
            {formatDate(batch!.updatedAt)}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Visibility</h4>
          <div className="flex items-center gap-2">
            {batch!.isPublic ? (
              <>
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Public</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Private</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfo;
