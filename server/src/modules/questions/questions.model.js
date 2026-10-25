
import pool from "../../config/database.js";

export async function searchRelevantChunks(organizationId, question) {
  const result = await pool.query(
    `SELECT
       dc.content,
       d.id AS document_id,
       d.filename,
       ts_rank(
         to_tsvector('english', dc.content),
         plainto_tsquery('english', $2)
       ) AS score
     FROM document_chunks dc
     JOIN documents d
       ON d.id = dc.document_id
      AND d.organization_id = dc.organization_id
     WHERE dc.organization_id = $1
       AND to_tsvector('english', dc.content)
           @@ plainto_tsquery('english', $2)
     ORDER BY score DESC
     LIMIT 3`,
    [organizationId, question]
  );

  return result.rows;
}
