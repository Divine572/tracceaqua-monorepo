import z from "zod";

import { UserRole } from "@/lib/types";

export const roleApplicationSchema = z.object({
  requestedRole: z
    .enum(UserRole)
    .refine(
      (role) =>
        role !== UserRole.CONSUMER &&
        role !== UserRole.ADMIN &&
        role !== UserRole.PENDING_UPGRADE,
      "Please select a valid professional role"
    ),
  organization: z.string().optional(),
  licenseNumber: z.string().optional(),
  businessType: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),
});

export type RoleApplicationData = z.infer<typeof roleApplicationSchema>