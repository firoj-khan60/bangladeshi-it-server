import status from "http-status";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import AppError from "../../errorHelpers/AppError";
import { generateUniqueSlug } from "../../utils/generateSlug";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { TBlogBlock } from "./blog.validation";
import { blocksToHtml, cleanBlocks, getBlockImageUrls } from "./blog.utils";

const deleteImages = async (urls: string[]) => {
  await Promise.all(
    urls.map((url) => deleteFileFromCloudinary(url).catch(() => undefined)),
  );
};

const createBlog = async (payload: {
  title: string;
  excerpt?: string;
  content?: string;
  blocks?: TBlogBlock[];
  coverImage?: string;
  author?: string;
  isPublished?: boolean;
}) => {
  const { blocks: rawBlocks, content: rawContent, ...rest } = payload;
  const blocks = rawBlocks ? cleanBlocks(rawBlocks) : undefined;
  const content = blocks?.length ? blocksToHtml(blocks) : rawContent?.trim();

  if (!content) {
    await deleteImages(getBlockImageUrls(rawBlocks));
    if (rest.coverImage) await deleteImages([rest.coverImage]);
    throw new AppError(status.BAD_REQUEST, "Content is required");
  }

  const slug = await generateUniqueSlug(prisma, payload.title, "blog");

  const blog = await prisma.blog.create({
    data: { ...rest, content, ...(blocks?.length ? { blocks } : {}), slug },
  });

  return blog;
};

const getAllBlogs = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.blog, queryParams, {
    searchableFields: ["title"],
  })
    .search()
    .filter()
    .where({ isPublished: true })
    .sort()
    .paginate()
    .execute();

  return result;
};

const getAllBlogsAdmin = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.blog, queryParams, {
    searchableFields: ["title"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  return result;
};

const getBlogById = async (id: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new AppError(status.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const getBlogBySlug = async (slug: string) => {
  const blog = await prisma.blog.findUnique({ where: { slug } });

  if (!blog || !blog.isPublished) {
    throw new AppError(status.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const updateBlog = async (
  id: string,
  payload: {
    title?: string;
    excerpt?: string;
    content?: string;
    blocks?: TBlogBlock[];
    coverImage?: string;
    author?: string;
    isPublished?: boolean;
    removeCoverImage?: boolean;
  },
) => {
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Blog not found");
  }

  const { removeCoverImage, blocks: rawBlocks, ...rest } = payload;
  const oldBlockImages = getBlockImageUrls(existing.blocks);

  let blocksData: { blocks: TBlogBlock[]; content: string } | undefined;
  if (rawBlocks) {
    const blocks = cleanBlocks(rawBlocks);
    if (!blocks.length) {
      // Undo the uploads that came with this rejected request
      const old = new Set(oldBlockImages);
      await deleteImages(
        getBlockImageUrls(rawBlocks).filter((url) => !old.has(url)),
      );
      throw new AppError(status.BAD_REQUEST, "Content is required");
    }
    blocksData = { blocks, content: blocksToHtml(blocks) };
  }

  let slug: string | undefined;
  if (payload.title && payload.title !== existing.title) {
    slug = await generateUniqueSlug(prisma, payload.title, "blog", id);
  }

  let coverImage: string | null | undefined = rest.coverImage;
  if (rest.coverImage && existing.coverImage) {
    await deleteFileFromCloudinary(existing.coverImage);
  } else if (removeCoverImage && existing.coverImage && !rest.coverImage) {
    await deleteFileFromCloudinary(existing.coverImage);
    coverImage = null;
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { ...rest, ...blocksData, coverImage, ...(slug && { slug }) },
  });

  // Remove images that were dropped from the post
  if (blocksData) {
    const keep = new Set(getBlockImageUrls(blocksData.blocks));
    await deleteImages(oldBlockImages.filter((url) => !keep.has(url)));
  }

  return updated;
};

const deleteBlog = async (id: string) => {
  const existing = await prisma.blog.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Blog not found");
  }

  await prisma.blog.delete({ where: { id } });

  if (existing.coverImage) {
    await deleteFileFromCloudinary(existing.coverImage);
  }
  await deleteImages(getBlockImageUrls(existing.blocks));

  return { message: "Blog deleted successfully" };
};

export const BlogService = {
  createBlog,
  getAllBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
