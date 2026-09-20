import { Router } from "express";
import { RagController } from "./rag.controller";

const router = Router();

router.get("/stats", RagController.getStats);

// Index site data — blogs, FAQs, pages (Admin only ideally)
router.post("/ingest", RagController.ingestData);

// Query RAG (Public or User)
router.post("/query", RagController.queryRag);

export const RagRoutes = router;
