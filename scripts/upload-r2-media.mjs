/**
 * Copy a private, verified Supabase media export into the shared R2 bucket.
 * Usage: node scripts/upload-r2-media.mjs manifest.json media-dir checksums.json state.json
 * All arguments and generated state belong outside the repository.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const [manifestArg, mediaArg, checksumsArg, stateArg] = process.argv.slice(2);
if (!manifestArg || !mediaArg || !checksumsArg || !stateArg) {
  throw new Error(
    "Expected manifest, media directory, checksums, and state paths."
  );
}

const manifest = JSON.parse(await readFile(resolve(manifestArg), "utf8"));
const checksums = JSON.parse(await readFile(resolve(checksumsArg), "utf8"));
const statePath = resolve(stateArg);
const mediaDir = resolve(mediaArg);
const completed = new Set(
  await readFile(statePath, "utf8")
    .then((data) => JSON.parse(data))
    .catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    })
);

if (!Array.isArray(manifest.midia) || manifest.midia.length === 0) {
  throw new Error("Empty or invalid media manifest.");
}

const namePattern =
  /^(?:logo|team|product)\/[a-z0-9-]+\/[a-z0-9_.-]+\.(?:jpe?g|png|webp)$/i;
const objects = [];
const names = new Set();
const remoteNames = new Set();
for (const row of manifest.midia) {
  const remoteName = row.name.replaceAll("..", "-.");
  if (
    !namePattern.test(row.name) ||
    !namePattern.test(remoteName) ||
    names.has(row.name) ||
    remoteNames.has(remoteName) ||
    !checksums[row.name] ||
    !["image/jpeg", "image/png", "image/webp"].includes(
      checksums[row.name].mime
    )
  ) {
    throw new Error("Invalid media manifest entry.");
  }
  names.add(row.name);
  remoteNames.add(remoteName);
  const file = join(mediaDir, row.name);
  const bytes = await readFile(file);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== row.size || digest !== checksums[row.name].sha256) {
    throw new Error(`Media export checksum mismatch: ${row.name}`);
  }
  objects.push({ name: row.name, remoteName, file, mime: checksums[row.name].mime });
}
if ([...completed].some((name) => !names.has(name))) {
  throw new Error("Upload state contains an unknown media object.");
}

let stateWrite = Promise.resolve();
function saveState() {
  stateWrite = stateWrite.then(() =>
    writeFile(statePath, JSON.stringify([...completed].sort()), { mode: 0o600 })
  );
  return stateWrite;
}

function upload(row) {
  return new Promise((done, fail) => {
    const child = spawn(
      "pnpm",
      [
        "exec",
        "wrangler",
        "r2",
        "object",
        "put",
        `junowoz-bucket/inovatech/${row.remoteName}`,
        "--remote",
        "--force",
        `--file=${row.file}`,
        `--content-type=${row.mime}`,
      ],
      {
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, CI: "1" },
      }
    );
    let errors = "";
    child.stderr.on("data", (chunk) => {
      errors += chunk.toString();
    });
    child.on("error", fail);
    child.on("close", (code) =>
      code === 0 ? done() : fail(new Error(errors || `Wrangler exit ${code}`))
    );
  });
}

const pending = objects.filter((row) => !completed.has(row.name));
let next = 0;
let failed = false;
async function worker() {
  while (next < pending.length && !failed) {
    const row = pending[next++];
    try {
      await upload(row);
      completed.add(row.name);
      await saveState();
      if (completed.size % 25 === 0 || completed.size === objects.length) {
        process.stdout.write(
          `Uploaded ${completed.size}/${objects.length} objects\n`
        );
      }
    } catch (error) {
      failed = true;
      process.stderr.write(`Upload failed for ${row.name}: ${error.message}\n`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
if (failed) process.exitCode = 1;
else
  process.stdout.write(
    `R2 media complete: ${completed.size}/${objects.length}\n`
  );
