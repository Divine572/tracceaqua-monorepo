"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const cookie = new Cookies();

  const router = useRouter();

  console.log(user)

  return (
    <AuthGuard>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>
        <ProfileForm userData={user} />
      </div>
    </AuthGuard>
  );
}
