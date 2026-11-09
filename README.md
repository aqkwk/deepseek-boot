# deepseek-boot

Full-screen DeepSeek boot sequence overlay for the DeepSeek Harness Web UI.

A local Harness bundle that plays a boot animation over the Web GUI on load.

## Install

```powershell
# from a Harness profile with the plugin manager available
# install_bundle -> D:\deepseek1\deepseek-boot
```

The bundle inserts one Client module row:

```yaml
- insert:
    - id: deepseek-boot
      name: '@local/deepseek-boot'
```

## Files

| File | Role |
|---|---|
| `index.js` | Host half; the Client module owns rendering |
| `client.js` | Client module: the overlay animation |
| `cordis.patch.yml` | Bundle patch that inserts the row |
| `package.json` | Manifest: `dsh.bundle.patch`, `dsh.client` |
| `locale/en.json`, `locale/zh.json` | Panel title and description |
| `icon.svg` | Panel artwork |

## Notes

- Local-only package (`@local/deepseek-boot`), not published to npm.
- The Client module injects `@deepseek-ai/dsh-client-ui-conversation`.
