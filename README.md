# Apito Final — official downloads

This repository publishes **official releases** for Apito Final: the Windows desktop application and the **official team crest** package used on scoreboard overlays.

Normal use is through the application or during setup on a new PC. You do not need to change files in this repository for day-to-day operation.

## What is available

| Type | Tag example | Contents |
| ---- | ----------- | -------- |
| **Application** | `app-v2.0.8` | Windows installer (`.msi`), Linux `.AppImage` and `.deb`, and when included a one-step Windows setup script |
| **Team crests** | `v1.0.3` | Official club crests for the scoreboard |

See the [**Releases**](https://github.com/vunf1/Stream_Futebol_Artifacts/releases) page for every version. Each application version has its own release; crest bundles use a separate version series.

## Recommended: install and update from the app

1. Install Apito Final on Windows (see below if this is a new machine).
2. In the launcher or campo dashboard footer, click the **updates icon**.
3. In the window that opens you can:
   - install or refresh **official team crests** when they are missing or outdated;
   - install a newer **application** version when one is available.

The app downloads releases from here, verifies file integrity, and guides installation. Custom crest files you added locally are kept when you install the official bundle.

## Fresh install (Windows)

On a controlled PC without the application yet:

1. Open [**Releases**](https://github.com/vunf1/Stream_Futebol_Artifacts/releases).
2. Choose the latest **Apito Final** release (tag `app-v…`).
3. Run **`Install-ApitoFinal.ps1`** if it is included. It prepares trust for the signed installer and starts setup.
4. If that script is not on the release, run **`ApitoFinal-<version>-setup.msi`** instead.

After installation, use the in-app updates icon to install official team crests if prompted.

## Fresh install (Linux)

On a Linux PC without the application yet:

1. Open [**Releases**](https://github.com/vunf1/Stream_Futebol_Artifacts/releases).
2. Choose the matching **Apito Final** release (tag `app-v…`).
3. Install using either the **`.AppImage`** (portable) or the **`.deb`** package for your distribution.

In-app self-update is available on Windows only; on Linux, install newer versions manually from the Releases page.

## Manual crest download (optional)

The usual method is to install through the app. If your workflow requires a manual copy, download **`logos-bundle-<version>.zip`** from the matching crest release (`v…`) on the Releases page.

## Support

For installation or update issues, contact your Apito Final administrator or the JMSIT support channel.
