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
| NLP | N-gram Overlap — Jaccard similarity and overlap coefficient between two texts' n-gram sets, shared n-grams highlighted | `assets/js/ngram.js` |
| NLP | Cosine Similarity — term-frequency vectors, dot product, magnitudes, and the resulting similarity score | `assets/js/cosine.js` |
| NLP | TF-IDF — editable small corpus, ranked term table (TF, DF, IDF, TF-IDF) for a selected document | `assets/js/tfidf.js` |
| NLP | Tiny Bigram Language Model — builds real word-pair counts from training text, shows next-word probabilities, and generates text by sampling | `assets/js/bigram.js` |
| ML | Linear Regression + Gradient Descent — a loss-surface heatmap with the descent path traced across it as the fit line updates | `assets/js/linreg.js` |
| ML | Overfitting vs. Underfitting — adjustable polynomial degree, live train/test error curves | `assets/js/overfitting.js` |
| ML | k-Nearest Neighbors — click to place a query point, adjustable k, shaded decision regions | `assets/js/knn.js` |
| ML | k-Means Clustering — step through assign/update phases or run to convergence, inertia chart | `assets/js/kmeans.js` |
| ML | Decision Boundary (Logistic Regression) — gradient descent on cross-entropy loss, shaded decision regions, misclassified points ringed | `assets/js/decision-boundary.js` |
| ML | Confusion Matrix, Precision/Recall/F1 — adjustable threshold over scored examples, live-updating matrix and metrics | `assets/js/confusion-matrix.js` |
| ML | Multivariate Data Lab — upload a CSV/Excel dataset (or load the sample), pick feature/class columns, and get covariance matrix, eigenvalues/eigenvectors, PCA (scree + scatter), 2-class LDA, multiple linear regression, and logistic regression, all on your own data | `assets/js/mv-lab.js` |
| Networks | IP Addressing — click any of the 32 bits to flip it, see class (A–E) and address type (private/loopback/link-local/etc.) update live | `assets/js/ipaddress.js` |
| Networks | Subnetting — drag a CIDR prefix slider, see subnet mask, network/broadcast address, and usable host range recompute live | `assets/js/subnet.js` |
| Networks | Routing Tables — editable table, longest-prefix-match lookup for a destination IP with matching/winning rows highlighted | `assets/js/routing.js` |
| Networks | DNS Resolution — step-by-step recursive resolution walkthrough (root &rarr; TLD &rarr; authoritative) for any domain you type | `assets/js/dns.js` |
| Networks | OSI Model — clickable 7-layer reference plus a nested-box encapsulation visual | `assets/js/osi.js` |
| Data Science | Exploratory Data Analysis — upload a CSV/Excel file (or load the built-in sample) for column types, missing values, summary stats, distributions, and a correlation heatmap. Includes a chart-type picker (histogram, box plot, line, bar, pie, scatter) | `assets/js/eda.js` |
| Embedded (STM32F4) | GPIO Registers — configure MODER/OTYPER/OSPEEDR/PUPDR/ODR/IDR for one pin, see each register's hex value and this pin's exact bits highlighted | `assets/js/gpio.js` |
| Embedded (STM32F4) | RCC Clock Tree — HSE/HSI source, PLL M/N/P/Q, AHB/APB prescalers → live SYSCLK/HCLK/PCLK with over-frequency warnings | `assets/js/rcc.js` |
| Embedded (STM32F4) | Timer / PWM — PSC/ARR/CCR drive a live counter + PWM waveform | `assets/js/timer-pwm.js` |
| Embedded (STM32F4) | UART Framing — baud/data bits/parity/stop bits rendered as a scaled bit-level frame waveform | `assets/js/uart.js` |
| Embedded (STM32F4) | SPI / I2C Timing — CPOL/CPHA sampling-edge diagram for SPI; START/data/ACK/STOP diagram for I2C | `assets/js/spi-i2c.js` |
| Embedded (STM32F4) | NVIC Preemption — tick-by-tick priority scheduler renders a Gantt-style interrupt timeline with response-latency table | `assets/js/nvic.js` |
| Embedded (STM32F4) | Exception Stack Frame — step through the Cortex-M4's automatic register stacking on interrupt entry/exit | `assets/js/stackframe.js` |
| Embedded (STM32F4) | Memory Map — clickable STM32F407 address regions (Flash/SRAM/AHB/APB/Cortex-M4 internal) with detail panel | `assets/js/memmap.js` |
| Embedded (STM32F4) | Bit-Banding — computes the alias-region word address for any bit-band bit | `assets/js/bitband.js` |
| Embedded (STM32F4) | ADC — analog voltage → N-bit digital code, with sample-time/clock-driven conversion timing | `assets/js/adc.js` |
| Embedded (STM32F4) | DMA Transfer — step through source→destination transfers, NDTR countdown, circular vs. normal mode | `assets/js/dma.js` |
| Embedded (STM32F4) | Register / Bit-Field Explorer — pick a register (RCC_CR, GPIOx_MODER, USART_CR1...), set fields, see the resulting hex | `assets/js/reg-explorer.js` |
| Theory of Computation | Deterministic FA (DFA) — preset examples, editable transition table, string simulation with step trace and live diagram highlighting | `assets/js/dfa.js` |
| Theory of Computation | Non-Deterministic FA (NFA) — epsilon transitions, simulation tracks the whole set of current states at once | `assets/js/nfa.js` |
| Theory of Computation | NFA &harr; DFA Equivalence — runs subset construction on the currently-loaded NFA, shows the worklist trace and both diagrams | `assets/js/nfa-to-dfa.js` |
| Theory of Computation | FSM Minimization — Moore's partition-refinement algorithm, round-by-round trace, before/after diagrams | `assets/js/minimize.js` |
| Theory of Computation | Regular Expressions — real regex parser + Thompson construction to an NFA, live string testing, parse-tree view | `assets/js/regex.js` |
| Theory of Computation | Regular Languages (Pumping Lemma) — interactive split of w=xyz contrasting a non-regular and a regular language | `assets/js/reglang.js` |
| Theory of Computation | Properties / Closure — product construction demo for union, intersection, and complement between two DFAs | `assets/js/properties.js` |
| Theory of Computation | Real-World FA Design — curated gallery (vending machine, identifier validator, mod-3 checker, traffic light, password screener) with the state-meaning explained for each | `assets/js/fa-examples.js` |

