/**
 * Production start script
 * - Validates required environment variables
 * - Runs Prisma migrations
 * - Starts the server
 */
const { execSync } = require("child_process");

// ── 1. Validate required env vars ────────────────────────────────────────────
const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error("\n❌  Missing required environment variables:");
  missing.forEach((k) => console.error(`    - ${k}`));
  console.error(
    "\n   In Railway: open your backend service → Variables tab → add the missing variables.\n"
  );
  process.exit(1);
}

// ── 2. Run database migrations ───────────────────────────────────────────────
console.log("⏳  Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅  Migrations applied.\n");
} catch (err) {
  console.error("❌  Migration failed:", err.message);
  process.exit(1);
}

// ── 3. Start the server ──────────────────────────────────────────────────────
console.log("🚀  Starting server...");
require("./dist/server.js");
