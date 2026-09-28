import { prisma } from "../../lib/prisma";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";

type TestimonialPayload = {
  name: string;
  role?: string;
  content: string;
  rating?: number;
  isActive?: boolean;
  avatar?: string;
};

const getTestimonials = async () => {
  return prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
};

const getPublicTestimonials = async () => {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, role: true, content: true, avatar: true, rating: true },
  });
};

const createTestimonial = async (payload: TestimonialPayload) => {
  // New testimonials go to the end of the list
  const last = await prisma.testimonial.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  return prisma.testimonial.create({
    data: { ...payload, order: (last?.order ?? -1) + 1 },
  });
};

const updateTestimonial = async (
  id: string,
  { removeAvatar, ...payload }: Partial<TestimonialPayload> & { removeAvatar?: boolean },
) => {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Testimonial not found");

  const updated = await prisma.testimonial.update({
    where: { id },
    data: { ...payload, ...(removeAvatar && !payload.avatar && { avatar: null }) },
  });

  // Old photo replaced or removed → delete it from Cloudinary
  if (existing.avatar && existing.avatar !== updated.avatar) {
    await deleteFileFromCloudinary(existing.avatar);
  }
  return updated;
};

const deleteTestimonial = async (id: string) => {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Testimonial not found");

  await prisma.testimonial.delete({ where: { id } });
  if (existing.avatar) await deleteFileFromCloudinary(existing.avatar);
};

const reorderTestimonials = async (ids: string[]) => {
  await prisma.$transaction(
    ids.map((id, index) => prisma.testimonial.update({ where: { id }, data: { order: index } })),
  );
  return getTestimonials();
};

export const TestimonialService = {
  getTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
};
