import { prisma } from "../../lib/prisma";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";

const getClientLogos = async () => {
  return prisma.clientLogo.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
};

const getPublicClientLogos = async () => {
  return prisma.clientLogo.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, image: true },
  });
};

const createClientLogo = async (payload: { name: string; image: string; isActive?: boolean }) => {
  // New logos go to the end of the list
  const last = await prisma.clientLogo.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  return prisma.clientLogo.create({
    data: { ...payload, order: (last?.order ?? -1) + 1 },
  });
};

const updateClientLogo = async (
  id: string,
  payload: { name?: string; isActive?: boolean; image?: string },
) => {
  const existing = await prisma.clientLogo.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Client logo not found");

  const updated = await prisma.clientLogo.update({ where: { id }, data: payload });
  if (payload.image && existing.image !== payload.image) {
    await deleteFileFromCloudinary(existing.image);
  }
  return updated;
};

const deleteClientLogo = async (id: string) => {
  const existing = await prisma.clientLogo.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Client logo not found");

  await prisma.clientLogo.delete({ where: { id } });
  await deleteFileFromCloudinary(existing.image);
};

const reorderClientLogos = async (ids: string[]) => {
  await prisma.$transaction(
    ids.map((id, index) => prisma.clientLogo.update({ where: { id }, data: { order: index } })),
  );
  return getClientLogos();
};

export const ClientLogoService = {
  getClientLogos,
  getPublicClientLogos,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
  reorderClientLogos,
};
