# MYLO — L1 Concept Lab

A small, dependency-free interactive lab for teaching foundational Machine
Learning / NLP concepts. Built as static HTML/CSS/JS so it can be hosted for
free on GitHub Pages — no build step, no backend, no framework.

**Live demo:** `https://<your-username>.github.io/<repo-name>/` (once Pages
is enabled — see below).

## What's in it

| Module | Concept | File |
|---|---|---|
| 01 | Levenshtein (edit) distance — step through insert / delete / substitute operations and see the DP grid with the optimal path highlighted | `assets/js/levenshtein.js` |
| 02 | Type-Token Ratio (TTR) — lexical diversity, unique vs. repeated tokens | `assets/js/ttr.js` |
| 03 | Linear Regression + Gradient Descent — a loss-surface heatmap with the descent path traced across it as the fit line updates | `assets/js/linreg.js` |
| 04 | Overfitting vs. Underfitting — adjustable polynomial degree, live train/test error curves | `assets/js/overfitting.js` |
| 05 | k-Nearest Neighbors — click to place a query point, adjustable k, shaded decision regions | `assets/js/knn.js` |
| 06 | k-Means Clustering — step through assign/update phases or run to convergence, inertia chart | `assets/js/kmeans.js` |
| 07 | Decision Boundary (Logistic Regression) — gradient descent on cross-entropy loss, shaded decision regions, misclassified points ringed | `assets/js/decision-boundary.js` |
| 08 | Confusion Matrix, Precision/Recall/F1 — adjustable threshold over scored examples, live-updating matrix and metrics | `assets/js/confusion-matrix.js` |

All eight modules live as tabs inside `index.html` and share one visual
language (a "field notebook" theme with red-pen edit marks, teal/red for
correct/incorrect or class A/B) so new concepts feel like part of the same
lab rather than bolted on. `assets/js/canvas-utils.js` holds the shared
canvas helpers (coordinate scaling, color interpolation, a seeded RNG) that
every ML module builds on — read it first if you're adding a new canvas-based
module.

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

## Project structure

```
mylo-concept-lab/
├── index.html                    # markup + tab shell, loads css/js below
├── assets/
│   ├── css/
│   │   └── style.css             # all styling (design tokens at the top)
│   ├── js/
│   │   ├── canvas-utils.js       # shared canvas helpers used by every ML module
│   │   ├── levenshtein.js        # module 01
│   │   ├── ttr.js                # module 02
│   │   ├── linreg.js             # module 03
│   │   ├── overfitting.js        # module 04
│   │   ├── knn.js                # module 05
│   │   ├── kmeans.js             # module 06
│   │   ├── decision-boundary.js  # module 07
│   │   ├── confusion-matrix.js   # module 08
│   │   └── main.js               # tab switching + boot sequence
│   └── img/                      # (empty — reserved for future modules)
├── .nojekyll
├── .gitignore
├── LICENSE
└── README.md
```

## Adding a new concept module

The lab is built so a new concept is additive, not a rewrite:

1. **Markup** — in `index.html`, add a new `<button class="tab-btn" data-tab="yourkey">` to `<nav class="tabs">`, and a new `<section class="module" id="mod-yourkey">` with your fields/results.
2. **Logic** — add `assets/js/yourconcept.js` with a `runYourConcept()` function that reads the DOM inputs and writes results back into your section. Keep it self-contained like `ttr.js`.
3. **Wire it up** — add `<script defer src="assets/js/yourconcept.js"></script>` in `index.html`, and call `runYourConcept()` once at the bottom of `main.js`'s init block so it has a sensible default state on load.
4. **Style** — reuse the existing design tokens (CSS variables at the top of `style.css`: `--paper`, `--ink`, `--red`, `--teal`, etc.) rather than introducing new colors, so new modules stay visually consistent with the rest of the lab.

Good next candidates: n-gram overlap, Jaccard similarity, cosine similarity
on simple word vectors, TF-IDF, a tiny bigram language model.

## License

MIT — see `LICENSE`. Free to fork and adapt for your own classroom.
