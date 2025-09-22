import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  SupplyChainResponse,
  SupplyChainRecord,
} from "@/lib/supply-chain-types";

interface UseBatchesOptions {
  searchTerm?: string;
  statusFilter?: string;
  stageFilter?: string;
  // productId?: string;
}

export function useBatches({
  searchTerm,
  stageFilter,
  statusFilter,
  // productId
}: UseBatchesOptions) {
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches", searchTerm, stageFilter, statusFilter],
    queryFn: async (): Promise<SupplyChainRecord[]> => {
      const response =
        await axios.get("/api/supply-chain/create-batch");
        console.log(response.data)
      const records = response.data.data.data.data;

      console.log(records);

      return records.filter((batch: any) => {
        const matchesSearch =
          !searchTerm ||
          batch.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.productName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStage =
          stageFilter === "all" || batch.currentStage === stageFilter;

        const matchesStatus =
          statusFilter === "all" || batch.status === statusFilter;

        // const matchesProductId = productId === "all" || batch.productId === productId

        return matchesSearch && matchesStage && matchesStatus;
      });
    },
    refetchOnWindowFocus: false,
  });

  return {batches, isLoading}
}
