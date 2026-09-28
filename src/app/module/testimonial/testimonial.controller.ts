import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TestimonialService } from "./testimonial.service";

const getTestimonials = catchAsync(async (req: Request, res: Response) => {
  const result = await TestimonialService.getTestimonials();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Testimonials retrieved successfully",
    data: result,
  });
});

const getPublicTestimonials = catchAsync(async (req: Request, res: Response) => {
  const result = await TestimonialService.getPublicTestimonials();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Testimonials retrieved successfully",
    data: result,
  });
});

const createTestimonial = catchAsync(async (req: Request, res: Response) => {
  const result = await TestimonialService.createTestimonial({
    ...req.body,
    ...(req.file && { avatar: req.file.path }),
  });
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Testimonial added successfully",
    data: result,
  });
});

const updateTestimonial = catchAsync(async (req: Request, res: Response) => {
  const result = await TestimonialService.updateTestimonial(req.params.id as string, {
    ...req.body,
    ...(req.file && { avatar: req.file.path }),
  });
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Testimonial updated successfully",
    data: result,
  });
});

const deleteTestimonial = catchAsync(async (req: Request, res: Response) => {
  await TestimonialService.deleteTestimonial(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Testimonial deleted successfully",
  });
});

const reorderTestimonials = catchAsync(async (req: Request, res: Response) => {
  const result = await TestimonialService.reorderTestimonials(req.body.ids);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Testimonials reordered successfully",
    data: result,
  });
});

export const TestimonialController = {
  getTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
};
