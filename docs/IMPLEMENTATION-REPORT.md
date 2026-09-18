# IMPLEMENTATION REPORT

> Full-stack status of Arc Milestone Assurance as of 2026-09-17: what is
> implemented, what is verified, and what is still open. Verified numbers in
> this report were re-run on this date (`forge test`, `tsc`, `next build`,
> browser check). The UI-specific audit lives in
> [`UI-AUDIT-REPORT.md`](./UI-AUDIT-REPORT.md).

## 1. Executive summary

The V1 loop — **client commits USDC → contractor submits evidence → agreed
rules release / refund** — is implemented end-to-end at the code level:

- `MilestoneVault` + `MilestoneVaultFactory` (Solidity 0.8.24, no
  upgradeability, no admin key) with a 10-state machine.
- **74/74 Foundry tests pass**, including a fuzz/invariant suite
  (16 runs / 1024 calls) asserting the vault never holds more than the
  committed amount.
- Next.js 15 web app (static export) covering create → fund → submit →
  review/dispute → settle/refund, reading all money state directly from the
  chain.
- Deployed and exercised **locally on anvil** (chain 31337, factory + mock
  USDC recorded in `deployments/31337.json`).
- **Not yet done:** Arc mainnet deployment evidence and the repo still has
  **no git commits yet**.

## 2. Roadmap phase status (vs §23 of the master roadmap)

| Phase | Deliverable | Status |
| --- | --- | --- |
| 0 — Validation freeze | Arc params confirmed in `ARC_MAINNET.md`; per-milestone vault chosen (AD-3) | Done |
| 1 — Contract spec | State machine as tests, events/errors, threat model, Foundry scaffold | Done |
| 2 — Contract implementation | Full state machine + unit/security/invariant tests | Done (74/74 pass) |
| 3 — Web MVP | Wallet, create/fund, detail page, submit, approve, timeline, explorer links | Done |
| 4 — UX hardening | Wrong-network banner, tx states, FUNDED/UNFUNDED distinction, countdowns, empty/error/loading states | Done |
| 5 — Mainnet deployment | Verified deploy + addresses + smoke test | **Not started** (no `deployments/5042.json`, no tx evidence) |
| 6 — Failure-path mainnet validation | Timeout/refund on mainnet + evidence log | **Not started** |
| 7 — Submission packaging | README, demo video, `DEMO_EVIDENCE.md` | Mostly done (`README.md`, `DEMO_EVIDENCE.md`, `LICENSE`, `.gitignore` added 2026-09-17; demo video optional) |

## 3. Smart contracts (`packages/contracts`)

### 3.1 `MilestoneVault.sol` (288 lines)

- **Immutable at construction:** client, contractor, token, amount, scopeHash,
  metadataURI, submissionPeriod, reviewPeriod. Validation reverts on zero
  addresses, `client == contractor`, zero amount, empty scope/URI, and periods
  outside `1d … 365d` (submission) / `1d … 30d` (review).
- **State machine (10 states):** `Created → Funded → Active → Submitted →
  {RevisionRequested → Submitted | Disputed → Settled} → Settled |
  SettledByTimeout | RefundedExpired | CancelledMutual`.
- **Rules enforced onchain:**
  - `fundMilestone` — client only, `Created` only, pulls USDC via
    `transferFrom` (checks return value).
  - `acknowledgeStart` — contractor signal, `Funded → Active`.
  - `submitWork` — contractor, from `Funded/Active/RevisionRequested`,
    requires non-empty hash+URI; starts the review clock.
  - `approveAndRelease` — client, from `Submitted/Disputed`, pays contractor.
  - `requestRevision` — client within review window; bumps `revisionCount`,
    resets the submission deadline.
  - `dispute` — client within review window; pauses timeout release.
  - `claimAfterReview` — **permissionless** timeout release to contractor
    after `reviewDeadline`.
  - `refundExpired` — client reclaims after `submitDeadline` with no live
    submission (`Funded/Active/RevisionRequested`).
  - `proposeMutualCancel` — both parties must sign; refunds client.
- **Safety:** custom errors for every failure branch, reentrancy `guard` on
  all value-moving functions, checks-effects-interactions ordering, no native
  value accepted, no owner/admin/upgrade hooks.
- **Read API:** `getConfig()` / `getStatus()` return the full state for the UI.

### 3.2 `MilestoneVaultFactory.sol`

`createMilestone(...)` deploys a standalone vault via plain `CREATE`
(msg.sender = client), maintains `isVault` / `vaultCount` / `allVaults`, and
emits `MilestoneCreated` (the UI parses this event to learn the vault address).

### 3.3 Scripts & local deployment

