# ScholarQuest leaderboard

Compact bilingual benchmark leaderboard for GitHub Pages. English: [index.html](https://pty12345.github.io/ScholarQuest-LeaderBoard/); Chinese: [zh.html](https://pty12345.github.io/ScholarQuest-LeaderBoard/zh.html). Both pages are self-contained and share the same source data.

## Local preview

```sh
python3 build.py
python3 -m http.server 8765 --directory dist
```

Open `http://localhost:8765/`. You can also open either HTML file directly.

## GitHub Pages

This directory is the root of [pty12345/ScholarQuest-LeaderBoard](https://github.com/pty12345/ScholarQuest-LeaderBoard). Only the leaderboard project belongs in this repository.

1. Push these files to the repository's `main` branch, including `.github/workflows/pages.yml`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Run **Actions → Deploy GitHub Pages → Run workflow**, or push another commit.

The workflow rebuilds both pages and publishes only `dist/`. The site URL is `https://pty12345.github.io/ScholarQuest-LeaderBoard/`. Relative links support the project path, including the language switch.

## Update

- `results.json`: source scores and evaluation notes; score precision is preserved.
- `locales.json`: English and Chinese text.
- `templates/page.html`: shared layout, styles, and interactions.
- `build.py`: dependency-free generator. `build_zh.py` remains a compatible shortcut.
- `dist/`: generated HTML and `.nojekyll`; do not edit generated pages directly.

Run `python3 build.py` after changing the sources. Publishing is automatic after a push to `main` once Pages is enabled.

## Result scope

System results use 1,111 queries. Model configurations use ScholarQuest-100 and each configuration's valid queries, excluding failures. The tracks are reported separately. Model valid counts, prompt differences, token scope, and system budget differences are described on the page and retained in the downloadable JSON.

The site currently reports manuscript results; it does not accept public submissions. The code/data link points to the existing anonymous repository. Update that URL and the manuscript citation when permanent resources are available.

Layout references: [SWE-bench](https://www.swebench.com/), [OSWorld](https://osworld-v1.xlang.ai/), [WebArena](https://webarena.dev/og/). Hosting: [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Linked model charts

The model track includes two compact, bilingual figures below its table. They are assembled from `templates/charts.html`, `charts.css`, and `charts.js` into each standalone page. No chart library or network dependency is required. A `?track=model` link opens this track directly; `&model=<id>` selects a configuration.

| Figure | Question and fields | Rendering and interpretation |
| --- | --- | --- |
| Tokens vs. recall | How do the seven configurations' mean Planner tokens and Recall@All compare? `models[].tokens` and `scores.overall.rall`, with model-specific valid counts in accessible point labels. | Interactive SVG scatter, one labeled point per model, fixed recall domain 0–1 and labeled focused token axis. Shared green accent, open markers; selected model has a filled marker and ring. No fitted trend, billing-cost claim, or common-population inference. |
| Recall by research intent | Where does the selected configuration have stronger/weaker recall? Four `scores[intent].rall` values from the same results JSON. | Linked horizontal bars on a fixed zero-to-one scale, direct numeric labels, and a model selector. Per-intent valid counts remain available on hover. |

These figures share selection with each other and always show the complete model set, independently of the table's search. They appear only in the model track because the system track has no comparable token data. Small screens stack the figures; the selected model remains labeled on a compact scatter, and all points expose their name and exact values on hover/focus. Keyboard users can select a point with Enter/Space or use the model dropdown. The language switch preserves the active track and selected model.

QA: compare all chart values with `results.json`, inspect both languages at desktop and phone widths, and verify point/dropdown selection and the system/model visibility boundary. The canonical score source and statistical caveats are recorded in `results.json`.
