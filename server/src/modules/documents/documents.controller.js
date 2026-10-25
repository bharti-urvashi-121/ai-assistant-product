
import {
  createDocumentWithChunks,
  findDocumentsByOrganization,
} from "./documents.model.js";

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a .txt file.",
      });
    }

    const content = req.file.buffer.toString("utf8").trim();

    if (!content) {
      return res.status(400).json({
        message: "The document is empty.",
      });
    }

    const chunks = content.match(/[\s\S]{1,1000}/g) || [];

    const document = await createDocumentWithChunks({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      filename: req.file.originalname,
      chunks,
    });

    return res.status(201).json({
      message: "Document uploaded and processed successfully",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error.message);
    return res.status(500).json({
      message: "Unable to process document.",
    });
  }
}

export async function listDocuments(req, res) {
  try {
    const documents = await findDocumentsByOrganization(
      req.user.organizationId
    );

    return res.status(200).json({ documents });
  } catch (error) {
    console.error("List documents error:", error.message);
    return res.status(500).json({
      message: "Unable to list documents.",
    });
  }
}
