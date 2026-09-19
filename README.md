# Commit

**Pre-funded USDC milestones on Arc.** The money exists before the work starts;
release follows agreed rules, not promises.

## Problem

An invoice records a debt **after** the work is done. Freelancers and small
agencies start work against a promise, then chase payment. The failure mode is
structural: nothing commits the client's money before the work begins, and
nothing guarantees release after a valid delivery.

## What it does

Commit is a minimal, non-custodial payment commitment
primitive. For one agreement, the client deploys a dedicated vault and commits
an exact USDC amount before work starts. The contractor can prove the money
exists onchain, submits evidence against a scope hash, and settlement runs by
rules both parties agreed to upfront:

- **Client approval** releases instantly.
- **Review-window timeout** — if the client goes silent after a valid
  submission, the contractor executes a permissionless release.
- **Deadline refund** — if the contractor never submits, the client reclaims
  after the work deadline.
- **Mutual cancel** — both signatures, full refund, no exceptions.
- **Dispute** pauses the timeout release; V1 resolves it by approval or mutual
  cancel only. No administrator, no platform key, no seizure function.

One vault per milestone. Isolated, auditable accounting: one contract equals
exactly one committed amount.

## Why Arc

- **USDC-native gas** — settlement and fees in the same stable asset; gas is
  fractions of a cent.
- **Sub-second finality** — milestone state changes settle in under a second.
- **EVM equivalent** — standard Solidity/Foundry toolchain, `viem`/`wagmi`
  frontends work out of the box.
- Native USDC exposes the standard **ERC-20 interface** at
  `0x3600000000000000000000000000000000000000` (6 decimals); the vault treats
  it as a plain ERC-20 and never touches native value.

## Live Demo

Static export of the app is the deliverable; run it locally in one command set
(see [Run Locally](#run-locally)). Public hosted URL is added at microgrant
submission.

## Mainnet Contract

> Pending — deployment evidence is recorded in
> [`DEMO_EVIDENCE.md`](./docs/DEMO_EVIDENCE.md) as soon as the verified mainnet
> deployment happens.

| Item | Value |
| --- | --- |
| Network | Arc (chain 5042) |
| MilestoneVaultFactory | _TBD_ |
| Verification | _TBD_ |

## Demo Transactions

See [`DEMO_EVIDENCE.md`](./docs/DEMO_EVIDENCE.md). Local rehearsal (anvil) is fully
scripted and reproducible; mainnet tx hashes are appended at deployment.

## Architecture

```
packages/contracts        Foundry: MilestoneVault, MilestoneVaultFactory,
                          deploy scripts, 74 tests incl. fuzz invariants
apps/web                  Next.js 15 static export, wagmi/viem + TanStack Query
docs/                     decision log, network facts, design system, reports
```

The UI is **read-only against the chain** for all money state: `getConfig()`,
`getStatus()`, and vault events. There is no backend that can lie about the
money. Human-readable title/scope metadata rides along in the URI (base64
JSON) plus a browser-local registry for convenience lists.

State machine (one direction of the happy path):

```
Created → Funded → Active → Submitted → Settled
                        ↘ RevisionRequested ↘ Disputed
   Funded/Active → RefundedExpired        Submitted → SettledByTimeout
   any pre-settle → CancelledMutual (both signatures)
```

## Run Locally

Contracts (Foundry):

```bash
cd packages/contracts
forge test          # 74 tests
anvil               # terminal 1
forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

Web (Next.js static export):

```bash
cd apps/web
npm install
cp .env.example .env.local    # fill from deployments/31337.json
npm run dev
```

Full two-wallet rehearsal walkthrough (client + contractor on anvil, the exact
demo script): [`apps/web/README.md`](./apps/web/README.md).

## Tests

```bash
cd packages/contracts && forge test
```

74 tests, 0 failures — unit (per-transition happy/failure), security
(unauthorized callers, reentrancy, trapped-funds), factory, and an
actor-based invariant suite (16 runs / 1024 calls) asserting the vault **never
holds more than the committed amount**.

Web: `cd apps/web && npx tsc --noEmit && npm run build`.

## Security / Limitations

- V1 has **no third-party arbitration**. A dispute freezes the timeout;
  resolution is client approval or bilateral mutual cancel — nothing else.
- The vault guarantees **funding and settlement rules**, not deliverable
  quality.
- Scope is a **hash commitment** (keccak256); evidence files stay offchain
  with their hash onchain.
- Immutable parameters: amount, parties, deadlines and review window cannot be
  changed after creation.
- Descriptive language only — this is a pre-funded milestone / conditional
  payment tool, **not a licensed escrow service**.
- No upgradeability, no owner, no admin functions. Audited-by-tests, not
  audited-by-humans: treat as a prototype until a review says otherwise.

## Roadmap

- **Now (V1):** the complete create → fund → submit → settle/refund loop, on
  Arc mainnet.
- **Next:** verifiable credential anchoring for evidence, batch vault reads
  for agencies, public registry of settled milestones.
- **Later (protocol):** agent-commerce primitive — AI agents pay each other in
  pre-funded milestones; extension modules per §28 of the
  [master roadmap](./docs/ROADMAP.md).

Engineering status and open gaps are tracked honestly in
[`docs/IMPLEMENTATION-REPORT.md`](./docs/IMPLEMENTATION-REPORT.md).

## License

[MIT](./LICENSE)
