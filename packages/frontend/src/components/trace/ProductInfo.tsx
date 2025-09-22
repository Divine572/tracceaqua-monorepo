import { TraceData } from "@/lib/trace";
import { Card } from "../ui/card";
import {
  CheckCircle,
  ArrowRight,
  Fish,
  Factory,
  Building,
  Truck,
  Store,
} from "lucide-react";

interface ProductInfoProps {
  showNutrition: boolean;
  traceData: TraceData
}

const ProductInfo = ({ showNutrition, traceData }: ProductInfoProps) => {
  return (
    <>
      {showNutrition && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Species:</strong> {traceData.speciesName}
                </div>
                <div>
                  <strong>Source Type:</strong>{" "}
                  {traceData.sourceType.replace("_", " ")}
                </div>
                <div>
                  <strong>Product ID:</strong> {traceData.productId}
                </div>
                {traceData.batchId && (
                  <div>
                    <strong>Batch ID:</strong> {traceData.batchId}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Supply Chain Status
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Current Stage:</strong> {traceData.currentStage}
                </div>
                <div>
                  <strong>Total Stages:</strong> {traceData.totalStages}
                </div>
                <div>
                  <strong>Days in Chain:</strong>{" "}
                  {traceData.daysInSupplyChain}
                </div>
                <div>
                  <strong>Attachments:</strong> {traceData.attachments}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ProductInfo;
