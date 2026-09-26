import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { leadSubmitRateLimiter } from "../../middleware/rateLimiter";
import { Role } from "../../../generated/prisma/enums";
import { LeadController } from "./lead.controller";
import { createLeadZodSchema, updateLeadStatusZodSchema } from "./lead.validation";

const router = express.Router();

router.post(
  "/",
  leadSubmitRateLimiter,
  validateRequest(createLeadZodSchema),
  LeadController.createLead,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  LeadController.getLeads,
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateLeadStatusZodSchema),
  LeadController.updateLeadStatus,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  LeadController.deleteLead,
);

export const LeadRoutes = router;
