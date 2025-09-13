import { AuthGuard } from "@/components/auth/AuthGuard"
import { RoleApplicationForm } from "@/components/profile/RoleApplicationForm"

export default function RoleApplicationPage() {
  return (
    <AuthGuard>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Professional Role Application</h1>
          <p className="text-muted-foreground">
            Apply for advanced access to TracceAqua's professional features.
          </p>
        </div>        
        <RoleApplicationForm />
      </div>
    </AuthGuard>
  )
}