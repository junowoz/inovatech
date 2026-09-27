/**
 * Seeds the local D1 database (lookup tables + one dev admin user) so the app
 * has something to render/log in with after `pnpm db:migrate:local`.
 *
 * Run: pnpm db:seed:local
 * Requires: wrangler CLI (devDependency) and an already-migrated local D1
 * database (`pnpm db:migrate:local`).
 */

import { randomBytes } from "node:crypto";
import { webcrypto } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ITERATIONS = 210_000;
const DEV_ADMIN_EMAIL = "admin@inovatech.local";
const DEV_ADMIN_PASSWORD = "inovatech-dev-123";

// Mirrors lib/auth/password.ts (`pbkdf2$<iterations>$<saltHex>$<hashHex>`),
// duplicated here so this script has no dependency on the app's TS path
// aliases and can run standalone under `tsx`.
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await webcrypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashHex = Buffer.from(bits).toString("hex");
  return `pbkdf2$${ITERATIONS}$${salt.toString("hex")}$${hashHex}`;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const passwordHash = await hashPassword(DEV_ADMIN_PASSWORD);
  const adminId = crypto.randomUUID();

  const statements = [
    ...["2023", "2024", "2025", "2026"].map(
      (name) => `INSERT INTO year (name) VALUES (${sqlString(name)});`
    ),
    ...["1", "2"].map(
      (name) => `INSERT INTO semester (name) VALUES (${sqlString(name)});`
    ),
    ...["ADS", "Ciência da Computação", "Engenharia de Software"].map(
      (name) => `INSERT INTO course (name) VALUES (${sqlString(name)});`
    ),
    ...["Web", "Mobile", "IA", "IoT"].map(
      (name) => `INSERT INTO tech (name) VALUES (${sqlString(name)});`
    ),
    ...["Educação", "Saúde", "Finanças", "Varejo"].map(
      (name) => `INSERT INTO industry (name) VALUES (${sqlString(name)});`
    ),
    `INSERT INTO adminUser (id, email, passwordHash, name) VALUES (${sqlString(
      adminId
    )}, ${sqlString(DEV_ADMIN_EMAIL)}, ${sqlString(passwordHash)}, ${sqlString(
      "Admin"
    )});`,
  ];

  const dir = mkdtempSync(join(tmpdir(), "inovatech-seed-"));
  const file = join(dir, "seed.sql");
  writeFileSync(file, statements.join("\n"));

  try {
    execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "inovatech", "--local", "--file", file],
      { stdio: "inherit" }
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log(
    `\nSeeded local D1. Dev admin login: ${DEV_ADMIN_EMAIL} / ${DEV_ADMIN_PASSWORD}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
