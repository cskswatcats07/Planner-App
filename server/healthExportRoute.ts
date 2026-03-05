import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { authenticateJWT, requireUser } from '../middleware/auth';

// Example Express route for exporting encrypted JSON blobs.
// This assumes tables health_prescriptions and health_nutrition_entries
// exist as defined in the migrations, with BYTEA payload/iv/auth_tag.

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const healthExportRouter = express.Router();

healthExportRouter.get(
  '/health/export',
  authenticateJWT,
  requireUser,
  async (req: Request, res: Response) => {
    const user = req.auth!;

    const [prescriptions, nutrition] = await Promise.all([
      pool.query(
        `SELECT id, payload, iv, auth_tag, created_at, updated_at
         FROM health_prescriptions
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [user.sub]
      ),
      pool.query(
        `SELECT id, payload, iv, auth_tag, created_at, updated_at
         FROM health_nutrition_entries
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [user.sub]
      ),
    ]);

    // Return encrypted blobs only; no decryption on server for export.
    return res.json({
      prescriptions: prescriptions.rows,
      nutrition_entries: nutrition.rows,
    });
  }
);

