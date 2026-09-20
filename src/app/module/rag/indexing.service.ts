import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export class IndexingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    content: string,
    sourceLabel?: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "document_embeddings"
        (
          "id",
          "chunkKey",
          "sourceType",
          "sourceId",
          "sourceLabel",
          "content",
          "metadata",
          "embedding",
          "updatedAt"
        )
        VALUES
        (
          gen_random_uuid(),
          ${chunkKey},
          ${sourceType},
          ${sourceId},
          ${sourceLabel || null},
          ${content},
          ${JSON.stringify(metadata || {})} :: jsonb,
          CAST(${vectorLiteral} AS vector(2048)),
          NOW()
        )
        ON CONFLICT ("chunkKey")
        DO UPDATE SET
          "sourceType" = EXCLUDED."sourceType",
          "sourceId" = EXCLUDED."sourceId",
          "sourceLabel" = EXCLUDED."sourceLabel",
          "content" = EXCLUDED."content",
          "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding",
          "isDeleted" = false,
          "deletedAt" = null,
          "updatedAt" = NOW()
        `);
    } catch (error) {
      console.log("Error in indexDocument:", error);
      throw error;
    }
  }

  async indexSiteData() {
    try {
      console.log("Fetching site data for indexing....");

      // 1. Index published blog posts
      const blogs = await prisma.blog.findMany({
        where: { isPublished: true },
      });

      for (const blog of blogs) {
        const content = `Blog Title: ${blog.title}
            Excerpt: ${blog.excerpt ?? ""}
            Content: ${blog.content}`;

        await this.indexDocument(
          `blog-${blog.id}`,
          "BLOG",
          blog.id,
          content,
          blog.title,
          { blogId: blog.id, slug: blog.slug },
        );
      }

      // 2. Index FAQs
      const faqs = await prisma.faq.findMany({ where: { isActive: true } });
      for (const faq of faqs) {
        const content = `Question: ${faq.question}\nAnswer: ${faq.answer}`;

        await this.indexDocument(
          `faq-${faq.id}`,
          "FAQ",
          faq.id,
          content,
          faq.question,
          { faqId: faq.id },
        );
      }

      // 3. Index static page content (about, contact, terms, privacy, etc.)
      const pages = await prisma.pageContent.findMany();
      for (const page of pages) {
        const content = `Page Title: ${page.title}\nContent: ${page.content}`;

        await this.indexDocument(
          `page-${page.id}`,
          "PAGE",
          page.id,
          content,
          page.title,
          { pageId: page.id, slug: page.slug },
        );
      }

      return {
        success: true,
        message: `Indexed ${blogs.length} blog posts, ${faqs.length} FAQs, and ${pages.length} pages.`,
      };
    } catch (error) {
      console.log("Error in indexSiteData:", error);
      throw error;
    }
  }
}
