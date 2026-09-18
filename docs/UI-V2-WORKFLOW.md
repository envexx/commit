# UI V2 — THE GUIDED PAYMENT WORKFLOW

> The design language for the connected experience (apps/web), replacing the
> V1 "dashboard monitoring" layout. Origin: the V2 redesign direction agreed
> in the Figma session (the Figma file was not updated — the Figma connector
> hit its plan's call limit — so V2 landed directly in code). Related:
> `Design.md` (visual tokens, unchanged), `DECISIONS.md` (ED-14).

## 1. The problem with V1

The V1 home answered "what exists" (stat tiles: total committed / in
progress / in review / settled, then a flat card grid). The product's job is
to answer, for someone who does not want to learn crypto:

1. **Is the money safe?**
2. **Where am I?**
3. **What do I need to do now — and what happens after?**
4. **Can I verify this independently?**

## 2. The flow

```
Connect wallet
      ↓
What do you want to do?
      ↓
┌─────────────────────┬──────────────────────┐
│ I'm hiring someone  │ I'm doing the work   │
│ Protect a payment   │ Check my payment     │
└──────────┬──────────┴──────────┬───────────┘
        CLIENT               CONTRACTOR
           │                     │
Create milestone         Open shared milestone
Define work + amount      Verify payment
Define deadline/rules      ├─ NOT SECURED → do not start
Review & fund USDC         └─ SECURED → safe to start
Share milestone                Do work
Wait for delivery          Submit work
Review work                Waiting for review
Approve / Revision         Approved / Timeout
           └──────────┬──────────┘
               PAYMENT RELEASED → SETTLED
```

The home adapts: wallet disconnected → the narrative landing (the product
story); connected → the workflow home. Role is an **intent, not an
identity** — one wallet can be client on one milestone and contractor on
another, so "Your Work" splits into `Getting paid` (you are the contractor)
and `Paying` (you are the client) tabs.

## 3. State → human translation (the one table)

The contract state machine (10 states) is system truth. The UI translates;
it never asks the user to learn the states. One module owns this:
`apps/web/src/lib/lifecycle.ts`.

| Vault state | Lead (what you feel) | Steps 1·2·3·4 | My move? |
| --- | --- | --- | --- |
| `Created` | NOT SECURED YET / WAITING FOR THE CLIENT | ✓ · → · ○ · ○ | client funds; contractor **must not start** |
| `Funded` / `Active` | PAYMENT SECURED / WORK IN PROGRESS | ✓ · ✓ · → · ○ | contractor works + submits |
| `Submitted` | IN REVIEW / WAITING FOR REVIEW | ✓ · ✓ · ✓ · → | client reviews |
| `RevisionRequested` | CHANGES REQUESTED (loops back to step 3) | ✓ · ✓ · ! · ○ | contractor resubmits |
| `Disputed` | ON HOLD (release paused) | ✓ · ✓ · ✓ · ! | client resolves |
| `Settled` / `SettledByTimeout` | PAID | ✓ · ✓ · ✓ · ✓ | — |
| `RefundedExpired` | CLOSED — NOT PAID (step 4 becomes "Returned to client") | ✓ · ✓ · ○ · ✓out | — |
| `CancelledMutual` | STOPPED BY AGREEMENT | ✓ · ✓ · ○ · ✓out | — |
| read failed / offline | CANNOT VERIFY RIGHT NOW | → · ○ · ○ · ○ | open to verify |

The four steps are always: **Terms agreed → Payment secured → Work
submitted → Payment released.** Deadline overrides (mirroring the vault's
own rules) promote time-sensitive cards to the top: expired work deadline →
client "Reclaim the payment"; expired review window → contractor "Release
the payment now" (permissionless onchain), client "approve now if the work
is good".

## 4. The three-level info hierarchy

Blockchain is the **proof layer**, not the product. Every card reads,
top to bottom:

1. **Human meaning** — `PAYMENT SECURED — You can safely start this work.`
2. **Financial meaning** — `1,500.00 USDC locked for this milestone.`
3. **Verification** — `✓ Verified on Arc · 0x4C…A102 · View on Arc Explorer ↗`

When the chain cannot be read, level 3 honestly says "Not verified yet —
open this milestone to check". The card never claims security it cannot
prove. The FUNDED vs UNFUNDED distinction stays loud everywhere (P1 rule):
an unfunded milestone always shows "NOT SECURED YET / do not start work".

## 5. Component map

| Piece | File |
| --- | --- |
| State → meaning translator (pure) | `src/lib/lifecycle.ts` |
| Shared-link/address paste parser | `src/lib/milestone-input.ts` |
| Adaptive home gate | `src/components/work/AdaptiveHome.tsx` |
| Workflow home (tabs, batch reads, sorting) | `src/components/work/WorkHome.tsx` |
| Role-intent cards | `src/components/work/RoleIntentCards.tsx` |
| Paste-shared-link form | `src/components/work/OpenSharedMilestoneForm.tsx` |
| 4-step stepper | `src/components/work/LifecycleStepper.tsx` |
| Milestone card V2 (hook-free) | `src/components/MilestoneCard.tsx` |
| Narrative landing (shared with `/about`) | `src/components/marketing/narrative-landing.tsx` |
| QA matrix (all states × roles) | `src/app/dev/lifecycle/page.tsx` |

Data rules: one batched multicall (`getConfig` + `getStatus` interleaved,
length-guarded) backs the whole list; cards receive props, run zero hooks.
Actionable-first ordering comes from `sortActionableFirst` (deadline-expired
→ my move → waiting → paid → closed; newest first inside a rank).
