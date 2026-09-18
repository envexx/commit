# DECISIONS.md

> Decision log. Business rules come from PRODUCT_MASTER.md (the master roadmap).
> Any change to a business rule must be recorded here. Newest decisions at the
> bottom.

## Inherited from the master document

- **D-001** Solve payment assurance, not generic transfer.
- **D-002** Initial user: contractor / small agency with an existing client.
- **D-003** V1 uses pre-funded milestone in USDC on Arc.
- **D-004** No talent discovery / marketplace.
- **D-005** No universal dispute resolution claim.
- **D-006** Use "conditional payment / milestone vault" language, not "escrow".
- **D-007** Onchain state is authoritative for money state.
- **D-008** Evidence files stay offchain; cryptographic reference onchain.
- **D-009** Timeout behavior agreed before funding.
- **D-010** Mainnet deployment is a release requirement.
- **D-011** Agent commerce (future) reuses the same primitive.

## Phase 0 resolutions (open questions from §32)

### AD-1: Arc mainnet parameters
Resolved from official docs (see ARC_MAINNET.md): chain ID `5042`, RPC
`https://rpc.mainnet.arc.io`, explorer `https://explorer.arc.io`.

### AD-2: USDC interaction semantics
The vault uses the **ERC-20 interface** of native USDC at
`0x3600000000000000000000000000000000000000` (6 decimals) with
`approve`/`transferFrom`/`transfer`, per official Arc guidance. No wrapped
token, no native-value handling in the contract.

### AD-3: Architecture — per-milestone vault (Option A)
`MilestoneVaultFactory` deploys one standalone `MilestoneVault` per agreement
via plain `CREATE`. Rationale: strong isolation, trivially auditable accounting
(one vault = exactly one committed amount), explorer-legible, zero
cross-milestone blast radius. Higher per-milestone deployment gas is acceptable
because Arc gas is USDC-denominated and cheap. Immutable parameters are set in
the constructor; there is no initializer, no owner, no upgradeability, and the
factory holds no privileges over deployed vaults.

### AD-4: Default review period
**7 days** is the UI default; the creator may pick 3 or 14 days (bounded 1–30
days onchain).

### AD-5: Contractor acknowledgement
`acknowledgeStart()` **is included** as an explicit onchain action
(Funded → Active, contractor-only). It is cheap, gives the contractor a
verifiable "I have started" signal, and matches the V1 MUST list. Submission is
permitted from `Funded`, `Active`, or `RevisionRequested` — acknowledgement is
never a blocker.

### AD-6: Revision is in V1
`requestRevision()` (client, while `Submitted`, before review deadline) returns
the milestone to `RevisionRequested`; the contractor resubmits via
`submitWork()`, which restarts the review clock. If the contractor does not
resubmit before the restarted deadline, `refundExpired()` becomes available to
the client. Both parties always retain a bounded exit.

### AD-7: DISPUTED pauses timeout release
`dispute()` (client, while `Submitted`, before review deadline) blocks
`claimAfterReview()`. A disputed milestone can only end via client
`approveAndRelease()` or bilateral mutual cancel. This is the honest V1
limitation: an unresolved dispute holds funds in place under mutually agreed
rules — no silent automatic release, no admin seizure. Documented in the UI at
milestone creation.

### AD-8: Split settlement — NOT in V1
Settlement is binary: full release to contractor, or full refund to client.
`proposeMutualCancel`/`acceptMutualCancel` (both parties) is the only refund
path before deadline expiry. Split settlement is deferred (V1.5+).

### AD-9: Platform fee
**Exactly 0** for the microgrant version. No fee logic exists in the contracts;
there is no fee recipient anywhere. A future `IFeePolicy` can extend this
without changing the state machine.

### AD-10: Metadata storage
**HTTPS URI + keccak256 hash** committed onchain (`metadataURI`/`scopeHash` at
creation, `evidenceURI`/`evidenceHash` at submission). No IPFS dependency for
V1; the app stores human-readable metadata in browser localStorage and every
cached value is re-derivable from chain events (the vault stores the URIs
onchain, so even localStorage loss loses only titles).

## Additional engineering decisions

### ED-1: Permissions model
- `fundMilestone` — client only.
- `acknowledgeStart` — contractor only.
- `submitWork` — contractor only.
- `approveAndRelease`, `requestRevision`, `dispute` — client only.
- `claimAfterReview` — **permissionless** after review deadline (funds always
  go to the contractor; triggering costs the caller gas only).
- `refundExpired` — client only, after submission deadline without a live
  submission window.
- `proposeMutualCancel` — either party; executes when both have proposed.

### ED-2: Transfer pattern
Checks-effects-interactions + a minimal built-in reentrancy guard on all
value-moving functions. Direct push transfers (no pull-payment escrow): one
transaction per settlement, explorer-legible. Known limitation: transfers to a
blocklisted address revert (Arc sanctions behavior); no transfer mechanism can
move funds to a blocklisted recipient, so this is a documented, irreducible
limitation, not a trapped-fund bug.

