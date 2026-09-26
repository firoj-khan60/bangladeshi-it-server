import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { ClientLogoService } from "./clientLogo.service";

const getClientLogos = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientLogoService.getClientLogos();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Client logos retrieved successfully",
    data: result,
  });
});

const getPublicClientLogos = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientLogoService.getPublicClientLogos();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Client logos retrieved successfully",
    data: result,
  });
});

const createClientLogo = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, "Logo image is required");
  }
  const result = await ClientLogoService.createClientLogo({
    ...req.body,
    image: req.file.path,
  });
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Client logo added successfully",
    data: result,
  });
});

const updateClientLogo = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientLogoService.updateClientLogo(req.params.id as string, {
    ...req.body,
    ...(req.file && { image: req.file.path }),
  });
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Client logo updated successfully",
    data: result,
  });
});

const deleteClientLogo = catchAsync(async (req: Request, res: Response) => {
  await ClientLogoService.deleteClientLogo(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Client logo deleted successfully",
  });
});

const reorderClientLogos = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientLogoService.reorderClientLogos(req.body.ids);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Client logos reordered successfully",
    data: result,
  });
});

export const ClientLogoController = {
  getClientLogos,
  getPublicClientLogos,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
  reorderClientLogos,
};
