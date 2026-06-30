import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  buildBundle,
  buildChangelog,
  contentFingerprint,
  listLogoFiles,
  loadPreviousManifestSnapshot,
  parseSemver,
  semverLt,
} from "./build-bundle.mjs";

test("parseSemver and semverLt", () => {
  assert.deepEqual(parseSemver("1.0.2"), { major: 1, minor: 0, patch: 2 });
  assert.equal(semverLt(parseSemver("1.0.0"), parseSemver("1.0.1")), true);
  assert.equal(semverLt(parseSemver("1.0.1"), parseSemver("1.0.0")), false);
});

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

test("buildChangelog diffs file lists", () => {
  const changelog = buildChangelog(
    [
      { name: "a.png", sha256: "aa" },
      { name: "old.png", sha256: "oo" },
    ],
    [
      { name: "a.png", sha256: "aa2" },
      { name: "b.png", sha256: "bb" },
    ],
    "1.0.0",
  );
  assert.equal(changelog.previous_version, "1.0.0");
  assert.deepEqual(changelog.added, ["b.png"]);
  assert.deepEqual(changelog.updated, ["a.png"]);
  assert.deepEqual(changelog.removed, ["old.png"]);
});

test("loadPreviousManifestSnapshot picks the highest prior semver", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "manifests-"));
  writeFileSync(
    path.join(tmp, "1.0.0.json"),
    JSON.stringify({
      version: "1.0.0",
      files: [{ name: "a.png", sha256: "aa" }],
    }),
  );
  writeFileSync(
    path.join(tmp, "1.0.1.json"),
    JSON.stringify({
      version: "1.0.1",
      files: [{ name: "a.png", sha256: "aa" }],
    }),
  );
  const prev = loadPreviousManifestSnapshot("1.0.2", tmp);
  assert.equal(prev?.version, "1.0.1");
});

test("buildBundle produces manifest with files and changelog", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "logos-build-"));
  const logosDir = path.join(tmp, "logos");
  const outDir = path.join(tmp, "dist");
  const manifestsDir = path.join(tmp, "manifests");
  mkdirSync(logosDir);
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  writeFileSync(path.join(logosDir, "sporting-cp.png"), png);

  const { manifest, snapshotPath } = await buildBundle({
    version: "1.0.0",
    outDir,
    logosDir,
    manifestsDir,
  });

  assert.equal(manifest.schema, 1);
  assert.equal(manifest.version, "1.0.0");
  assert.equal(manifest.file_count, 1);
  assert.equal(manifest.files.length, 1);
  assert.equal(manifest.changelog.added.length, 1);
  assert.match(manifest.sha256, /^[a-f0-9]{64}$/);
  assert.match(manifest.content_fingerprint, /^[a-f0-9]{64}$/);
  assert.ok(manifest.bundle_url.includes("v1.0.0"));
  assert.ok(readFileSync(snapshotPath, "utf8").includes("sporting-cp.png"));

  writeFileSync(path.join(logosDir, "benfica.png"), png);
  const second = await buildBundle({
    version: "1.0.1",
    outDir,
    logosDir,
    manifestsDir,
  });
  assert.equal(second.manifest.changelog.previous_version, "1.0.0");
  assert.deepEqual(second.manifest.changelog.added, ["benfica.png"]);

  const manifestOnDisk = JSON.parse(
    readFileSync(path.join(outDir, "manifest.json"), "utf8"),
  );
  assert.equal(manifestOnDisk.content_fingerprint, second.manifest.content_fingerprint);

  const zipBytes = readFileSync(path.join(outDir, "logos-bundle-1.0.1.zip"));
  const zipHash = createHash("sha256").update(zipBytes).digest("hex");
  assert.equal(zipHash, second.manifest.sha256);
});
