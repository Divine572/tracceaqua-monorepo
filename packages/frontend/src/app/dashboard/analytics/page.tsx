import { AnalyticsDashboard } from "@/components/dashboard/DashboardHome";
// import { AuthGuard } from '@/components/auth/auth-guard'
// import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from "@/lib/types";

export default function AnalyticsPage() {
  return (
    <>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <AnalyticsDashboard />
      </div>
    </>
    // <AuthGuard>
    //   <RoleGuard allowedRoles={[
    //     UserRole.FARMER,
    //     UserRole.FISHERMAN,
    //     UserRole.PROCESSOR,
    //     UserRole.TRADER,
    //     UserRole.RETAILER,
    //     UserRole.RESEARCHER,
    //     UserRole.ADMIN
    //   ]}>
    //     <div className="container max-w-7xl mx-auto py-8 px-4">
    //       <AnalyticsDashboard />
    //     </div>
    //   </RoleGuard>
    // </AuthGuard>
  );
}
