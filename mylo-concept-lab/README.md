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

Both modules live as tabs inside `index.html` and share one visual language
(a "field notebook" theme with red-pen edit marks) so new concepts feel like
part of the same lab rather than bolted on.

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
├── index.html              # markup + tab shell, loads css/js below
├── assets/
│   ├── css/
│   │   └── style.css       # all styling (design tokens at the top)
│   ├── js/
│   │   ├── levenshtein.js  # module 01 logic + rendering
│   │   ├── ttr.js          # module 02 logic + rendering
│   │   └── main.js         # tab switching + boot sequence
│   └── img/                # (empty — reserved for future modules)
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