- `script/DeployLocal.s.sol` — anvil deployment (MockUSDC + Factory), writes
  `deployments/31337.json`:
  factory `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`,
  USDC `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
- `script/Deploy.s.sol` — mainnet/testnet deployment script (ready, not yet
  executed against a live chain in this repo).
- `test/mocks/MockUSDC.sol` — 6-decimal mock matching Arc USDC semantics.

### 3.4 Test verification (re-run 2026-09-17)

`forge test` → **15 suites, 74 tests passed, 0 failed**:

- `MilestoneVault.t.sol` — per-transition happy path + failure cases.
- `MilestoneVaultSecurity.t.sol` — unauthorized callers, reentrancy, trapped-
  fund checks.
- `MilestoneVaultFactory.t.sol` — deployment, registry, event.
- `MilestoneInvariants.t.sol` — actor-based fuzz: 10 handlers (fund, submit,
  approve, claim, dispute, refund, revision, cancel, ack, time-warp), 16 runs
  / 1024 calls / 0 reverts; invariant: **vault never holds more than the
  commitment**.

## 4. Web app (`apps/web`)

### 4.1 Stack

Next.js 15 (`output: 'export'`, trailing slash, unoptimized images), React 19,
wagmi 2 + viem 2 (injected connector, cookie storage, SSR-safe), TanStack
Query, Tailwind 3 + tailwindcss-animate, motion/framer-motion, lucide-react +
simple-icons, Radix (dialog, dropdown-menu). Fonts: Inter + Plus Jakarta Sans
(`next/font`). Design tokens per `docs/Design.md`.

Chains configured: Arc Mainnet (5042), Arc Testnet (5042002), local anvil
(31337), selected via `NEXT_PUBLIC_CHAIN`.

### 4.2 Implemented features

- **Wallet:** connect/disconnect (injected), SSR-safe mount, wrong-network
  banner with one-click `switchChain` (`NetworkBanner.tsx`).
- **`/` landing:** problem/thesis narrative, onboarding checklist, screen
  shuffle loop, honest-limits section, capability matrix, socials, footer.
- **`/create` (client flow):** contractor + title + scope (keccak256
  commitment shown live) + amount (6-dec parse) + work deadline + review
  window; validation incl. contractor ≠ self; `createMilestone` tx; parses
  `MilestoneCreated` from the receipt; saves a local record; two-step
  **approve → fund** with per-step toasts; live summary sidebar; "Agreed
  rules" explainer; config-missing and no-wallet guards.
- **`/milestones`:** local registry filtered to the connected wallet, batched
  `getConfig` multicall, total committed USDC header, skeleton/empty/no-wallet
  states, cards with role + state.
- **`/milestone?address=0x…` (shared link):** state-colored banner with
  `STATE_META` copy, amount, party links with explorer + "you" markers;
  **role/state-aware action panel** — fund (with allowance + USDC balance
  pre-checks), contractor waiting warning, acknowledge, submit/resubmit
  (URL-validated, hash stored), request revision, approve & release, dispute,
  permissionless timeout claim, refund after deadline, propose/accept mutual
  cancel; details panel with countdowns; scope hash verification; evidence
  panel; copy-share-link; activity timeline from onchain events (chunked log
  fetch, 15s refetch); 30s status polling.
- **Cross-cutting:** `useTx` (pending/hash/receipt-wait/error normalization +
  query invalidation), toasts, `TxButton`/`TxError`/`TxLink` with explorer
  links, skeletons/empty states everywhere, static export builds clean.

### 4.3 Verification (re-run 2026-09-17)

- `npx tsc --noEmit` — clean.
- `npm run build` — success, 7/7 static pages exported (`/`, `/create`,
  `/milestone`, `/milestones`, `/_not-found`).
- Browser (static export on `localhost:3001`): no console errors on any page;
  `/milestone` with an invalid address renders the new "No milestone found"
  state (fix from the UI audit, see `UI-AUDIT-REPORT.md`: mojibake glyph,
  broken avatar assets, endless-skeleton bug — all fixed and verified).

## 5. Documentation

- `Arc_Milestone_Assurance_Master_Product_Roadmap.md` — master product/engineering
  authority (35 sections).
- `docs/DECISIONS.md` — decision log: D-001…D-011 inherited + architecture
  decisions AD-1 (Arc params), AD-2 (USDC ERC-20 semantics), AD-3 (per-milestone
  vault via CREATE).
- `docs/ARC_MAINNET.md` — verified network parameters (chain 5042, RPC,
  explorer, native-USDC/ERC-20 interface rules, decimals warning).
- `docs/Design.md` — frontend design system spec (tokens, stacks, motion).
- `docs/UI-AUDIT-REPORT.md` — UI defect audit + fixes (this session).
- `README.md` (root) — submission-facing overview per §34 of the roadmap.
- `DEMO_EVIDENCE.md` — evidence register: local rehearsal recorded, mainnet
  entries marked `_TBD_` until deployment.
- `LICENSE` (MIT) + root `.gitignore` (build artifacts, env files).

## 6. Open gaps (honest list)

1. **No mainnet deployment evidence** — Phase 5/6 deliverables (verified
   deploy, addresses, smoke-test tx hashes) are missing; only the local anvil
   record exists.
2. **No git history** — the repository has zero commits on `master`; the
   roadmap's "commit small, reviewable changes" contract is not yet satisfied.
3. **Missing env wiring for a working demo** — `NEXT_PUBLIC_FACTORY_ADDRESS`
   / `NEXT_PUBLIC_USDC_ADDRESS` unset at build time, so `/create` shows the
   "not configured" guard and the full happy path cannot be exercised through
   the built site.
4. **Two-wallet happy-path demo not recorded** — Phase 3/6 exit criteria
   (client + contractor completing the flow, failure paths) are unproven in the
   repo. The scripted walkthrough exists in `apps/web/README.md`.

## 7. Reproduce the verification

```bash
# contracts
cd packages/contracts && forge test          # 74/74 pass

# web
cd apps/web
npx tsc --noEmit                             # clean
npm run build                                # static export to out/
# serve out/ and open http://localhost:3001
```
