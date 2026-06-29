# Team crest source files for Apito Final logo bundle releases.

Flat image files under `logos/` are published as versioned zip bundles on GitHub Releases.

## Maintainer workflow

1. Add or update crest PNG/WebP/SVG files in `logos/` (flat folder only; no subdirectories).
2. Commit and push to `main`.
3. Tag a **semver** release and push the tag:

   ```bash
   git tag v1.0.1
   git push origin main --tags
   ```

4. GitHub Actions builds `dist/manifest.json`, `logos-bundle-<version>.zip`, and a `.sha256` sidecar, then attaches them to the Release.

## Local build

```bash
npm ci
npm run build-bundle -- --version 1.0.0
npm test
```

Outputs land in `dist/` (gitignored).

## Manifest URL (desktop app)

```text
https://github.com/vunf1/Stream_Futebol_Logos/releases/latest/download/manifest.json
```

## Git LFS

Binary crests should be tracked with Git LFS (`logos/*`). CI runs `git lfs pull` before building.

## Naming

Use basename stems that match club display names (see `futebol-dashboard` `team_logo.rs` token matching). Examples: `sporting-cp.png`, `SL-BENFICA.png`.
