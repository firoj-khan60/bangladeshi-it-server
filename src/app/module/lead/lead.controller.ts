import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { LeadStatus } from "../../../generated/prisma/enums";
import { LeadService } from "./lead.service";

const createLead = catchAsync(async (req: Request, res: Response) => {
  const result = await LeadService.createLead(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Thank you! We will contact you shortly.",
    data: result,
  });
});

const getLeads = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const status = Object.values(LeadStatus).includes(req.query.status as LeadStatus)
    ? (req.query.status as LeadStatus)
    : undefined;

  const source = typeof req.query.source === "string" && req.query.source ? req.query.source : undefined;
  const searchTerm =
    typeof req.query.searchTerm === "string" && req.query.searchTerm.trim()
      ? req.query.searchTerm.trim()
      : undefined;
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const { leads, meta } = await LeadService.getLeads({ page, limit, status, source, searchTerm, sortOrder });
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Leads retrieved successfully",
    data: leads,
    meta,
  });
});

const updateLeadStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await LeadService.updateLeadStatus(
    req.params.id as string,
    req.body.status,
  );
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Lead status updated successfully",
    data: result,
  });
});

const deleteLead = catchAsync(async (req: Request, res: Response) => {
  await LeadService.deleteLead(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Lead deleted successfully",
  });
});

export const LeadController = {
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
};
