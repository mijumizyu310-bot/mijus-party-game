# Miju’s Party Game!

A browser party game with a Windows desktop wrapper and a one-click game patch updater.

Repository: https://github.com/mijumizyu310-bot/mijus-party-game

## First Windows release

1. Open **Actions → Publish Windows app → Run workflow**.
2. Enter version `1.0.0`. The workflow builds the Windows installer and publishes it together with `game-patch.html` and updater metadata.
3. Share the published Release page. The app’s **パッチを確認・適用** button downloads the game patch from the latest public release.

Later updates use a higher version such as `1.0.1`. See [desktop/README.md](desktop/README.md) for development and updater details.
