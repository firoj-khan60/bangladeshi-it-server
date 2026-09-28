import { Router, Request, Response, NextFunction } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { TestimonialController } from "./testimonial.controller";
import {
  createTestimonialZodSchema,
  reorderTestimonialsZodSchema,
  updateTestimonialZodSchema,
} from "./testimonial.validation";

const router = Router();

// Multipart requests carry their JSON fields in a `data` string
const parseMultipartData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body?.data) {
    req.body = JSON.parse(req.body.data);
  }
  next();
};

router.get("/public", TestimonialController.getPublicTestimonials);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  TestimonialController.getTestimonials,
);

// Declared before "/:id" so "reorder" isn't treated as an id
router.put(
  "/reorder",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(reorderTestimonialsZodSchema),
  TestimonialController.reorderTestimonials,
);

router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("avatar"),
  parseMultipartData,
  validateRequest(createTestimonialZodSchema),
  TestimonialController.createTestimonial,
);

router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("avatar"),
  parseMultipartData,
  validateRequest(updateTestimonialZodSchema),
  TestimonialController.updateTestimonial,
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  TestimonialController.deleteTestimonial,
);

export const TestimonialRoutes = router;
