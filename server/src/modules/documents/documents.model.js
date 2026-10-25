
import pool from "../../config/database.js";

export async function createDocumentWithChunks({
  organizationId,
  userId,
  filename,
  chunks,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO documents
       (organization_id, uploaded_by, filename, storage_path, status)
       VALUES ($1, $2, $3, $4, 'processing')
       RETURNING id, filename, status, created_at`,
      [organizationId, userId, filename, "database-text-chunks"]
    );

    const document = result.rows[0];

    for (let i = 0; i < chunks.length; i++) {
      await client.query(
        `INSERT INTO document_chunks
         (document_id, organization_id, chunk_index, content)
         VALUES ($1, $2, $3, $4)`,
        [document.id, organizationId, i, chunks[i]]
      );
    }

    await client.query(
      "UPDATE documents SET status = 'ready' WHERE id = $1",
      [document.id]
    );

    await client.query("COMMIT");

    return {
      ...document,
      status: "ready",
      chunksCreated: chunks.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findDocumentsByOrganization(organizationId) {
  const result = await pool.query(
    `SELECT id, filename, status, created_at
     FROM documents
     WHERE organization_id = $1
     ORDER BY created_at DESC`,
    [organizationId]
  );

  return result.rows;
}
