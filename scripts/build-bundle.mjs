#!/usr/bin/env node
/**
 * Build logos-bundle zip + manifest.json for GitHub Releases.
 * Usage: node scripts/build-bundle.mjs --version 1.0.0 [--out dist]
 */
import { createHash } from "node:crypto";
import { createWriteStream, readFileSync, readdirSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOGOS_DIR = path.join(ROOT, "logos");

const IMAGE_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".webp", ".gif", ".bmp", ".dib",
  ".ico", ".cur", ".svg", ".svgz", ".avif", ".heic", ".heif", ".tif", ".tiff",
  ".apng", ".xbm", ".xpm", ".jp2", ".j2k", ".jpx", ".jxl",
]);

const GITHUB_REPO = "vunf1/Stream_Futebol_Logos";

function parseArgs(argv) {
  let version = "";
  let outDir = path.join(ROOT, "dist");
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--version" && argv[i + 1]) {
      version = argv[++i];
    } else if (argv[i] === "--out" && argv[i + 1]) {
      outDir = path.resolve(argv[++i]);
    }
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error("Usage: build-bundle.mjs --version MAJOR.MINOR.PATCH [--out dist]");
    process.exit(1);
  }
  return { version, outDir };
}

/** @returns {{ name: string, abs: string, sha256: string }[]} */
export function listLogoFiles(logosDir) {
  if (!statSync(logosDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`logos directory missing: ${logosDir}`);
  }
  const entries = readdirSync(logosDir, { withFileTypes: true });
  const files = [];
  const seenLower = new Set();

  for (const ent of entries) {
    if (!ent.isFile()) {
      throw new Error(`nested paths not allowed: ${ent.name}`);
    }
    const name = ent.name;
    if (name.startsWith("._") || name.startsWith(".")) continue;
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const lower = name.toLowerCase();
    if (seenLower.has(lower)) {
      throw new Error(`duplicate basename (case-insensitive): ${name}`);
    }
    seenLower.add(lower);
    const abs = path.join(logosDir, name);
    const bytes = readFileSync(abs);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    files.push({ name, abs, sha256 });
  }

  files.sort((a, b) => a.name.localeCompare(b.name, "en"));
  if (files.length === 0) {
    throw new Error("logos/ has no image files");
  }
  return files;
}

/** @param {{ name: string, sha256: string }[]} files */
export function contentFingerprint(files) {
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name, "en"));
  const lines = sorted.map((f) => `${f.name}:${f.sha256}`);
  return createHash("sha256").update(lines.join("\n"), "utf8").digest("hex");
}

function zipFlat(files, zipPath) {
  return new Promise((resolve, reject) => {
    const out = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    out.on("close", () => resolve(archive.pointer()));
    archive.on("error", reject);
    out.on("error", reject);
    archive.pipe(out);
    for (const f of files) {
      archive.file(f.abs, { name: f.name });
    }
    archive.finalize();
  });
}

export async function buildBundle({ version, outDir, logosDir = LOGOS_DIR }) {
  const files = listLogoFiles(logosDir);
  await mkdir(outDir, { recursive: true });

  const zipName = `logos-bundle-${version}.zip`;
  const zipPath = path.join(outDir, zipName);
  await zipFlat(files, zipPath);

  const zipBytes = readFileSync(zipPath);
  const sha256 = createHash("sha256").update(zipBytes).digest("hex");
  const fingerprint = contentFingerprint(files);

  const tag = `v${version}`;
  const manifest = {
    schema: 1,
    version,
    published_at: new Date().toISOString(),
    bundle_url: `https://github.com/${GITHUB_REPO}/releases/download/${tag}/${zipName}`,
    sha256,
    content_fingerprint: fingerprint,
    size_bytes: zipBytes.length,
    file_count: files.length,
  };

  const manifestPath = path.join(outDir, "manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const shaPath = path.join(outDir, `${zipName}.sha256`);
  await writeFile(shaPath, `${sha256}  ${zipName}\n`, "utf8");

  return { manifest, zipPath, manifestPath, shaPath };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { version, outDir } = parseArgs(process.argv);
  buildBundle({ version, outDir })
    .then(({ manifest, zipPath, manifestPath }) => {
      console.log(`[build-bundle] ${manifest.file_count} files → ${zipPath}`);
      console.log(`[build-bundle] manifest → ${manifestPath}`);
      console.log(`[build-bundle] sha256=${manifest.sha256}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
