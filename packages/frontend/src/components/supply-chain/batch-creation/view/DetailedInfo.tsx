import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Anchor,
  Fish,
  Building,
  Package,
  Factory,
  Truck,
  Database,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { FishingData, HatcheryData, ProcessingData, GrowOutData, TransportData, SupplyChainRecord, HarvestData, StorageData } from "@/lib/supply-chain-types";
import { formatDateTime } from "@/helper/formatter";

type StageData = FishingData | HatcheryData | ProcessingData | GrowOutData | HarvestData | StorageData | TransportData

const renderStageData = (stageData: StageData, stageType: string) => {
    if (!stageData) return null;

    const renderObjectData = (obj: any, title: String) => (
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
              </span>
              <span className="ml-2 text-gray-900">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {Object.entries(stageData).map(([key, value]) => {
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            return renderObjectData(value, key.replace(/([A-Z])/g, " $1"));
          } else if (Array.isArray(value)) {
            return (
              <div key={key} className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </h4>
                {value.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
                    {typeof item === "object" ? (
                      Object.entries(item).map(([itemKey, itemValue]) => (
                        <div key={itemKey} className="text-sm">
                          <span className="text-gray-600 capitalize">
                            {itemKey.replace(/([A-Z])/g, " $1").toLowerCase()}:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {String(itemValue)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-900">
                        {String(item)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          } else {
            return (
              <div key={key} className="text-sm">
                <span className="text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                </span>
                <span className="ml-2 text-gray-900">{String(value)}</span>
              </div>
            );
          }
        })}
      </div>
    );
  };

const DetailedInformationTabs = ({ batch }: { batch: SupplyChainRecord | undefined }) => {
  return (
    <Tabs defaultValue="source" className="w-full">
      <TabsList>
        <TabsTrigger value="source">Source Data</TabsTrigger>
        <TabsTrigger value="stages">Stage Details</TabsTrigger>
        <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        <TabsTrigger value="quality">Quality & Tests</TabsTrigger>
      </TabsList>

      <TabsContent value="source">
        <div className="space-y-6">
          {batch?.sourceType === "WILD_CAPTURE" && batch?.fishingData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  Fishing Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch?.fishingData, "fishing")}
              </CardContent>
            </Card>
          )}

          {batch?.sourceType === "FARMED" && batch?.hatcheryData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  Hatchery Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch.hatcheryData, "hatchery")}
              </CardContent>
            </Card>
          )}

          {batch?.sourceType === "FARMED" && batch?.growOutData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Grow-Out Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch?.growOutData, "growout")}
              </CardContent>
            </Card>
          )}

          {batch?.harvestData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Harvest Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch?.harvestData, "harvest")}
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="stages">
        <div className="space-y-6">
          {batch?.processingData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Processing Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch?.processingData, "processing")}
              </CardContent>
            </Card>
          )}

          {batch?.storageData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Storage Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch?.storageData, "storage")}
              </CardContent>
            </Card>
          )}

          {batch?.transportData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Transport Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStageData(batch?.transportData, "transport")}
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="blockchain">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Blockchain & IPFS Data
            </CardTitle>
            <CardDescription>
              Immutable records and decentralized storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Blockchain Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Data Hash:</span>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                        {batch?.dataHash}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Blockchain Hash:</span>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                        {batch?.blockchainHash}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">IPFS Files</h4>
                  <div className="space-y-2">
                    {batch?.fileHashes.map((hash, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="font-mono text-xs">{hash}</div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Stage History Verification
                </h4>
                <div className="space-y-3">
                  {batch?.stageHistory.map((stage, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium capitalize">
                          {stage.stage}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(stage.timestamp)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {stage.blockchainHash ? (
                          <Badge variant="default">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quality">
        <div className="space-y-6">
          {/* {batch?.processingData?.qualityTests && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Quality Tests</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {batch?.processingData.qualityTests.map(
                                    (test, index) => (
                                      <div
                                        key={index}
                                        className="p-4 border rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">
                                            {test.testType}
                                          </h4>
                                          <Badge>
                                            {test.passed ? "Passed" : "Failed"}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <div>
                                            <strong>Result:</strong> {test.result}
                                          </div>
                                          <div>
                                            <strong>Standard:</strong> {test.standard}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )} */}

          {/* {batch?.storageData?.qualityChecks && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Storage Quality Checks</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {batch.storageData.qualityChecks.map(
                                    (check, index) => (
                                      <div
                                        key={index}
                                        className="p-4 border rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">
                                            {formatDate(check.checkDate)}
                                          </h4>
                                          <Badge variant="outline">
                                            {check.quality}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <div>
                                            <strong>Temperature:</strong>{" "}
                                            {check.temperature}°C
                                          </div>
                                          {check.notes && (
                                            <div>
                                              <strong>Notes:</strong> {check.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )} */}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DetailedInformationTabs;
