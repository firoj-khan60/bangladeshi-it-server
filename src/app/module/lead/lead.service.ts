import { prisma } from "../../lib/prisma";
import { LeadStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import { NotificationService } from "../notification/notification.service";

type CreateLeadPayload = {
  name: string;
  phone: string;
  email?: string;
  service: string;
  businessName?: string;
  websiteUrl?: string;
  note?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

const createLead = async (payload: CreateLeadPayload) => {
  const lead = await prisma.lead.create({ data: payload });

  // A failed notification must not fail the visitor's submission
  NotificationService.notifyAdmins(
    "New lead received",
    `${lead.name} (${lead.phone}) requested ${lead.service}`,
  ).catch((error) => console.error("Failed to notify admins of new lead:", error));

  return { id: lead.id };
};

type GetLeadsQuery = {
  page: number;
  limit: number;
  status?: LeadStatus;
  source?: string;
  searchTerm?: string;
  sortOrder: "asc" | "desc";
};

const getLeads = async ({ page, limit, status, source, searchTerm, sortOrder }: GetLeadsQuery) => {
  const where: Prisma.LeadWhereInput = {
    ...(status && { status }),
    ...(source && { source }),
    ...(searchTerm && {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { businessName: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateLeadStatus = async (id: string, status: LeadStatus) => {
  return prisma.lead.update({ where: { id }, data: { status } });
};

const deleteLead = async (id: string) => {
  return prisma.lead.delete({ where: { id } });
};

export const LeadService = {
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
};
