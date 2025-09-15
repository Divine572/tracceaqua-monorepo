"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { UserRole } from "@/lib/types";
import { Loader2, Info } from "lucide-react";
import {
  roleApplicationSchema,
  RoleApplicationData,
} from "@/zod/schemas/role-application-schema";
import { useRouter } from "next/navigation";

const professionalRoles = [
  {
    value: UserRole.RESEARCHER,
    label: "Researcher",
    description: "Conservation data collection and analysis",
  },
  {
    value: UserRole.FARMER,
    label: "Farmer",
    description: "Aquaculture and shellfish farming",
  },
  {
    value: UserRole.FISHERMAN,
    label: "Fisherman",
    description: "Wild-capture shellfish harvesting",
  },
  {
    value: UserRole.PROCESSOR,
    label: "Processor",
    description: "Shellfish processing and packaging",
  },
  {
    value: UserRole.TRADER,
    label: "Trader",
    description: "Distribution and wholesale trading",
  },
  {
    value: UserRole.RETAILER,
    label: "Retailer",
    description: "Retail sales and consumer interface",
  },
];

export function RoleApplicationForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoleApplicationData>({
    resolver: zodResolver(roleApplicationSchema),
  });

  const onSubmit = async (data: RoleApplicationData) => {
    setIsLoading(true);
    try {
      console.log("Role application:", data);

      const response = await fetch("/api/role-application", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to submit application");

      const result = response.json();

      console.log(result);

      toast.success(
        "Your role application has been submitted for review. You'll be notified of the decision via email."
      );
      router.push("/dashboard")
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== UserRole.CONSUMER) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You already have a professional role: <strong>{user?.role}</strong>.
          Only consumers can apply for professional roles.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Professional Role</CardTitle>
        <CardDescription>
          Apply for a professional role to access advanced features of
          TracceAqua. All applications are reviewed by administrators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="requestedRole">Requested Role</Label>
            <Select
              onValueChange={(value) =>
                setValue("requestedRole", value as UserRole)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the role you're applying for" />
              </SelectTrigger>
              <SelectContent>
                {professionalRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestedRole && (
              <p className="text-sm text-destructive">
                {errors.requestedRole.message}
              </p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization/Company</Label>
            <Input
              id="organization"
              placeholder="Your organization or company name"
              {...register("organization")}
            />
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Professional License Number</Label>
            <Input
              id="licenseNumber"
              placeholder="Enter your license number"
              {...register("licenseNumber")}
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">Type of Business</Label>
            <Input
              id="businessType"
              placeholder="e.g. Aquaculture, Processing, Trading"
              {...register("businessType")}
            />
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              placeholder="e.g. 5 years"
              {...register("experience")}
            />
          </div>

          {/* Motivation */}
          <div className="space-y-2">
            <Label htmlFor="motivation">Motivation</Label>
            <Textarea
              id="motivation"
              placeholder="Explain why you are applying for this role..."
              className="min-h-[120px]"
              {...register("motivation")}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>

          {/* Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Applications are typically reviewed within 2-3 business days.
              You'll receive an email notification with the decision.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
}
