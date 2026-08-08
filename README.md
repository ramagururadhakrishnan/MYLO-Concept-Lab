# MYLO — L1 Concept Lab

A small, dependency-free interactive lab for teaching foundational
Networking / Machine Learning / NLP concepts. Built as static HTML/CSS/JS so
it can be hosted for free on GitHub Pages — no build step, no backend, no
framework.

**Live demo:** `https://<your-username>.github.io/<repo-name>/` (once Pages
is enabled — see below).

## What's in it

Navigation is a grouped sidebar (collapsible sections, one sub-tab active at
a time) rather than a row of top tabs, so the topic list scales as more
groups get added.

| Group | Module | File |
|---|---|---|
| NLP | Levenshtein (edit) distance — step through insert / delete / substitute operations and see the DP grid with the optimal path highlighted | `assets/js/levenshtein.js` |
| NLP | Type-Token Ratio (TTR) — lexical diversity, unique vs. repeated tokens | `assets/js/ttr.js` |
| ML | Linear Regression + Gradient Descent — a loss-surface heatmap with the descent path traced across it as the fit line updates | `assets/js/linreg.js` |
| ML | Overfitting vs. Underfitting — adjustable polynomial degree, live train/test error curves | `assets/js/overfitting.js` |
| ML | k-Nearest Neighbors — click to place a query point, adjustable k, shaded decision regions | `assets/js/knn.js` |
| ML | k-Means Clustering — step through assign/update phases or run to convergence, inertia chart | `assets/js/kmeans.js` |
| ML | Decision Boundary (Logistic Regression) — gradient descent on cross-entropy loss, shaded decision regions, misclassified points ringed | `assets/js/decision-boundary.js` |
| ML | Confusion Matrix, Precision/Recall/F1 — adjustable threshold over scored examples, live-updating matrix and metrics | `assets/js/confusion-matrix.js` |
| Networks | IP Addressing — click any of the 32 bits to flip it, see class (A–E) and address type (private/loopback/link-local/etc.) update live | `assets/js/ipaddress.js` |
| Networks | Subnetting — drag a CIDR prefix slider, see subnet mask, network/broadcast address, and usable host range recompute live | `assets/js/subnet.js` |

Every module shares one visual language (a "field notebook" theme with
red-pen edit marks, teal/red for correct/incorrect or class A/B) so new
concepts feel like part of the same lab rather than bolted on.
`assets/js/canvas-utils.js` holds shared canvas helpers (coordinate scaling,
color interpolation, a seeded RNG) used by the ML modules; `assets/js/network-utils.js`
holds shared IP/binary math used by the Networks modules.

## Running it locally

No install needed. Either:

- Open `index.html` directly in a browser, or
- Serve it locally so relative paths behave exactly like they will on
  GitHub Pages:

  ```bash
  cd mylo-concept-lab
  python3 -m http.server 8000
  # visit http://localhost:8000
  ```

## Deploying to GitHub Pages

1. Push this folder's contents to a GitHub repo (root of the repo, or a
   `docs/` folder — either works).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
4. Pick your branch (e.g. `main`) and the folder (`/root` or `/docs`,
   matching where you put these files).
5. Save. GitHub will give you a URL at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

The included `.nojekyll` file tells GitHub Pages to skip Jekyll processing,
which isn't needed for a plain static site and can otherwise cause files or
folders starting with `_` to be silently dropped.

If you upload through the GitHub web UI, double-check `index.html` lands
directly at the repo root and not nested inside an extra folder — that's the
most common reason a Pages site 404s after everything looks "done."

## Project structure

```
mylo-concept-lab/
├── index.html                    # sidebar shell + all module markup
├── assets/
│   ├── css/
│   │   └── style.css             # all styling (design tokens at the top)
│   ├── js/
│   │   ├── canvas-utils.js       # shared canvas helpers (ML modules)
│   │   ├── network-utils.js      # shared IP/binary helpers (Networks modules)
│   │   ├── levenshtein.js        # NLP — Levenshtein distance
│   │   ├── ttr.js                # NLP — Type-Token Ratio
│   │   ├── linreg.js             # ML — Linear Regression + Gradient Descent
│   │   ├── overfitting.js        # ML — Overfitting vs Underfitting
│   │   ├── knn.js                # ML — k-Nearest Neighbors
│   │   ├── kmeans.js             # ML — k-Means Clustering
│   │   ├── decision-boundary.js  # ML — Decision Boundary / Logistic Regression
│   │   ├── confusion-matrix.js   # ML — Confusion Matrix / Precision / Recall / F1
│   │   ├── ipaddress.js          # Networks — IP Addressing
│   │   ├── subnet.js             # Networks — Subnetting
│   │   └── main.js               # sidebar nav (groups + sub-tabs) + boot sequence
│   └── img/                      # (empty — reserved for future modules)
├── .nojekyll
├── .gitignore
├── LICENSE
└── README.md
```

## Adding a new concept module

The lab is built so a new concept is additive, not a rewrite:

1. **Sidebar entry** — in `index.html`, add a `<button class="side-tab" data-tab="yourkey">Your Concept</button>` inside the right `.nav-group` (or start a new `.nav-group` with a `.group-toggle` header for a whole new subject area).
2. **Markup** — add a `<section class="module" id="mod-yourkey">` in `<main class="content">` with your fields/results.
3. **Logic** — add `assets/js/yourconcept.js` with an `initYourConceptModule()` function that wires up inputs and renders results into your section. Keep it self-contained like `ttr.js` or `ipaddress.js`.
4. **Wire it up** — add `<script defer src="assets/js/yourconcept.js"></script>` in `index.html`, and call `initYourConceptModule()` from the guarded block at the bottom of `main.js` so it boots with a sensible default state.
5. **Style** — reuse the existing design tokens (CSS variables at the top of `style.css`: `--paper`, `--ink`, `--red`, `--teal`, etc.) rather than introducing new colors, so new modules — and new groups — stay visually consistent with the rest of the lab.

Good next candidates: n-gram overlap, cosine similarity, TF-IDF (NLP); a tiny
bigram language model (NLP/ML); routing tables, DNS resolution, or the
OSI model (Networks).

## License

MIT — see `LICENSE`. Free to fork and adapt for your own classroom.
