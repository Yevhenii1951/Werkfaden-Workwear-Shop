import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const infraPath = join(projectRoot, ".env");
const backendPath = join(projectRoot, "apps/backend/.env");
const storefrontPath = join(projectRoot, "apps/storefront/.env.local");
const privateDirectory = join(projectRoot, ".local");

// Refuse partial setup rather than silently mismatching database credentials.
if ([infraPath, backendPath, storefrontPath].some(existsSync)) {
  process.stderr.write("Local env already exists or setup is partial. Preserve it and finish configuration manually.\n");
  process.exit(1);
}

const databasePassword = randomBytes(24).toString("hex");
const jwtSecret = randomBytes(32).toString("hex");
const cookieSecret = randomBytes(32).toString("hex");

mkdirSync(privateDirectory, { recursive: true, mode: 0o700 });
writeFileSync(infraPath, `WORKWEAR_DB_PASSWORD=${databasePassword}\n`, { mode: 0o600, flag: "wx" });
writeFileSync(backendPath, [
  "NODE_ENV=development",
  "STORE_CORS=http://localhost:8000",
  "ADMIN_CORS=http://localhost:5173,http://localhost:9000",
  "AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000",
  `DATABASE_URL=postgres://werkfaden:${databasePassword}@127.0.0.1:5544/werkfaden_dev`,
  "DB_NAME=werkfaden_dev",
  "REDIS_URL=redis://127.0.0.1:6384",
  `JWT_SECRET=${jwtSecret}`,
  `COOKIE_SECRET=${cookieSecret}`,
  "",
].join("\n"), { mode: 0o600, flag: "wx" });
writeFileSync(storefrontPath, [
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=",
  "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000",
  "NEXT_PUBLIC_DEFAULT_REGION=de",
  "NEXT_PUBLIC_BASE_URL=http://localhost:8000",
  "NEXT_PUBLIC_STRIPE_KEY=",
  "",
].join("\n"), { mode: 0o600, flag: "wx" });

process.stdout.write("Local env created privately. Add storefront publishable key after catalog setup. No payment provider configured.\n");
