// components/auth/role-guard.tsx
// TracceAqua - Role-based Authorization Guard Component

"use client";

import Link from "next/link";
import { UserRole, USER_ROLE_LABELS } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Lock,
  AlertTriangle,
  Info,
  ArrowLeft,
  UserCheck,
  Crown,
  FileText,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
// import useAuthStore from "@/stores/auth-store";
import { useAuth } from "@/hooks/use-auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  showAlternatives?: boolean;
  redirectTo?: string;
  requireVerification?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  showAlternatives = true,
  redirectTo = "/dashboard",
  requireVerification = false,
}: RoleGuardProps) {
  // const { user } = useAuth();
  const { user: authenticatedUser } = useDynamicContext();
  const { user } = useAuth();
  const router = useRouter();

  // If not authenticated, let AuthGuard handle this
  if (!authenticatedUser || !user) {
    console.log(authenticatedUser, user);
    return (
      <div>
        <DynamicWidget/>
      </div>
    );
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  // Check if user needs verification and verification is required
  const needsVerification = requireVerification && user.status === "PENDING";

  // Show verification required message
  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle>Account Verification Required</CardTitle>
            <CardDescription>
              Your account needs to be verified before accessing this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please wait for an administrator to verify your account, or
                contact support for assistance.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/profile")}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push(redirectTo)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role upgrade needed for CONSUMER or PENDING_UPGRADE
  if (
    !hasRequiredRole &&
    (user.role === UserRole.CONSUMER || user.role === UserRole.PENDING_UPGRADE)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Professional Role Required</CardTitle>
            <CardDescription>
              This feature requires a professional role to access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Your current role:
                </span>
                <Badge variant="outline">
                  {USER_ROLE_LABELS[user.role] || user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You need one of the following roles to access this feature:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {allowedRoles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {USER_ROLE_LABELS[role] || role}
                  </Badge>
                ))}
              </div>
            </div>

            {user.role === UserRole.CONSUMER && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can apply for a professional role to access supply chain
                  management features.
                </AlertDescription>
              </Alert>
            )}

            {user.role === UserRole.PENDING_UPGRADE && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your role upgrade application is being reviewed. You'll be
                  notified once approved.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {user.role === UserRole.CONSUMER && (
                <Link href="/dashboard/profile/role-application" className="w-full">
                  <Button className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Apply for Professional Role
                  </Button>
                </Link>
              )}

              {showAlternatives && (
                <div className="mt-2">
                  <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/trace" className="w-full">
                    <Button variant="ghost" className="w-full">
                      View Public Traces
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show insufficient permissions for other roles
  if (!hasRequiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Your current role:
                </span>
                <Badge variant="outline">
                  {USER_ROLE_LABELS[user.role] || user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Required roles:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {allowedRoles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {USER_ROLE_LABELS[role] || role}
                  </Badge>
                ))}
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                If you believe this is an error, please contact your
                administrator or support team.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(redirectTo)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              {user.role === UserRole.ADMIN && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/dashboard/admin")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has required role, render protected content
  return <>{children}</>;
}

// Higher-order component wrapper
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  options?: Omit<RoleGuardProps, "children" | "allowedRoles">
) {
  return function RoleGuardedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} {...options}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

// Hook to check role permissions
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.some((role) => user.role === role);
  };

  const hasAllRoles = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.every((role) => user.role === role);
  };

  return {
    isAuthenticated,
    user,
    userRole: user?.role,
    hasRequiredRole: hasRole(allowedRoles),
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess:
      isAuthenticated && hasRole(allowedRoles) && user?.status === "ACTIVE",
    isConsumer: user?.role === UserRole.CONSUMER,
    isPendingUpgrade: user?.role === UserRole.PENDING_UPGRADE,
    isAdmin: user?.role === UserRole.ADMIN,
    isResearcher: user?.role === UserRole.RESEARCHER,
    isSupplyChainRole:
      user &&
      [
        UserRole.FARMER,
        UserRole.FISHERMAN,
        UserRole.PROCESSOR,
        UserRole.TRADER,
        UserRole.RETAILER,
      ].includes(user.role),
  };
}

// Utility function to get role hierarchy level (for comparison)
export function getRoleLevel(role: UserRole): number {
  const hierarchy = {
    [UserRole.CONSUMER]: 0,
    [UserRole.PENDING_UPGRADE]: 1,
    [UserRole.RETAILER]: 2,
    [UserRole.TRADER]: 3,
    [UserRole.PROCESSOR]: 4,
    [UserRole.FISHERMAN]: 5,
    [UserRole.FARMER]: 5,
    [UserRole.RESEARCHER]: 6,
    [UserRole.ADMIN]: 10,
  };
  return hierarchy[role] || 0;
}

// Check if user has minimum role level
export function hasMinimumRole(
  userRole: UserRole,
  minimumRole: UserRole
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}
