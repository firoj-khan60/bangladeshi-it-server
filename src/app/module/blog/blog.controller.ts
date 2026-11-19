import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BlogService } from "./blog.service";
import { TBlogBlock } from "./blog.validation";

const BLOCK_IMAGE_PREFIX = "blockImage_";

/** Puts uploaded cover + block image URLs onto the parsed body. */
const attachUploads = (req: Request) => {
  const payload = { ...req.body };
  const files = Array.isArray(req.files) ? req.files : [];

  const cover = files.find((f) => f.fieldname === "coverImage");
  if (cover) payload.coverImage = cover.path;

  if (Array.isArray(payload.blocks)) {
    const byBlockId = new Map(
      files
        .filter((f) => f.fieldname.startsWith(BLOCK_IMAGE_PREFIX))
        .map((f) => [f.fieldname.slice(BLOCK_IMAGE_PREFIX.length), f.path]),
    );
    payload.blocks = payload.blocks.map((block: TBlogBlock) =>
      block.type === "image" && byBlockId.has(block.id)
        ? { ...block, url: byBlockId.get(block.id) }
        : block,
    );
  }

  return payload;
};

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const payload = attachUploads(req);

  const result = await BlogService.createBlog(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Blog created successfully",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await BlogService.getAllBlogs(
    req.query as IQueryParams,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blogs fetched successfully",
    data,
    meta,
  });
});

const getAllBlogsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await BlogService.getAllBlogsAdmin(
    req.query as IQueryParams,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blogs fetched successfully",
    data,
    meta,
  });
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getBlogById(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getBlogBySlug(req.params.slug as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const payload = attachUploads(req);

  const result = await BlogService.updateBlog(
    req.params.id as string,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog updated successfully",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.deleteBlog(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
