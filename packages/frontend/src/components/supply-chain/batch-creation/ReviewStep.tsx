import { useState } from "react";
import { Check, Camera, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatchFormData } from "@/zod/schemas/batch-creation-schema";

const ReviewStep = ({ data }: {data: BatchFormData}) => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrValue, setQrValue] = useState('');

  const generateQR = () => {
    const qrData = {
      productId: data.productId,
      productName: data.productName,
      speciesName: data.speciesName,
      sourceType: data.sourceType,
      timestamp: new Date().toISOString(),
      traceabilityUrl: `https://tracceaqua.vercel.app/trace/${data.productId}`
    };
    setQrValue(JSON.stringify(qrData));
    setQrGenerated(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold ">Review & Submit</h2>
        <p className="text-gray-600 mt-2">Review your information before submitting to the blockchain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-2 text-sm text-black">
              <div><strong>Product ID:</strong> {data.productId}</div>
              <div><strong>Source Type:</strong> {data.sourceType}</div>
              <div><strong>Species:</strong> {data.speciesName}</div>
              <div><strong>Product Name:</strong> {data.productName}</div>
              {data.productDescription && <div><strong>Description:</strong> {data.productDescription}</div>}
              {data.location && <div><strong>Location:</strong> {data.location}</div>}
              <div><strong>Public Record:</strong> {data.isPublic ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {data.sourceType === 'FARMED' && data.hatcheryData && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hatchery Data</h3>
              <div className="space-y-2 text-sm text-black">
                <div><strong>Species Spawned:</strong> {data.hatcheryData.speciesSpawned}</div>
                <div><strong>Egg Count:</strong> {data.hatcheryData.eggCount?.toLocaleString()}</div>
                <div><strong>Spawning Date:</strong> {data.hatcheryData.spawningDate}</div>
                <div><strong>Water Temperature:</strong> {data.hatcheryData.waterTemperature}°C</div>
                <div><strong>Survival Rate:</strong> {data.hatcheryData.survivalRate}%</div>
              </div>
            </div>
          )}

          {data.sourceType === 'WILD_CAPTURE' && data.fishingData && (
            <div className="bg-cyan-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fishing Data</h3>
              <div className="space-y-2 text-sm text-black">
                <div><strong>Fishing Method:</strong> {data.fishingData.fishingMethod}</div>
                <div><strong>Water Depth:</strong> {data.fishingData.waterDepth}m</div>
                <div><strong>Sea Conditions:</strong> {data.fishingData.seaConditions}</div>
                {data.fishingData.vesselDetails && (
                  <div><strong>Vessel:</strong> {data.fishingData.vesselDetails.name}</div>
                )}
              </div>
            </div>
          )}

          {data.harvestData && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Data</h3>
              <div className="space-y-2 text-sm text-black">
                <div><strong>Method:</strong> {data.harvestData.harvestMethod}</div>
                <div><strong>Location:</strong> {data.harvestData.harvestLocation}</div>
                <div><strong>Total Weight:</strong> {data.harvestData.totalWeight}kg</div>
                <div><strong>Quality Grade:</strong> {data.harvestData.qualityGrade}</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Submission</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your data will be stored on the Sepolia testnet for permanent traceability.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Network: Sepolia Testnet</div>
              <div>• Gas fees will be estimated</div>
              <div>• Transaction will be confirmed on-chain</div>
              <div>• Data hash will be stored immutably</div>
            </div>
          </div>

          {data.notes && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <p className="text-sm text-gray-600">{data.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep