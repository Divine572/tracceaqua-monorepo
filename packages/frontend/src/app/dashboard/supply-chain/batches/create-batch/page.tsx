import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@/lib/types";

import { BatchCreationWizard } from "@/components/supply-chain/batch-creation/BatchCreationWizard";

const CreateBatch = () => {
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
            <BatchCreationWizard />
          </div>
        </RoleGuard>
      </AuthGuard>
    </>
  );
};

export default CreateBatch;
