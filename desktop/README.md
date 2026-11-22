# Miju's Party Game! desktop app

This wraps `../index.html` in a Windows desktop app and adds an in-app updater button. Updates are delivered through published GitHub Releases. The initial installer is built locally; the included GitHub Actions workflow automates later release builds and uploads the update manifest and installer artifacts.

## First-time setup

1. Create a public GitHub repository and put the contents of the `outputs` folder at the repository root (including `.github/workflows` and `desktop`).
2. In `desktop/package.json`, the repository owner is already set to `mijumizyu310-bot` and the repository name is `mijus-party-game`.
3. Install Node.js 22. Open a terminal in `desktop` and run `npm ci`.
4. Run `npm run pack` to create the Windows installer in `desktop/dist/`.
5. Install `Mijus-Party-Game-Setup-1.0.0.exe`. The current portable preview is in `dist/Mijus-Party-Game-Portable.zip`; unzip and run `Miju's Party Game!.exe`.

## Publish a game update

1. Push the new `index.html` and any app source changes to GitHub.
2. Open **Actions → Publish Windows app → Run workflow** and enter a version higher than the installed version, such as `1.0.1`.
3. The workflow builds and publishes a full GitHub Release plus `game-patch.html`. Keep the release public and published, not a draft.
4. In the app, click **パッチを確認・適用**. It downloads the latest game page and reloads automatically. The same button checks for desktop-app updates too; when one is ready, click **再起動してアプリ更新**.

NSIS packages include differential update support where available. The current portable preview supports game-page patches, but the NSIS installer built by the first GitHub Release is needed for full desktop-app updates. Windows may show an unsigned-app warning because no code-signing certificate is configured.

`npm run sync-game` copies the current `../index.html` into the desktop package. `npm start` runs the wrapper, `npm run pack` builds without publishing, and `npm run release` builds and publishes.