### ED-3: No dependencies in contracts
No OpenZeppelin, no upgradeable proxies, no constructor-owned admin. Minimal
local `IERC20` + reentrancy guard. Supply-chain risk ≈ 0; full source fits one
screen per contract.

### AD-ED-4: Offchain stack
Serverless V1: Next.js static-exportable app; milestone registry per wallet in
localStorage; all money state read from the chain by vault address. No
database. Rationale: the database in the master doc is optional UX sugar; for
the microgrant proof, localStorage + onchain reads satisfy every MUST item
while removing an entire infrastructure class.

### ED-5: Wallet connection
wagmi + viem with the **injected connector** only (MetaMask / Rabby / Coinbase
Wallet / any EIP-1193 wallet). No WalletConnect project ID dependency for the
demo; app forces chain 5042 and offers wallet_addEthereumChain when missing.

## Phase 1–2 resolutions (contract implementation, 17 September 2026)

Status: `MilestoneVault` + `MilestoneVaultFactory` implemented in
`packages/contracts/src`. 74 tests pass (unit + security + 3 invariants);
coverage: vault 99% lines / 97% branches / 100% functions, factory 100%.

### ED-6: Revision restarts the resubmission window
`requestRevision()` (allowed only while `Submitted` and strictly before the
review deadline) sets `submitDeadline = now + submissionPeriod` and clears
`reviewDeadline`. The contractor gets a fresh bounded window; the client
regains `refundExpired()` if it lapses. `submitWork()` from
`RevisionRequested` restarts the review clock (`reviewDeadline = now +
reviewPeriod`). Revisions are uncapped in V1; mutual cancel remains the
always-available joint exit from `RevisionRequested`.

### ED-7: Non-empty scope and evidence enforced onchain
Creation requires `scopeHash != 0` and non-empty `metadataURI`. Submission
requires `evidenceHash != 0` and non-empty `evidenceURI`. Rationale: an
onchain milestone without a verifiable scope reference undermines D-008.

### ED-8: Terminal states and refund reasons
Terminal states: `Settled` (client approval), `SettledByTimeout`
(permissionless `claimAfterReview`), `RefundedExpired`,
`CancelledMutual`. Both refund paths emit `MilestoneRefunded(RefundReason)`
(`Expired` / `MutualCancel`). Dispute exits are exactly: client
`approveAndRelease()`, or bilateral mutual cancel (AD-7).

### ED-9: Storage shape
Solidity immutables do not support strings, so `metadataURI` is a public
storage string written once in the constructor; `evidenceURI` is storage
written per submission. Periods are `uint64` immutables; timestamps stored as
`uint64` seconds (overflow-safe until year 2154). The single
`getMilestone()` view was split into `getConfig()` + `getStatus()` to avoid
stack-too-deep; the frontend batches both via Multicall3.

### ED-10: Reentrancy guard is defense-in-depth
Checks-effects-interactions means every state check rejects any re-entry
before the `locked` flag is ever consulted, so the `ReentrantCall` branch is
unreachable through public flows (and is the only uncovered branch). The
guard is kept as cheap insurance. Verified: `TokenTransferFailed` is
revert-safe and state-clean on all five value-moving paths (funded transfer
rollback included).

## Phase 3 resolutions (web MVP, 17 September 2026)

Status: `apps/web` — Next.js 15 App Router + TypeScript + Tailwind, wagmi +
viem (injected connector only). `next build` produces a static export of 7
routes; landing/create/milestones smoke-tested at 200 with expected content.

### ED-11: Self-contained onchain metadata (no hosting dependency)
`metadataURI` is a `data:application/json;base64,…` URI containing
`{version, title, scope, createdAt}`; `scopeHash = keccak256(scope text)`.
Evidence is the deliverable URL itself with `evidenceHash = keccak256(URL)`.
Rationale: removes IPFS/HTTP hosting from the critical path — the full
human-readable scope and evidence reference travel inside the chain record,
and anyone can recompute both hashes to verify them (the UI shows a
"hash verified" indicator when they match). No file is ever stored by us.

### ED-12: Static-export routing and registry scope
Milestone detail is `/milestone?address=0x…` (query parameter) rather than a
dynamic path segment, so `output: 'export'` works with zero server
(AD-ED-4). The per-browser localStorage registry only stores convenience
fields (title, scope text, amount display, role hints); every money-relevant
field (`getConfig`/`getStatus`) is read from the chain, so a recipient opening
the shared link on a fresh browser sees a fully valid milestone. Registry loss
loses titles only.

### ED-13: Network handling and transaction UX
The app targets exactly one configured chain (`NEXT_PUBLIC_CHAIN`, default Arc
mainnet `5042`) while keeping mainnet/testnet/local in the wagmi config, so
`switchChain` can also `wallet_addEthereumChain` for wallets that lack Arc. A
wrong-network banner blocks the flow until the chain matches. Every write goes
through one `useTx` hook: wallet send → receipt wait → invalidate queries, with
"rejected in wallet" and revert messages surfaced inline. The created-vs-funded
distinction from P1 is enforced visually (UNFUNDED vs FUNDED banner plus an
explicit "do not start work" card shown to the contractor pre-funding).
