import { BatchOverview } from "@/components/supply-chain/batch-management/BatchOverview";
import { AuthGuard } from "@/components/auth/AuthGuard";
RoleGuard
import { UserRole } from "@/lib/types";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function SupplyChainPage() {
  return (
    <>
      <AuthGuard>
        <RoleGuard
          allowedRoles={[
            UserRole.FARMER,
            UserRole.FISHERMAN,
            UserRole.PROCESSOR,
            UserRole.TRADER,
            UserRole.RETAILER,
            UserRole.ADMIN,
          ]}
        >
          <div className="container max-w-7xl mx-auto py-8 px-4">
            <BatchOverview />
          </div>
        </RoleGuard>
      </AuthGuard>
    </>
  );
}
