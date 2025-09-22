export interface TraceData {
  productId: string;
  speciesName: string;
  productName: string;
  productDescription: string;
  sourceType: "WILD_CAPTURE" | "FARMED"; // extend with other possible values
  currentStage: string;
  status: "BLOCKCHAIN_FAILED" | "BLOCKCHAIN_VERIFIED" | string; // extend if you know all possible statuses
  batchId: string;
  isPublic: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  creator: {
    organization: string;
    role: "FARMER" | "PROCESSOR" | "DISTRIBUTOR" | "RETAILER" | string; // extend as needed
  };
  stageHistory: {
    stage: string;
    timestamp: string; // ISO date string
    location: string;
    notes: string;
    data: Record<string, unknown>;
    updatedBy: {
      organization: string;
      role: string;
    };
  }[];
  blockchainVerified: boolean;
  blockchainHash: string | null;
  dataHash: string;
  attachments: number;
  totalStages: number;
  daysInSupplyChain: number;
}
