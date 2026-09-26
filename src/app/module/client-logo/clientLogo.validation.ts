import z from "zod";

export const createClientLogoZodSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100),
  isActive: z.boolean().optional(),
});

export const updateClientLogoZodSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const reorderClientLogosZodSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
