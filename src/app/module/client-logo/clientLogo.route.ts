import { Router, Request, Response, NextFunction } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { ClientLogoController } from "./clientLogo.controller";
import {
  createClientLogoZodSchema,
  reorderClientLogosZodSchema,
  updateClientLogoZodSchema,
} from "./clientLogo.validation";

const router = Router();

// Multipart requests carry their JSON fields in a `data` string
const parseMultipartData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body?.data) {
    req.body = JSON.parse(req.body.data);
  }
  next();
};

router.get("/public", ClientLogoController.getPublicClientLogos);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  ClientLogoController.getClientLogos,
);

// Declared before "/:id" so "reorder" isn't treated as an id
router.put(
  "/reorder",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(reorderClientLogosZodSchema),
  ClientLogoController.reorderClientLogos,
);

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("image"),
  parseMultipartData,
  validateRequest(createClientLogoZodSchema),
  ClientLogoController.createClientLogo,
);

router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("image"),
  parseMultipartData,
  validateRequest(updateClientLogoZodSchema),
  ClientLogoController.updateClientLogo,
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  ClientLogoController.deleteClientLogo,
);

export const ClientLogoRoutes = router;
