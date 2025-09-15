import { UserManagementTable } from "@/components/admin/userManagementTable";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@/lib/types";

export default function AdminPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
        <div className="container max-w-7xl mx-auto py-8 px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and system configuration.
            </p>
          </div>
          <UserManagementTable />
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
