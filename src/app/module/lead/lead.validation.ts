import z from "zod";
import { LeadStatus } from "../../../generated/prisma/enums";

// Empty strings from optional form inputs are stored as null
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

export const createLeadZodSchema = z.object({
  name: z.string().trim().min(2, "name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,16}$/, "a valid phone number is required"),
  email: z
    .union([z.email("a valid email is required"), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
  service: z.string().trim().min(1, "service is required").max(100),
  businessName: optionalText(150),
  websiteUrl: optionalText(300),
  note: optionalText(2000),
  source: optionalText(100),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(150),
});

export const updateLeadStatusZodSchema = z.object({
  status: z.enum(LeadStatus),
});
