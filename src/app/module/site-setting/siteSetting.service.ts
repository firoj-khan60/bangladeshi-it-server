import { prisma } from "../../lib/prisma";

const getSiteSettings = async () => {
  let settings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.siteSetting.create({
      data: { id: "default" },
    });
  }

  return settings;
};

const updateSiteSettings = async (payload: {
  siteName?: string;
  tagline?: string;
  description?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  whatsapp?: string;
  copyrightText?: string;
}) => {
  // Ensure the default settings row exists first
  await getSiteSettings();

  const result = await prisma.siteSetting.update({
    where: { id: "default" },
    data: payload,
  });

  return result;
};

export const SiteSettingService = {
  getSiteSettings,
  updateSiteSettings,
};
