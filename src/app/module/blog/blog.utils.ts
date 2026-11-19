import { TBlogBlock } from "./blog.validation";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Drops blocks that carry nothing (empty heading/text, image without a file). */
export const cleanBlocks = (blocks: TBlogBlock[]) =>
  blocks.filter((block) => {
    if (block.type === "heading") return block.text.trim().length > 0;
    if (block.type === "text")
      return block.html.replace(/<[^>]*>/g, "").trim().length > 0;
    return Boolean(block.url);
  });

/** Flattens blocks into one HTML string, stored in `content` for search/RAG. */
export const blocksToHtml = (blocks: TBlogBlock[]) =>
  blocks
    .map((block) => {
      if (block.type === "heading") {
        const tag = block.level === 3 ? "h3" : "h2";
        return `<${tag}>${escapeHtml(block.text)}</${tag}>`;
      }
      if (block.type === "text") return block.html;
      const caption = block.caption
        ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
        : "";
      return `<figure><img src="${escapeHtml(block.url ?? "")}" alt="${escapeHtml(block.caption ?? "")}" />${caption}</figure>`;
    })
    .join("\n");

export const getBlockImageUrls = (blocks: unknown): string[] => {
  if (!Array.isArray(blocks)) return [];
  return (blocks as TBlogBlock[])
    .filter((b) => b?.type === "image" && b.url)
    .map((b) => (b as Extract<TBlogBlock, { type: "image" }>).url as string);
};
