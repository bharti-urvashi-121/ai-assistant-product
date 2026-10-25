
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { askQuestion } from "./questions.controller.js";

const router = Router();

router.post("/", requireAuth, askQuestion);

export default router;
