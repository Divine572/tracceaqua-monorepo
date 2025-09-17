"use client";

import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Edit, QrCode } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useBatches } from "@/hooks/use-batches";

interface BatchOverviewTableProps {
  searchTerm: string;
  stageFilter: string;
  statusFilter: string;
}

// const mockBatches: SupplyChainBatch[] = [
//   {
//     id: "1",
//     batchNumber: "TAQ-2024-001",
//     productType: "wild-capture" as any,
//     category: "molluscs" as any,
//     species: "Crassostrea gigas",
//     commonName: "Pacific Oyster",
//     currentStage: SupplyChainStage.PROCESSING,
//     status: "active",
//     stages: [],
//     createdBy: "user1",
//     createdAt: new Date("2024-01-15"),
//     updatedAt: new Date("2024-01-18"),
//     views: 45,
//   },
//   {
//     id: "2",
//     batchNumber: "TAQ-2024-002",
//     productType: "farmed" as any,
//     category: "finfish" as any,
//     species: "Oreochromis niloticus",
//     commonName: "Nile Tilapia",
//     currentStage: SupplyChainStage.RETAIL,
//     status: "active",
//     stages: [],
//     createdBy: "user2",
//     createdAt: new Date("2024-01-12"),
//     updatedAt: new Date("2024-01-20"),
//     views: 128,
//   },
// ];

const BatchOverviewTable: FC<BatchOverviewTableProps> = ({
  searchTerm,
  stageFilter,
  statusFilter,
}) => {
  const {batches, isLoading} = useBatches({ searchTerm, stageFilter, statusFilter });

  //   const { data: batches = [], isLoading } = useQuery({
  //     queryKey: ["batches", searchTerm, stageFilter, statusFilter],
  //     queryFn: async () => {
  //       // TODO: Replace with actual API call
  //       return mockBatches.filter((batch) => {
  //         const matchesSearch =
  //           !searchTerm ||
  //           batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //           batch.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //           batch.commonName?.toLowerCase().includes(searchTerm.toLowerCase());

  //         const matchesStage =
  //           stageFilter === "all" || batch.currentStage === stageFilter;
  //         const matchesStatus =
  //           statusFilter === "all" || batch.status === statusFilter;

  //         return matchesSearch && matchesStage && matchesStatus;
  //       });
  //     },
  //   });

  //   const getStageColor = (stage: SupplyChainStage) => {
  //     const colors = {
  //       [SupplyChainStage.HARVEST]: "bg-blue-100 text-blue-800",
  //       [SupplyChainStage.PROCESSING]: "bg-yellow-100 text-yellow-800",
  //       [SupplyChainStage.TRANSPORT]: "bg-purple-100 text-purple-800",
  //       [SupplyChainStage.RETAIL]: "bg-green-100 text-green-800",
  //       [SupplyChainStage.SOLD]: "bg-gray-100 text-gray-800",
  //     };
  //     return colors[stage] || "bg-gray-100 text-gray-800";
  //   };

  //   const getStatusColor = (status: string) => {
  //     const colors = {
  //       active: "bg-green-100 text-green-800",
  //       completed: "bg-blue-100 text-blue-800",
  //       expired: "bg-red-100 text-red-800",
  //       recalled: "bg-orange-100 text-orange-800",
  //     };
  //     return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  //   };
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch Number</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Current Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Loading batches...
              </TableCell>
            </TableRow>
          ) : batches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No batches found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/supply-chain/batches/${batch.id}`}
                    className="text-primary hover:underline sm:truncate"
                  >
                    {batch.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{batch.speciesName}</div>
                    <div className="text-sm text-muted-foreground">
                      {batch.productName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {batch.sourceType.replace("-", "")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                  //   className={getStageColor(batch.currentStage)}
                  >
                    {batch.currentStage.charAt(0).toUpperCase() +
                      batch.currentStage.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                  //   className={getStatusColor(batch.status)}
                  >
                    {batch.status.charAt(0).toUpperCase() +
                      batch.status.slice(1)}
                  </Badge>
                </TableCell>
                {/* <TableCell>{batch.views || 0}</TableCell> */}
                <TableCell>{formatDate(batch.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/supply-chain/batches/${batch.productId}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/supply-chain/batches/${batch.productId}/qr`}
                    >
                      <Button size="sm" variant="outline">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/supply-chain/batches/${batch.productId}/edit`}
                    >
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BatchOverviewTable;
