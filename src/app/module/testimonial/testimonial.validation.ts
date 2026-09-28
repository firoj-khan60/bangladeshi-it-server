import z from "zod";

export const createTestimonialZodSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100),
  role: z.string().trim().max(150).optional(),
  content: z.string().trim().min(1, "content is required").max(1000),
  rating: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
});

export const updateTestimonialZodSchema = createTestimonialZodSchema.partial().extend({
  // Set when the admin clears the photo without uploading a new one
  removeAvatar: z.boolean().optional(),
});

export const reorderTestimonialsZodSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
