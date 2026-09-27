/**
 * Turn a private Supabase JSON export into SQL for the existing D1 schema.
 *
 * Usage:
 *   node scripts/prepare-supabase-import.mjs \
 *     /path/to/supabase-export.json /path/to/storage-manifest.json \
 *     /path/to/import.sql /path/to/admin-credentials.json
 *
 * Keep all four files outside the repository. The output contains project
 * contacts and password hashes; the credentials file contains a new password.
 */

import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [sourceArg, storageArg, outputArg, credentialsArg] =
  process.argv.slice(2);
if (!sourceArg || !storageArg || !outputArg || !credentialsArg) {
  console.error(
    "Expected source JSON, storage manifest, SQL output, and credentials output paths."
  );
  process.exit(1);
}

const source = JSON.parse(readFileSync(resolve(sourceArg), "utf8"));
const storage = JSON.parse(readFileSync(resolve(storageArg), "utf8"));
const outputPath = resolve(outputArg);
const credentialsPath = resolve(credentialsArg);

const tables = [
  ["year", ["id", "name"]],
  ["semester", ["id", "name"]],
  ["course", ["id", "name"]],
  ["tech", ["id", "name"]],
  ["industry", ["id", "name"]],
  [
    "project",
    [
      "id",
      "projectUUID",
      "name",
      "slogan",
      "projectDescription",
      "targetAudience",
      "productDescription",
      "projectViability",
      "link",
      "year",
      "semester",
      "course",
      "tech",
      "industry",
      "logoImg",
      "teamImg",
      "productImg",
      "date",
      "status",
    ],
  ],
  ["member", ["id", "projectUUID", "name", "contact", "isFounder", "isLeader"]],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sqlValue(value) {
  if (value === null) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number" && Number.isSafeInteger(value))
    return String(value);
  if (typeof value === "string") return `'${value.replaceAll("'", "''")}'`;
  throw new Error(`Unsupported SQL value type: ${typeof value}`);
}

function destinationMediaPath(path) {
  // Cloudflare's API rejects a legacy key containing '..' in its URL path.
  return path.replaceAll("..", "-.");
}

for (const [table, columns] of tables) {
  assert(Array.isArray(source[table]), `Missing ${table} rows`);
  const ids = new Set();
  for (const row of source[table]) {
    assert(Number.isSafeInteger(row.id) && row.id > 0, `Invalid ${table} id`);
    assert(!ids.has(row.id), `Duplicate ${table} id`);
    ids.add(row.id);
    for (const column of columns) {
      assert(Object.hasOwn(row, column), `Missing ${table}.${column}`);
      sqlValue(row[column]);
    }
  }
}

const lookupIds = Object.fromEntries(
  tables
    .slice(0, 5)
    .map(([table]) => [table, new Set(source[table].map((row) => row.id))])
);
const projectUUIDs = new Set();
const mediaPaths = new Set(storage.midia?.map((row) => row.name));
assert(
  Array.isArray(storage.midia) && mediaPaths.size === storage.midia.length,
  "Invalid media manifest"
);
let referencedImages = 0;
for (const row of source.project) {
  assert(
    typeof row.projectUUID === "string" && row.projectUUID.length > 0,
    "Invalid project UUID"
  );
  assert(!projectUUIDs.has(row.projectUUID), "Duplicate project UUID");
  projectUUIDs.add(row.projectUUID);
  for (const lookup of ["year", "semester", "course", "tech", "industry"]) {
    assert(
      row[lookup] === null || lookupIds[lookup].has(row[lookup]),
      `Unknown ${lookup} id`
    );
  }
  for (const field of ["logoImg", "teamImg", "productImg"]) {
    const parsed = JSON.parse(row[field]);
    assert(Array.isArray(parsed.path), `Invalid ${field} paths`);
    for (const path of parsed.path) {
      assert(
        typeof path === "string" && mediaPaths.has(path),
        `Missing media for ${field}`
      );
      referencedImages += 1;
    }
  }
}
const orphanMembers = source.member.filter(
  (row) => !projectUUIDs.has(row.projectUUID)
).length;

assert(
  Array.isArray(source.admin_emails) && source.admin_emails.length > 0,
  "Missing admin emails"
);
const adminEmails = [...new Set(source.admin_emails)];
assert(
  adminEmails.length === source.admin_emails.length,
  "Duplicate admin email"
);
const credentials = adminEmails.map((email) => ({
  email,
  password: randomBytes(24).toString("base64url"),
}));
writeFileSync(credentialsPath, `${JSON.stringify(credentials, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});

const statements = [
  "-- One-time import into an empty, schema-migrated D1 database.",
];
for (const [table, columns] of tables) {
  for (const row of source[table]) {
    const names = columns.map((column) => `"${column}"`).join(", ");
    const values = columns.map((column) => {
      const value = row[column];
      if (table !== "project" || !["logoImg", "teamImg", "productImg"].includes(column)) {
        return sqlValue(value);
      }
      const parsed = JSON.parse(value);
      return sqlValue(JSON.stringify({ ...parsed, path: parsed.path.map(destinationMediaPath) }));
    }).join(", ");
    statements.push(`INSERT INTO "${table}" (${names}) VALUES (${values});`);
  }
}
for (const { email, password } of credentials) {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, 210_000, 32, "sha256");
  const passwordHash = `pbkdf2$210000$${salt.toString("hex")}$${hash.toString("hex")}`;
  statements.push(
    `INSERT INTO "adminUser" ("id", "email", "passwordHash", "name") VALUES (${sqlValue(randomUUID())}, ${sqlValue(email)}, ${sqlValue(passwordHash)}, 'Admin');`
  );
}
writeFileSync(outputPath, `${statements.join("\n")}\n`, {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});

console.log(
  JSON.stringify({
    rows: Object.fromEntries(
      tables.map(([table]) => [table, source[table].length])
    ),
    adminUsers: credentials.length,
    referencedImages,
    mediaObjects: storage.midia.length,
    orphanMembers,
  })
);
