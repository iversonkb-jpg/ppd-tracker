# PPD Digitalization — Submission Management System (SMS) prototype

## What this is
An interactive UIUX prototype for the **PPD (Project Planning & Development)** digitalization
initiative at Eco World, rebuilt to the **SMS specification** (`SMS-Specification.md`). It is a single
self-contained HTML file (no backend, no build), styled on the PPD "KMBP Works Flow & Suggested
Interface/Dashboard Concept" deck.

## Files
- `index.html` — the app (served by GitHub Pages). **Edit this one.**
- `PPD-Digitalization-Dashboard.html` — identical copy for local/offline sharing. Keep in sync.
- `SMS-Specification.md` — the Business/Functional Requirements Spec (source of the in-app Spec tab).
- `README.md`.

## Live site
GitHub Pages repo `iversonkb-jpg/ppd-tracker` → https://iversonkb-jpg.github.io/ppd-tracker/
Update: edit `index.html`, commit to `main`; Pages redeploys in ~1 min.

## Architecture (single file, plain JS — no framework)
The app is now **project-centric** per the spec (replaced the earlier fixed Master KM / Master Infra /
Local Infra dashboards). Everything lives in `index.html`:

- **Reference data**: `STAGES` (canonical 15-stage lifecycle), `STAGE_DESC`, `STAGE_OWNER`,
  `STATUS_COLOR` (19-status model → grey/blue/amber/green/red), `CATS` (13 submission categories),
  `TEMPLATES` (Township/High-Rise/Landed → category sets), `AUTH_SETS` (per-category authority
  clearance grids incl. KM's G1–G8 gate), `FEES` (per-category fee/status).
- **Project tree**: `NODES` self-referencing (`parent`) — Eco Grandeur BU → projects → sub-projects
  (Utopia East is a container with two precincts). Helpers: `childIds`, `leafIds`, `node`, `isLeaf`.
- **Deterministic generator**: `submissionsFor(leaf)` builds the register from a hash of leaf+category.
  KM stage biased to 10–15; infra streams **blocked until KM APPROVED** (BR-14). `statsFor(id)` rolls
  up descendants for portfolio/container views. `_subCache` memoises.
- **Views** (`setView`): `portfolio` (BU roll-up cards), `project` (KPIs + Submission Register table,
  or sub-project cards for containers), `tasks` (My Tasks), `spec` (embedded BRD/FRS).
- **Submission detail** (`renderSubmission`): click a register row → 15-stage dot-timeline
  (`renderTimeline`) + stage drill-in (`renderStage`) with purpose/owner, authority-clearance grid,
  fee line (Stage 7), and the document-folder set (§11). Colours from `COL2ST`/`COL2SB`.
- **Masterplan Confirmation** (`renderMasterplanConfirm`): KM **Stage 6** drill-in is the Apple-style
  5-phase accordion collapsing the 23-step Stage-B flow; interactive upload/date/confirm controls with
  role-gating; P&C lock; repeat-loop badge. Uses `mcState` + `openCalendarPicker`.
- **Roles & gating**: `#roleSel` (PPD-HOD, PPD-PIC, Planner, Consultant, SM/HOD, CDO/CEO);
  `OWNER_ROLES`/`canAct`; `STAGE_OWNER` maps each stage to its responsible role.
- **My Tasks**: `buildTasks()` derives the open-action list from every project's register (the current
  stage's owner); `myOpenTasks()` filters by role; `renderTasks()` lists them with an Open button that
  navigates to that submission. Count badge on the tab.
- **System Spec**: `#specSrc` markdown block rendered by the built-in parser (`mdToHtml`/`renderSpec`).

## State
`currentView`, `selNode` (project/BU id), `selSub` (submission id or null), `selStage`, `currentRole`.

## How to make common changes
- **Add a category** → add to `CATS`, `TEMPLATES`, `AUTH_SETS`, `FEES`.
- **Add a project / sub-project** → add a node to `NODES` with `parent` + `template` (or `container:true`).
- **Change stage text/owner** → `STAGE_DESC` / `STAGE_OWNER`.
- **Change status colours** → `STATUS_COLOR`.
- **Tune sample spread** → the hash biases in `submissionsFor`.
- After editing `index.html`, copy it over `PPD-Digitalization-Dashboard.html`.

## Verification
No test framework. Verified under jsdom: register = 13 rows (Township), 15-stage timeline, portfolio
roll-up (5 projects), container nesting (2 precincts, 11-row Landed), KM Stage-6 Masterplan accordion
(5 phases), Stage-7 fee line, per-role task counts, My Tasks Open→submission navigation, KM gate
blocking infra, and the Spec tab (sections + tables). Browser screenshotting is blocked by the sandbox
network allowlist, so jsdom is the check of record.

## Known follow-ups / not yet built
- Deep drill data is illustrative; not wired to a live source, auth, or persistence.
- Planner / SM-HOD task inboxes are light (those roles mostly act inside KM Stage 6, not as register
  stage-owners).
- Reports (§14), notification log (§12), audit-trail view (§9), and fee-reconciliation KPI (§13) are
  described in the Spec tab but not yet built as interactive screens.
- Target production build is Microsoft Power Platform (Power Apps + SharePoint + Power Automate).
