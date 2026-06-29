import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { buildBundle, contentFingerprint, listLogoFiles } from "./build-bundle.mjs";

test("listLogoFiles rejects nested directories", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "logos-"));
  mkdirSync(path.join(tmp, "sub"));
  assert.throws(() => listLogoFiles(tmp), /nested paths not allowed/);
});

test("contentFingerprint is deterministic", () => {
  const files = [
    { name: "a.png", sha256: "aa" },
    { name: "b.png", sha256: "bb" },
  ];
  const a = contentFingerprint(files);
  const b = contentFingerprint([...files].reverse());
  assert.equal(a, b);
  assert.match(a, /^[a-f0-9]{64}$/);
});

test("buildBundle produces manifest with fingerprint", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "logos-build-"));
  const logosDir = path.join(tmp, "logos");
  const outDir = path.join(tmp, "dist");
  mkdirSync(logosDir);
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  writeFileSync(path.join(logosDir, "sporting-cp.png"), png);

  const { manifest } = await buildBundle({
    version: "1.0.0",
    outDir,
    logosDir,
  });

  assert.equal(manifest.schema, 1);
  assert.equal(manifest.version, "1.0.0");
  assert.equal(manifest.file_count, 1);
  assert.match(manifest.sha256, /^[a-f0-9]{64}$/);
  assert.match(manifest.content_fingerprint, /^[a-f0-9]{64}$/);
  assert.ok(manifest.bundle_url.includes("v1.0.0"));

  const manifestOnDisk = JSON.parse(
    readFileSync(path.join(outDir, "manifest.json"), "utf8"),
  );
  assert.equal(manifestOnDisk.content_fingerprint, manifest.content_fingerprint);

  const zipBytes = readFileSync(path.join(outDir, "logos-bundle-1.0.0.zip"));
  const zipHash = createHash("sha256").update(zipBytes).digest("hex");
  assert.equal(zipHash, manifest.sha256);
});