`assets/js/fa-utils.js` is the shared engine behind every Theory of Computation module: the SVG state-diagram renderer, NFA/DFA simulation (epsilon-closure included), subset construction, DFA minimization, a real regex parser + Thompson construction, and product construction for closure properties. All of it was written and verified against known-correct test cases (see the module's own header comment) rather than assumed correct from the algorithm description alone.

Every module shares one visual language (a "field notebook" theme with
red-pen edit marks, teal/red for correct/incorrect or class A/B) so new
concepts feel like part of the same lab rather than bolted on. Each module
also includes a "math-box" panel with the underlying formulas, typeset with
plain HTML/CSS (fractions, summations, radicals, sub/superscripts) — no
external math library, so it renders identically everywhere with zero risk
of a blocked CDN leaving raw formula text on the page. `assets/js/canvas-utils.js`
holds shared canvas helpers (coordinate scaling, color interpolation, a
seeded RNG) used by the ML modules; `assets/js/network-utils.js` holds
shared IP/binary math used by the Networks modules.

The EDA module's CSV parsing is fully self-contained (no dependency). Excel
(`.xlsx`/`.xls`) parsing uses [SheetJS](https://sheetjs.com) loaded from a
CDN, since parsing a binary spreadsheet format without any library isn't
practical — this is the one deliberate external dependency in the lab. If
that CDN is blocked on a given network, the module says so plainly and
suggests exporting the file as CSV instead, which always works.

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
│   │   ├── ngram.js              # NLP — N-gram Overlap
│   │   ├── cosine.js             # NLP — Cosine Similarity
│   │   ├── tfidf.js              # NLP — TF-IDF
│   │   ├── bigram.js             # NLP — Tiny Bigram Language Model
│   │   ├── linreg.js             # ML — Linear Regression + Gradient Descent
│   │   ├── overfitting.js        # ML — Overfitting vs Underfitting
│   │   ├── knn.js                # ML — k-Nearest Neighbors
│   │   ├── kmeans.js             # ML — k-Means Clustering
│   │   ├── decision-boundary.js  # ML — Decision Boundary / Logistic Regression
│   │   ├── confusion-matrix.js   # ML — Confusion Matrix / Precision / Recall / F1
│   │   ├── stat-utils.js         # shared linear algebra engine (covariance, Jacobi eigendecomposition, PCA, LDA, regression)
│   │   ├── mv-lab.js             # ML — Multivariate Data Lab (PCA/LDA/regression on uploaded data)
│   │   ├── ipaddress.js          # Networks — IP Addressing
│   │   ├── subnet.js             # Networks — Subnetting
│   │   ├── routing.js            # Networks — Routing Tables
│   │   ├── dns.js                # Networks — DNS Resolution
│   │   ├── osi.js                # Networks — OSI Model
│   │   ├── eda.js                # Data Science — Exploratory Data Analysis
│   │   ├── embedded-utils.js     # shared hex/binary/bit-field helpers (Embedded modules)
│   │   ├── gpio.js               # Embedded — GPIO Registers
│   │   ├── rcc.js                # Embedded — RCC Clock Tree
│   │   ├── timer-pwm.js          # Embedded — Timer / PWM
│   │   ├── uart.js               # Embedded — UART Framing
│   │   ├── spi-i2c.js            # Embedded — SPI / I2C Timing
│   │   ├── nvic.js               # Embedded — NVIC Preemption
│   │   ├── stackframe.js         # Embedded — Exception Stack Frame
│   │   ├── memmap.js             # Embedded — Memory Map
│   │   ├── bitband.js            # Embedded — Bit-Banding
│   │   ├── adc.js                # Embedded — ADC
│   │   ├── dma.js                # Embedded — DMA Transfer
│   │   ├── reg-explorer.js       # Embedded — Register / Bit-Field Explorer
│   │   ├── fa-utils.js           # shared automata engine (Theory of Computation modules)
│   │   ├── dfa.js                # ToC — Deterministic FA
│   │   ├── nfa.js                # ToC — Non-Deterministic FA
│   │   ├── nfa-to-dfa.js         # ToC — NFA/DFA equivalence (subset construction)
│   │   ├── minimize.js           # ToC — FSM minimization
│   │   ├── regex.js              # ToC — Regular expressions (Thompson construction)
│   │   ├── reglang.js            # ToC — Regular languages / pumping lemma
│   │   ├── properties.js         # ToC — Closure properties (product construction)
│   │   ├── fa-examples.js        # ToC — Real-world FA design gallery
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
6. **Math (optional)** — add a `<div class="math-box">` with a `<div class="math-title">`, one or more `<div class="math-row">$$...$$</div>` blocks (LaTeX, KaTeX-flavored), and an optional `<div class="math-note">`. It renders automatically — `main.js` calls `renderMathInElement` once on page load across the whole document, including hidden tabs.

## Troubleshooting GitHub Pages

**Everything shows up unstyled (default browser buttons, no layout, no
fonts)** — this means `assets/css/style.css` is 404ing even though
`index.html` loaded. Check the browser DevTools Network tab for the exact
failing URL. The usual cause is a folder-casing mismatch or an extra nested
folder introduced by uploading files one-by-one through the GitHub web UI
(GitHub Pages' filesystem is case-sensitive, unlike most local dev setups).
The reliable fix is pushing via `git` instead of the web upload UI, since
`git` preserves the exact folder structure and dotfiles like `.nojekyll`.

**Site 404s entirely** — `index.html` isn't sitting directly at the
configured Pages root; check for a nested folder in the repo's file listing
on github.com.

Good next candidates: n-gram overlap, cosine similarity, TF-IDF (NLP); a tiny
bigram language model (NLP/ML); routing tables, DNS resolution, or the
OSI model (Networks).

## License

MIT — see `LICENSE`. Free to fork and adapt for your own classroom.
