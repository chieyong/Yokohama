# Rotterdam

Een eigen bordspel voor de iPhone (PWA) tegen bots. Regels: [`docs/rules.md`](docs/rules.md).

```
npm install
npm test          # engine-tests
npm run dev       # app op http://localhost:5173 (ook via je wifi-IP op de iPhone)
npm run build     # productie-build in dist/
```

| Map | Inhoud |
|---|---|
| `engine/` | pure TypeScript spelregels + tests |
| `bots/` | computertegenstanders |
| `ui/` | React + SVG app |
| `docs/` | regels en regelbeslissingen |
| `scripts/simulate.ts` | bot-tegen-bot check: `npm run simulate -- 300` |

## Hosting

Netlify: koppel deze GitHub-repo; `netlify.toml` regelt de build.
