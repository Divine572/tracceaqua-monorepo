import { MultiStepSamplingForm } from "@/components/conservation/sampling-form/MultiStepForm";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@/lib/types";

export default function NewSamplingRecordPage() {
  const handleSave = (data: any) => {
    // TODO: Implement save as draft API call
    console.log("Saving draft:", data);
  };

  const handleSubmit = (data: any) => {
    // TODO: Implement submit API call
    console.log("Submitting record:", data);
  };

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={[UserRole.RESEARCHER, UserRole.ADMIN]}>
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">New Sampling Record</h1>
            <p className="text-muted-foreground">
              Create a comprehensive conservation sampling record
            </p>
          </div>

          <MultiStepSamplingForm
            // onSave={handleSave}
            // onSubmit={handleSubmit}
          />
        </div>
      </RoleGuard>
    </AuthGuard>
    
  );
}
