import z from "zod";

const blockId = z.string().min(1).max(64);

export const blogBlockZodSchema = z.discriminatedUnion("type", [
  z.object({
    id: blockId,
    type: z.literal("heading"),
    text: z.string(),
    level: z.union([z.literal(2), z.literal(3)]).default(2),
  }),
  z.object({
    id: blockId,
    type: z.literal("text"),
    html: z.string(),
  }),
  z.object({
    id: blockId,
    type: z.literal("image"),
    url: z.string().optional(),
    caption: z.string().optional(),
  }),
]);

export type TBlogBlock = z.infer<typeof blogBlockZodSchema>;

// "content or blocks required" is checked in the service
export const createBlogZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  blocks: z.array(blogBlockZodSchema).max(100).optional(),
  author: z.string().optional(),
  isPublished: z.boolean().optional().default(false),
});

export const updateBlogZodSchema = z.object({
  title: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  blocks: z.array(blogBlockZodSchema).max(100).optional(),
  author: z.string().optional(),
  isPublished: z.boolean().optional(),
  removeCoverImage: z.boolean().optional(),
});
