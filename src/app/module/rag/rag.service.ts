/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";
import { LLMService } from "./llm.service";

export class RAGService {
  private embeddingService: EmbeddingService;
  private llmService: LLMService;
  private indexingService: IndexingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.indexingService = new IndexingService();
    this.llmService = new LLMService();
  }

  async ingestData() {
    return this.indexingService.indexSiteData();
  }

  async retrieveRelevantDocuments(
    query: string,
    limit: number = 5,
    sourceType?: string,
  ) {
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;

      const results = await prisma.$queryRaw(Prisma.sql`
          SELECT id, "chunkKey", "sourceType", "sourceId", "sourceLabel", content, metadata, 1 - (embedding <=> CAST(${vectorLiteral} AS vector(2048))) as similarity
          FROM "document_embeddings"
          WHERE "isDeleted" = false
          ${sourceType ? Prisma.sql`AND "sourceType" = ${sourceType}` : Prisma.empty}
          ORDER BY embedding <=> CAST(${vectorLiteral} AS vector(2048))
          Limit ${limit}
          `);

      return results;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async generateAnswer(
    query: string,
    limit: number = 5,
    sourceType?: string,
    asJson: boolean = false,
  ) {
    try {
      const relevantDocs = await this.retrieveRelevantDocuments(
        query,
        limit,
        sourceType,
      );

      const context = (relevantDocs as any)
        .filter((doc: any) => doc.content)
        .map((doc: any) => doc.content);

      let answer = await this.llmService.generateResponse(
        query,
        context,
        asJson,
      );

      // Simple cleanup for JSON responses if needed
      if (asJson && typeof answer === 'string') {
        answer = answer.replace(/```json\n?/, "").replace(/```$/, "").trim();
        try {
          answer = JSON.parse(answer);
        } catch (e) {
          console.error("JSON Parse failed, returning raw string");
        }
      }

      return {
        answer,
        sources: (relevantDocs as any).map((doc: any) => ({
          id: doc.id,
          sourceType: doc.sourceType,
          sourceLabel: doc.sourceLabel,
          similarity: doc.similarity,
        })),
        contextUsed: context.length > 0,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getStats() {
    const totalDocuments: any = await prisma.$queryRaw(Prisma.sql`
        SELECT COUNT(*) as count FROM "document_embeddings" WHERE "isDeleted" = false;
    `);

    return {
      totalActiveDocuments: Number(totalDocuments[0]?.count ?? 0),
      timestamp: new Date(),
    };
  }
}
