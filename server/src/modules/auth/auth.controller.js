import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../config/database.js";

const makeSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function register(req, res) {
  const { organizationName, name, email, password } = req.body;

  if (!organizationName || !name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "organizationName, name, email and password are required"
    });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 8 characters"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slugBase = makeSlug(organizationName) || "organization";
    const assistantSlug = `${slugBase}-${Date.now().toString(36)}`;

    const orgResult = await client.query(
      `INSERT INTO organizations (name, assistant_slug)
       VALUES ($1, $2) RETURNING id, name, assistant_slug`,
      [organizationName.trim(), assistantSlug]
    );

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO users (organization_id, name, email, password_hash)
       VALUES ($1, $2, LOWER($3), $4)
       RETURNING id, organization_id, name, email`,
      [orgResult.rows[0].id, name.trim(), email.trim(), passwordHash]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "Organization registered successfully",
      organization: orgResult.rows[0],
      user: userResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "An account with these details already exists"
      });
    }

    console.error("Registration failed:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Registration failed"
    });
  } finally {
    client.release();
  }
}

export async function login(req, res) {
  const { organizationSlug, email, password } = req.body;

  if (!organizationSlug || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "organizationSlug, email and password are required"
    });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.organization_id, u.name, u.email, u.password_hash,
              o.name AS organization_name, o.assistant_slug
       FROM users u
       JOIN organizations o ON o.id = u.organization_id
       WHERE o.assistant_slug = $1 AND u.email = LOWER($2)
       LIMIT 1`,
      [organizationSlug, email.trim()]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        status: "error",
        message: "Invalid organization, email or password"
      });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.error("JWT_SECRET is missing or too short");
      return res.status(500).json({
        status: "error",
        message: "Authentication is not configured"
      });
    }

    const token = jwt.sign(
      { sub: String(user.id), organizationId: String(user.organization_id) },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        organizationSlug: user.assistant_slug
      }
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Login failed"
    });
  }
}