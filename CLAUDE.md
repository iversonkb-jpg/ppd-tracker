# PPD Digitalization Dashboard — project notes

## BASE VERSION (source of truth)
`index.html` is the **three-dashboard** version — Master KM / Master Infra / Local Infra — confirmed
by the user (2026) as the base for all future changes. Build on THIS file. Do not reintroduce the
project-centric / 15-stage register rebuild unless the user explicitly asks.

## What this is
An interactive UIUX prototype for the PPD (Project Planning & Development) digitalization initiative at
Eco World. Plain HTML/CSS/JS, no backend, no build step, styled on the PPD "KMBP Works Flow
& Suggested Interface/Dashboard Concept" deck.

## Files
- `index.html` — app shell (served by GitHub Pages): global `<head>`/sidebar/tabs/panel markup, loads
  `styles.css` + `data.js` + `app.js`. **Edit this one for markup changes.**
- `styles.css` — all styles.
- `data.js` — the data model: `AP_TARGET`/`TODAY`, `projects`/`currentProj`, `S`/`statusLabel`, the three
  dashboard objects (`MKM`/`MINFRA`/`LINFRA`), `TRAIT_AUTH`, `DEPTS_KM`/`DEPTS_INFRA`, `DASHES`, and the
  `currentDash`/`currentTrait`/`selMilestone` state vars.
- `app.js` — all application logic: render pipeline, the three custom milestone-drill modules
  (`mcFlow`/`renderMasterplanConfirm`, `pcState`/`renderPreConsult`, `kmSubState`/`renderKMOnlineSubmission`),
  the shared calendar-picker popup, and tab wiring.
- `PPD-Digitalization-Dashboard.html` — a **separate, fully self-contained single-file bundle** (styles/data/app
  inlined back into one `<style>`/`<script>`) for local/offline sharing (e.g. email) where a multi-file folder
  isn't practical. It is NOT a straight `cp` of `index.html` anymore — see "How to make common changes" below.
- `SMS-Specification.md` — the Business/Functional Requirements Spec (reference only; not embedded in this base).
- `README.md`.

Cache-busting: `index.html` versions `styles.css`/`data.js`/`app.js` with a `?v=N` query string. Bump it
when editing any of the three, or browsers may serve a stale cached copy.

## Live site
GitHub Pages repo `iversonkb-jpg/ppd-tracker` → https://iversonkb-jpg.github.io/ppd-tracker/
Update: edit `index.html`, commit/upload to `main`; Pages redeploys in ~1 min.

## Architecture (plain JS — no framework)
Split across `data.js` (data) + `app.js` (logic), rendered into the shell markup in `index.html`. Three
dashboards selected by the secondary tab row (`#subTabs`):
- **`MKM`** — Master KM (Kebenaran Merancang via OSC 3.0 Plus), 9 milestones. Three milestones have a
  fully custom interactive drill-in instead of the generic steps list (flagged on the milestone object,
  branched in `renderDrill`):
  - **#1 Masterplan Confirmation** (`mc:true`) → `renderMasterplanConfirm` / `mcFlow` — Step 1 Project
    Brief (base plan upload + basic project data + studies-to-arrange) gates Step 2, a repeating KM
    Meeting cycle (kick-off date/minutes/masterplan-cut upload → CA feasibility → PPD approval, looping
    until approved) → management presentation/clearance → inform consultant → confirm KM in system.
  - **#2 Pre-consultation & Upload Doc** (`pc:true`) → `renderPreConsult` / `pcState` — per-authority
    (`PC_INTERNAL`/`PC_EXTERNAL`) pre-consultation record with submission rounds (R0, R1…) and PPD
    Accept/Reject.
  - **#3 KM Online Submission** (`kmsub:true`) → `renderKMOnlineSubmission` / `kmSubState` — twin-track
    (KM/BP) submission-date + acknowledgement + doc upload, auto-forwards to land surveyor once both
    tracks are complete.
  Agency gate G1–G8 folded into milestone 3's prerequisite (`depts:"km"` → `DEPTS_KM`).
- **`MINFRA`** — Master Infra, 8 milestones, trait-aware: 7 traits (Earthwork, Road & Drainage,
  Streetlighting, Sewerage, Water Supply, Power, Telekom). Authority grid per trait via `TRAIT_AUTH`
  (milestones with `depts:"trait"`).
- **`LINFRA`** — Local Infra (agency-level), 7 milestones, 7 traits.
- Registered in `DASHES = {mkm, minfra, linfra}`.

Each **milestone** = `{n, label, st (status class), date, steps[[text, actorTag]], depts?}`.
`actorTag` ∈ `auto|ppd|con|sm` → coloured role chip (`tagFor`). `depts` ∈ `"km"|"trait"|"infra"`
selects which authority-clearance grid shows in the drill-in.

Status colours (`S`): green/amber/orange/red/grey/appeal → `st-*` classes; labels in `statusLabel`.

**Render pipeline**: `render()` (re-renders on tab/project/trait change) → `renderKPIs`, `gaugeSVG`
(SVG segment gauges), `renderTraitTabs` (trait pills for infra), `renderTimeline` (dot-timeline;
click a dot → drill), `renderDrill` (steps + authority grid + sample document checklist), `sampleDocs`.
Sidebar project list via `buildProjTree` (`projects[]`, `currentProj`). Countdown to `AP_TARGET`.

## State
`currentDash` (mkm/minfra/linfra), `currentProj`, `currentTrait`, `selMilestone`.

## How to make common changes
- **Change a status colour** → edit the milestone's `st:` value (e.g. `S.green`).
- **Add / edit a milestone** → edit the object's `milestones[]`; keep `n` sequential.
- **Change authorities** → `DEPTS_KM` or `TRAIT_AUTH`.
- **Countdown** → `AP_TARGET` / `TODAY` near the top of `data.js`.
- **Projects list** (sidebar) → `projects[]`.
- After editing `data.js`/`app.js`/`styles.css`, bump the `?v=N` on their `<script>`/`<link>` tags in
  `index.html`, then re-inline the three files into `PPD-Digitalization-Dashboard.html` (it must stay a
  single standalone file — see "Files" above) to keep it in sync.

## Data status
Deterministic sample data for demo (Utopia South / Eco Grandeur). Not wired to a live source, auth, or
persistence.

## Verification
No test framework. Verify under jsdom (node + jsdom): milestone counts (KM=9, Infra=8, Local=7),
7 trait pills on infra dashboards, trait-specific clearance grids, and no runtime errors on tab/trait
switches. Browser screenshotting is blocked by the sandbox network allowlist, so jsdom is the check of record.

## Features NOT in this base (were in a later branch the user reverted away from)
Masterplan-Confirmation accordion, target-vs-actual slippage indicators, role switcher, My Tasks inbox,
System Spec tab, and the project-centric 15-stage register. Re-add only if the user asks.

## Tip
`index.html` was never committed to git in the past, so there was no rollback point. Recommend committing
to git before large changes so there's always a clean restore point.
