# UI AUDIT REPORT

> Scope: `apps/web` (Next.js static export). Covers the audit session of
> 2026-09-17: what was checked, defects found, fixes applied, and verification
> evidence. Related: `DECISIONS.md`, `DESIGN.md`.

## 1. Summary

| ID | Severity | Area | Status |
| --- | --- | --- | --- |
| UI-001 | Low | `/milestone` banner | Fixed |
| UI-002 | Medium | `/milestone` avatar stack | Fixed |
| UI-003 | High | `/milestone` loading/error handling | Fixed |

TypeScript (`tsc --noEmit`) and `next build` pass after all changes. Verified
in a real browser against the rebuilt static export.

## 2. Method

1. Static analysis: `npx tsc --noEmit`, full read of `src/app/**`,
   `src/components/**`, `src/hooks/**`.
2. Live check: served `apps/web/out` (static export) on `localhost:3001` and
   inspected `/`, `/create`, `/milestones`, `/milestone?address=0x…` for
   console errors, broken images, and stuck states.
3. After fixes: rebuild (`npm run build`) and re-verify in the browser.

Note: the local server on `:3001` is a plain static file server over `out/`,
not `next dev` — source edits are invisible until `npm run build` re-exports.

## 3. Findings and fixes

### UI-001 — Mojibake in the milestone banner

- **Where:** `src/app/milestone/page.tsx` (status banner, under the avatar
  stack).
- **Symptom:** the label rendered as `client � contractor` — the separator was
  the Unicode replacement character `U+FFFD` (char code 65533), i.e. a
  corrupted byte sequence, not an intentional glyph.
- **Fix:** replaced with a proper middle dot: `client · contractor`.

### UI-002 — Broken avatar images on the milestone page

- **Where:** `src/components/ui/avatar-stack.tsx`.
- **Symptom:** `DEFAULT_IMAGES` pointed to `/lab-icons/avatars/abs-1..6.svg`,
  assets copied from another project. `apps/web` has no `public/` directory at
  all, so every request 404s. Because the default array is non-empty, the
  initials fallback never triggered and `<img>` tags rendered broken-image
  icons on the milestone detail page.
- **Fix:** removed the dead asset list; the component now defaults to
  `images = []` and renders initials coins. The `images` prop still works for
  real assets when they exist.

### UI-003 — Milestone page stuck on skeletons forever

- **Where:** `src/app/milestone/page.tsx` (`MilestoneDetail`) and
  `src/hooks/useVault.ts`.
- **Symptom:** the guard `if (isLoading || !config || !status)` renders
  skeletons. When the on-chain read fails (vault address is not a contract,
  wrong network, RPC error), `isLoading` becomes `false` but `config`/`status`
  stay `undefined`, so the page shows an endless skeleton with no error and no
  way out. This is the state every visitor of a shared link hits when the
  address is invalid — the worst possible first impression for the
  share-link flow.
- **Root cause:** `useVault` composed `isLoading` from both queries but
  discarded their `error` fields.
- **Fix:**
  - `useVault` now also returns `error: cfg.error ?? st.error`.
  - `MilestoneDetail` separates loading from failure: skeletons only while
    `isLoading`; on `error || !config || !status` it renders an
    `EmptyState` — "No milestone found at this address" with a hint to check
    the address/network and a CTA to `/create`.

## 4. Verification

- `npx tsc --noEmit` — clean (no output).
- `npm run build` — success: 7/7 static pages, exported to `out/`
  (`/`, `/create`, `/milestone`, `/milestones`, `/_not-found`).
- Browser check against the rebuilt export,
  `/milestone?address=0x7a3f…1c2e`:
  - skeleton count `0`;
  - images with failed loads `[]`;
  - `U+FFFD` no longer present anywhere in `src/` (grep verified);
  - not-found state renders: "No milestone found at this address".
- Console: no errors or warnings on any checked page.

## 5. Known limitations / follow-ups

- `NEXT_PUBLIC_FACTORY_ADDRESS` / `NEXT_PUBLIC_USDC_ADDRESS` were empty at
  build time, so `/create` correctly shows the "Contracts are not configured"
  warning. Set both in `.env` and rebuild for a fully working flow.
- Milestone detail with a real funded vault was not exercised end-to-end in
  this session (no configured contracts locally); fixes were verified at the
  error/loading boundary, which is where all three defects lived.
- The milestone registry is browser-local (`src/lib/registry.ts`); clearing
  site data loses the title/scope display fallback.

## 6. Environment note

Background dev/static servers were stopped after the session (arc static
server on `:3001`, plus two unrelated `proof` project servers on `:5175` and
`:8787`). To restart the arc preview:

```
cd apps/web
npm run build
node <path-to-static-server> out 3001
```
