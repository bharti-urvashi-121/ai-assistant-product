
import { Router } from "express";
import multer from "multer";
import {
  uploadDocument,
  listDocuments,
} from "./documents.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!file.originalname.toLowerCase().endsWith(".txt")) {
      return callback(new Error("Only .txt files are supported."));
    }
    callback(null, true);
  },
});

router.post("/", requireAuth, upload.single("document"), uploadDocument);
router.get("/", requireAuth, listDocuments);

export default router;
