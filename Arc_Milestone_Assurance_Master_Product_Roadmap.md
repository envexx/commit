# Arc Milestone Assurance

## Master Product, Business, Research & Engineering Roadmap

**Version 1.0 — 17 September 2026**

> Status: Product decision frozen for V1. Engineering may refine implementation details but must not silently alter product rules.


# 0. Document Purpose

This document is the single source of truth for turning a verified real-world problem into a working Arc mainnet product. It is intentionally written for four audiences at once: founder/product owner, business strategist, product designer, and AI/software engineer.

The document begins with the problem and evidence, makes an explicit business decision, defines the product thesis and boundaries, then translates that decision into system behavior, architecture, implementation tasks, tests, deployment, demonstration, and a multi-stage roadmap.

V1 is deliberately narrow. It solves one problem: a contractor should not have to begin fixed-price work based only on a promise that payment will arrive later, while a client should not have to pay a contractor before an agreed deliverable is submitted. The product creates a pre-funded, rules-based milestone payment commitment using USDC on Arc.

The long-term ambition is larger: a reusable conditional-payment primitive for human-to-human, business-to-agency, human-to-agent, and agent-to-agent work. However, no future feature is allowed to weaken V1 focus or delay a live Arc mainnet deployment.


# 1. Executive Decision

BUSINESS DECISION

We will build a lightweight pre-funded milestone payment layer for project-based digital work. A client commits USDC to an onchain milestone before work begins. The contractor can verify that the funds exist. After the contractor submits the agreed deliverable, the client can approve the work and release funds. If the client is inactive, an agreed review window can lead to an automatic release. If there is an active disagreement, funds remain governed by explicit settlement rules rather than disappearing into an unfunded invoice.

The problem is NOT “crypto payments are slow.” The problem is NOT “freelancers need another marketplace.” The problem is the trust gap between agreement and payment.

Core product promise:
- Contractor: “Do not start work until the money exists.”
- Client: “Do not release money until the agreed work is submitted.”

Product thesis:
Agreement -> Funded Commitment -> Work -> Evidence -> Acceptance -> Settlement

Why Arc:
Arc combines native USDC gas, predictable stablecoin-denominated costs, sub-second finality, EVM compatibility, and Circle interoperability. Arc’s own September 2026 builder request explicitly highlights programmable money and outcome-based payments in which USDC is released when work is verified. That makes conditional settlement a native product thesis rather than an arbitrary chain choice.

V1 outcome:
A public, open-source web app and smart contract deployed to Arc mainnet that lets two parties create, fund, submit, approve, and settle a milestone with verifiable transaction history.


# 2. Program Context: Arc Microgrants

Arc Microgrants is a build-first program. The project must already be deployed and working on Arc mainnet before submission. The program offers twenty 500 USDC microgrants from a 10,000 USDC pool and closes on October 14, 2026 at 23:59 ET. Reviews are rolling.

The submission requires:
- A live Arc mainnet deployment.
- A public repository.
- A short explanation of what the product does and what Arc is used for.
- A public builder profile (GitHub, X, or Farcaster).

The stated evaluation criteria are relevance to Arc, technical credibility, quality, and whether the project is worth taking further. Traction is not required; a credible proof matters more.

Implication for us:
The submission should not be optimized for deck quality. It should be optimized for proof. The most important artifact is a working end-to-end mainnet transaction that demonstrates a problem, an explicit rule, and settlement in USDC.


# 3. Problem Research: What Is Actually Broken?

3.1 Macro evidence

QuickBooks’ 2026 Small Business Late Payments Report found that 59% of surveyed small businesses had invoices more than 30 days overdue, up from 47% the prior year. Businesses with unpaid invoices were owed an average of $17.7K, and 49% reported that normal payment-processing times created moderate or critical cash-flow gaps. This indicates that the problem is not merely payment UX; businesses routinely operate after work has been performed but before cash is actually available.

3.2 Community evidence

Recent Reddit threads show a repeated behavioral pattern:
- Contractors perform work for an unfunded or inactive milestone.
- The client later disappears, delays, changes scope, or challenges the result.
- The contractor discovers that no payment protection exists because money was never committed before the work began.
- Experienced users repeatedly advise “do not work on an unfunded milestone.”

One March 2026 Upwork thread shows a new freelancer who completed work after only the first portion had been funded. The community response was simple: an unfunded milestone does not represent protected payment. Another thread from March 2026 was explicitly titled around working only with funded milestones after a contractor performed an unpaid design assessment. A September 2026 thread describes a one-week, $100 milestone stretching to two months, with additional work and review leverage layered on top.

3.3 Existing-product evidence

Upwork’s own fixed-price payment-protection documentation instructs freelancers to confirm that a milestone is marked Funded before beginning work. Upwork Direct Contracts similarly requires a client to fund a fixed-price milestone before the contract begins and withholds release until submitted work can be reviewed. This is important because it proves the market already understands the value of payment assurance.

Upwork Direct Contracts currently markets this value explicitly: scope and milestone terms, client funding before work, delivery, release, and dispute handling. Its public pricing states a 5% fee. The commercial existence of this product validates willingness to pay for assurance, not only for money transfer.

3.4 Root-cause conclusion

“Late invoice” is a downstream symptom. The more fundamental problem is unsecured work commitment: work begins before payment capacity and release conditions are verifiably committed.

A traditional invoice says: “You owe me.”
A funded milestone says: “The money already exists and the release rules are known.”

The product should move trust from a promise after delivery to a verifiable commitment before delivery.


# 4. Problem Definition & Jobs To Be Done

Primary problem statement:
Independent contractors and small agencies doing fixed-price digital work for clients they source themselves often begin work before payment is secured. They need a lightweight way to prove that milestone funds exist before starting, without forcing both sides into a full freelance marketplace.

Primary Job To Be Done (Contractor):
“When I accept a fixed-price project from a client, I want to verify that the payment for the next milestone is already committed under clear rules, so I can begin work without taking unsecured credit risk.”

Primary Job To Be Done (Client):
“When I hire a remote contractor, I want to reserve the agreed payment without releasing it immediately, so the contractor knows I am funded while I still retain a clear review step before settlement.”

Secondary jobs:
- Establish one canonical milestone amount and scope reference.
- Create an auditable record of funding, submission, approval, and release.
- Reduce repeated payment-chasing conversations.
- Make inactivity rules explicit before the project begins.
- Make a transaction legible even when the parties met outside the platform.

Emotional jobs:
- Contractor: remove anxiety that a “serious-looking” client may still fail to pay.
- Client: demonstrate credibility without sending an irreversible prepayment.
- Both: avoid negotiating payment mechanics after conflict has already begun.


# 5. Initial ICP and Market Boundary

V1 Ideal Customer Profile (ICP):
Small digital agencies and independent contractors who source clients directly and sell fixed-price, milestone-based digital work.

Good initial categories:
- Full-stack and Web3 developers.
- AI automation consultants.
- Designers and product studios.
- Video editors and creative studios.
- Marketing/SEO agencies.
- Technical freelancers who work cross-border.

Qualifying characteristics:
- Digital deliverable can be referenced by URL, repository, file hash, document, or proof URI.
- Project has a clear milestone price.
- Typical milestone value is large enough for non-payment risk to matter.
- Parties can use USDC or are willing to for a protected milestone.
- Client and contractor may have met outside a marketplace.

Not V1:
- Hourly time tracking.
- Physical goods delivery.
- Consumer ecommerce.
- Payroll compliance.
- Fiat custody.
- Marketplace discovery.
- Complex enterprise procurement.
- Anonymous high-risk transactions.

Beachhead positioning:
“Payment assurance for contractors who already have a client.”

This avoids competing with Upwork’s talent marketplace. We do not find work; we protect the payment commitment around work that already exists.


# 6. Why This Problem Wins the Decision

Decision criteria used:
1. Pain is repeatedly visible in real conversations.
2. Money is directly attached to the pain.
3. Existing commercial products prove people pay for mitigation.
4. The product can demonstrate value with one end-to-end transaction.
5. Arc is functionally relevant to the solution.
6. V1 can be small enough for a microgrant timeline.
7. The primitive can expand into larger markets.

Rejected direction: generic cross-border USDC transfer.
Reason: moving USDC is increasingly commoditized by payroll, contractor, wallet, and payments providers. A transfer tool does not create a strong enough business wedge.

Rejected direction: freelancer marketplace.
Reason: discovery, reputation, matching, disputes, and liquidity create a multi-sided cold-start problem far beyond the microgrant scope.

Rejected direction: AI agent wallet only.
Reason: wallets for agents are becoming infrastructure. The differentiated problem is not possession of a wallet but enforceable commercial rules around when an agent is allowed to earn or spend.

Selected direction: pre-funded conditional milestone.
Reason: it converts a concrete existing pain into a small primitive with clear economic meaning.


# 7. Product Thesis, Positioning & Narrative

Working product name: Arc Milestone Assurance (placeholder; rename later).

Category:
Conditional payment / funded milestone infrastructure.

Positioning statement:
For independent contractors and small agencies that already have clients, Arc Milestone Assurance is a lightweight funded-milestone layer that proves the money exists before work begins and releases USDC according to agreed completion rules. Unlike a marketplace, it does not own the client relationship or require talent discovery.

One-line narrative:
Never start unfunded work again.

Two-sided value:
Contractor: “Know the money exists before you start.”
Client: “Commit the money without paying before delivery.”

Arc-native narrative:
Stablecoins solved how digital dollars move. This product demonstrates what a digital dollar can do when it carries a condition: remain committed until a work milestone is submitted and accepted.

Long-term primitive:
Commit value -> Define outcome -> Produce proof -> Verify -> Settle.

The long-term product is not “freelancer escrow.” It is a reusable economic coordination layer for outcome-based work.


# 8. Product Principles

P1 — Fund first, work second.
The UI must make “Funded” an explicit state, not a hidden contract detail.

P2 — Rules before conflict.
Amount, parties, review window, expiry, and settlement path must be fixed before funding.

P3 — Onchain truth, offchain convenience.
Money state and critical authorization live onchain. Descriptions, metadata, previews, notifications, and analytics may live offchain.

P4 — Minimal custody assumptions.
V1 should use a smart-contract vault controlled by encoded rules rather than a platform-controlled omnibus wallet.

P5 — No blockchain theatre.
Every onchain transaction must correspond to something economically meaningful: funding, submission commitment, approval, release, refund, or settlement.

P6 — Clear failure states.
The product must show what happens if a client disappears, contractor never submits, or parties disagree.

P7 — Small V1, extensible protocol.
Do not implement future complexity now, but design state and interfaces so verifiers, arbiters, agent wallets, and cross-chain funding can later be attached.


# 9. V1 Scope: One Problem, One Complete Loop

V1 MUST support:
1. Connect wallet.
2. Create a milestone with contractor, amount, scope reference, review period, and deadline.
3. Fund the milestone in USDC on Arc.
4. Display an unambiguous FUNDED state with transaction proof.
5. Contractor acknowledges/start state and later submits completion evidence metadata.
6. Client approves and releases the USDC.
7. If client is inactive after valid submission, contractor may claim after the pre-agreed review window.
8. If work is not submitted before an agreed deadline, the client may reclaim funds according to the configured rule.
9. Persist an activity timeline for each milestone.
10. Show Arc explorer links for economically important events.

V1 SHOULD support:
- Client requests revision before the review timer expires.
- Contractor can resubmit updated evidence.
- Both parties can mutually cancel before work submission.
- Optional platform fee set to zero or a clearly disclosed minimal fee during the microgrant demo.

V1 MUST NOT attempt:
- Marketplace discovery.
- General arbitration court.
- Automated AI quality judgment.
- KYC productization.
- Credit/lending.
- Fiat on/off-ramp.
- Cross-chain funding UX.
- Multisig organizations.
- Recurring subscriptions.
- Hourly tracking.


# 10. Core User Flows

10.1 Happy path
Client connects wallet -> creates milestone -> signs/funds USDC -> contractor opens shared link -> verifies FUNDED -> performs work -> submits evidence URI/hash -> client reviews -> client approves -> vault releases USDC to contractor -> both see SETTLED + explorer transaction.

10.2 Client inactivity
Contractor submits evidence -> review timer begins -> client takes no action -> timer expires -> contractor calls claimAfterReview -> contract releases USDC -> milestone becomes SETTLED_BY_TIMEOUT.

10.3 Contractor inactivity
Client funds -> contractor never submits -> submission deadline expires -> client calls refundExpired -> USDC returns to client -> milestone becomes REFUNDED_EXPIRED.

10.4 Revision path
Contractor submits -> client requests revision with reason reference -> state returns to ACTIVE/REVISION_REQUESTED without moving money -> contractor submits a new proof -> review timer restarts.

10.5 Mutual cancellation
Before a valid submission, both parties sign/approve cancellation -> funds return to client -> record remains immutable as CANCELLED_MUTUAL.

10.6 Disagreement in V1
If the client explicitly disputes the submitted work, funds should NOT silently release. V1 can enter DISPUTED and offer mutual settlement (release all, refund all, or agreed split if implemented). Full third-party arbitration is a later layer. The product must communicate this limitation clearly.


# 11. V1 State Machine

Recommended states:

CREATED
  -> FUNDED
  -> ACTIVE (optional contractor acknowledgement)
  -> SUBMITTED
       -> APPROVED -> SETTLED
       -> REVIEW_EXPIRED -> SETTLED_BY_TIMEOUT
       -> REVISION_REQUESTED -> ACTIVE/SUBMITTED
       -> DISPUTED -> MUTUAL_SETTLEMENT / future arbiter
  -> EXPIRED -> REFUNDED
  -> CANCELLED_MUTUAL -> REFUNDED

Important invariants:
- A milestone cannot be “Funded” unless the vault holds the exact committed amount.
- Amount and payee cannot change after funding.
- Client approval can release funds only to the configured contractor.
- Timeout release can happen only after a valid submission and the review deadline.
- Refund can happen only under explicit pre-agreed conditions.
- Settled/refunded milestones are terminal.
- No administrative function may arbitrarily seize funds.


# 12. Smart Contract Design

V1 recommendation: keep contracts intentionally small.

Option A (recommended for microgrant): MilestoneVaultFactory + one MilestoneVault per agreement.
Benefits: strong isolation, easy explorer legibility, simpler accounting, clearer demo.
Cost: more deployment gas per milestone.

Option B: one registry/vault contract with milestone IDs.
Benefits: cheaper creation and easier indexing.
Cost: more complex state and larger blast radius.

For V1, choose the architecture that can be audited and shipped fastest. If factory clones are implemented correctly, minimal proxies can reduce deployment cost; otherwise, a single registry contract is acceptable.

Suggested Milestone structure:
- client: address
- contractor: address
- token: USDC address / native-USDC handling as applicable to Arc implementation
- amount: uint256
- scopeHash: bytes32
- metadataURI: string or event-referenced URI
- createdAt
- fundedAt
- submissionDeadline
- reviewPeriod
- submittedAt
- evidenceHash / evidenceURI
- state
- revisionCount

Critical functions:
- createMilestone(...)
- fundMilestone(...)
- acknowledgeStart(...) [optional]
- submitWork(evidenceHash, evidenceURI)
- approveAndRelease()
- requestRevision(reasonHash)
- claimAfterReview()
- refundExpired()
- proposeMutualCancel()/acceptMutualCancel()
- proposeSettlement(...)/acceptSettlement(...) [only if split settlement is in V1]

Events:
MilestoneCreated
MilestoneFunded
WorkSubmitted
RevisionRequested
MilestoneApproved
PaymentReleased
TimeoutReleased
MilestoneRefunded
MilestoneDisputed
MutualSettlementExecuted

Security design:
- Checks-effects-interactions.
- Reentrancy protection if token transfer path can re-enter.
- Exact authorization per role.
- Safe ERC-20 transfer handling if USDC is represented as ERC-20 for contract interactions.
- No upgradeability in V1 unless absolutely necessary.
- No owner backdoor over user funds.
- Explicit immutable parameters after funding.
- Pausing, if included, must not permanently trap funds; define safe exit semantics.


# 13. Offchain Application Architecture

Recommended stack aligned with fast shipping:

Frontend:
- Next.js (App Router) + TypeScript.
- Tailwind CSS.
- wagmi + viem for EVM wallet/contract interaction.
- Wallet connector supported by Arc ecosystem.

Backend/API:
V1 can be server-light. Use Next.js route handlers/server actions for metadata and notification operations. Onchain state remains authoritative.

Database:
PostgreSQL (for example Neon/Supabase) only for data that improves UX:
- human-readable project title
- scope description
- evidence metadata
- indexed events/cache
- email/notification preferences
- analytics

Do NOT treat the database as the source of truth for money state.

Storage:
Evidence can be represented by a hash plus URL/URI. Do not store large files onchain. For V1, a normal HTTPS URL plus cryptographic hash is sufficient for a demo if clearly documented. IPFS/Arweave can be added later.

Indexer:
Start with direct RPC reads + event polling. Add a dedicated indexer only if necessary.

Notifications:
Optional V1 email/web notification for “milestone funded,” “work submitted,” and “review window ending.” Notification failure must never affect contract state.


# 14. Data Model

Offchain tables (suggested):

users
- id
- wallet_address
- display_name
- email_optional
- created_at

milestones
- id (internal UUID)
- chain_id
- contract_address or onchain_milestone_id
- client_wallet
- contractor_wallet
- title
- scope_text
- scope_hash
- amount_display
- state_cached
- submission_deadline
- review_period_seconds
- created_at
- last_synced_block

submissions
- id
- milestone_id
- version
- evidence_uri
- evidence_hash
- note
- submitted_tx_hash
- created_at

activity_events
- id
- milestone_id
- event_type
- tx_hash
- block_number
- actor
- timestamp
- payload_json

notifications
- id
- milestone_id
- recipient
- type
- status
- sent_at

Rule: any cached state must be re-derivable from chain events.


# 15. UX / UI Specification

The core design goal is confidence, not crypto complexity.

Landing page:
- Headline: Never start unfunded work again.
- Subhead: Create a funded USDC milestone. Work starts when funds are verified. Payment releases when the agreed work is accepted.
- CTA: Create Milestone.
- Secondary CTA: View Demo.

Create Milestone screen:
- Client wallet (auto).
- Contractor wallet.
- Milestone title.
- Scope / success criteria.
- Amount in USDC.
- Submission deadline.
- Review window (e.g. 3/7/14 days).
- Explain exactly what happens if either side is inactive.
- Review screen before signing.

Milestone detail page:
Top status banner must be dominant:
UNFUNDED / FUNDED / WORK SUBMITTED / REVIEW / SETTLED / REFUNDED / DISPUTED.

Show:
- amount
- client
- contractor
- scope hash / scope text
- countdowns
- evidence
- action button relevant to actor
- transaction timeline
- Arc explorer links

Critical UX rule:
The contractor must never be able to confuse “milestone created” with “milestone funded.” Use visually and semantically different states.


# 16. Trust, Disputes & What V1 Does Not Promise

V1 guarantees:
- The committed amount can be proven onchain.
- The parties and milestone parameters can be proven.
- Release/refund follows contract rules.
- A valid submission can start a deterministic review window.

V1 does NOT guarantee:
- The work is objectively “good.”
- The client’s scope is fair.
- A dispute can always be resolved without human judgment.
- The parties comply with every jurisdiction’s legal requirements.

This distinction is crucial. V1 solves funding assurance and deterministic settlement paths, not universal truth.

Dispute roadmap:
V1: explicit DISPUTED state + mutual settlement.
V1.5: optional named arbiter address agreed before funding.
V2: pluggable verifier/arbiter interface.
V3: domain-specific verification adapters (GitHub PR merged, deployment URL passes tests, signed acceptance, oracle event, AI reviewer plus human appeal).
V4: verifier marketplace / bonded arbiters / reputation.

Do not let dispute sophistication delay the V1 proof.


# 17. Legal & Compliance Boundary

This is a product-design boundary, not legal advice.

Do not market V1 as a licensed escrow service unless appropriate legal counsel confirms that classification and required licensing. Use descriptive product language such as “pre-funded milestone,” “conditional payment,” or “non-custodial milestone vault.”

Why caution is required:
Traditional platforms may use licensed or regulated escrow entities and detailed payment agreements. Upwork’s legal documentation, for example, specifies escrow entities and contractual release conditions. A smart contract does not automatically eliminate financial-services, consumer-protection, sanctions, AML, tax, or dispute-law questions.

V1 risk reduction:
- No fiat custody.
- No platform omnibus balance.
- No promise that the platform legally arbitrates disputes.
- No yield on locked funds.
- No lending.
- No rehypothecation.
- No hidden admin withdrawal.
- Use user-controlled wallets.
- Provide risk disclosure.

Before public commercial launch beyond prototype stage, obtain jurisdiction-specific legal review.


# 18. Business Model Hypothesis

V1 microgrant phase:
Set product fee to 0% or near-zero. The purpose is proof and learning, not revenue optimization.

Post-validation models to test:
A. Settlement fee: 0.5%–1.0% per released milestone.
B. SaaS plan for agencies: monthly fee + lower transaction fee.
C. API fee for platforms embedding funded milestones.
D. Enterprise/API plan for procurement and agent workflows.

Benchmark context:
Upwork Direct Contracts publicly advertises a 5% freelancer fee, which indicates meaningful willingness to pay for structured contract/payment protection. Our product should not assume it deserves a similar fee; the comparison is market validation, not a pricing recommendation.

Potential wedge:
Be materially cheaper and narrower than a marketplace because we do not provide customer acquisition, talent discovery, or broad managed arbitration.

North-star business metric after V1:
Funded milestone volume that reaches a terminal state without off-platform payment chasing.


# 19. Product Metrics

V0 technical proof metrics:
- Contract deploys successfully to Arc mainnet.
- At least 5 end-to-end mainnet milestone cycles performed by builder/test users.
- Zero trapped-fund failures in tested paths.
- All state transitions covered by automated tests.

V1 product metrics:
Activation: % of created milestones that become funded.
Safety: % of contractors who start only after FUNDED state.
Completion: % of funded milestones reaching SETTLED or REFUNDED terminal state.
Time-to-fund: creation -> funded.
Time-to-settle: submission -> settlement.
Dispute rate: funded milestones entering DISPUTED.
Timeout rate: releases via inactivity timer.
Repeat usage: users creating second milestone.

Learning metrics:
- Why clients refuse to pre-fund.
- Why contractors choose not to use it.
- Which review window is considered fair.
- Whether users value assurance enough to pay 0.5% / 1% / fixed fee.

Do not use vanity metrics such as page views as proof of product value.


# 20. Security Threat Model

Assets at risk:
- Locked USDC.
- Authorization rights.
- Submission evidence integrity.
- User wallet signatures.

Threats:
1. Reentrancy/token callback behavior.
2. Unauthorized release/refund.
3. Timestamp boundary bugs.
4. Incorrect decimal/amount handling.
5. Frontend spoofing of funded state.
6. Database/chain state divergence.
7. Malicious evidence URI replacement.
8. Admin key abuse.
9. Replay/signature misuse if offchain signatures are introduced.
10. Phishing through shared milestone links.

Mitigations:
- Minimal immutable contracts.
- Strong unit + fuzz tests for state transitions.
- Onchain reads for balance and state before displaying FUNDED.
- Hash evidence metadata.
- Never request raw private keys.
- Clearly show wallet and chain before signing.
- Do not introduce meta-transactions/account abstraction until needed.
- Deploy contracts with verified source code.
- Run static analysis (Slither where compatible) and Foundry fuzz/invariant tests.

Security release gate:
No mainnet deployment until all value-moving branches have tests, terminal-state invariants pass, and there is a documented emergency/recovery behavior.


# 21. Testing Strategy

Smart contract tests:
- create valid milestone
- reject zero amount
- reject same client/contractor if policy disallows
- fund exact amount
- cannot double fund
- cannot alter parties/amount after funding
- only contractor can submit
- cannot submit after terminal state
- only client can approve before timeout
- release transfers exact amount
- cannot release twice
- timeout claim fails before expiry
- timeout claim succeeds after review period
- client refund fails before submission deadline
- refund succeeds after contractor inactivity rule
- revision resets/restarts review correctly
- cancellation requires required consent
- dispute blocks unsafe automatic path (if V1 rule specifies)

Fuzz/invariants:
- contract balance equals sum of unresolved commitments (for pooled architecture)
- terminal milestone cannot return to active state
- total released + refunded never exceeds funded amount
- unauthorized address never receives milestone funds

Frontend E2E:
- wallet connect
- wrong-chain handling
- create -> fund -> submit -> approve
- submit -> timeout claim using time-controlled local test
- expired -> refund
- explorer links
- state refresh after transaction

Mainnet smoke test:
Use a very small USDC amount and execute every supported terminal path with builder-controlled wallets before public submission.


# 22. Engineering Repository Structure

Suggested monorepo:

/apps/web
  /app
  /components
  /features/milestones
  /lib/chain
  /lib/contracts
  /lib/db

/packages/contracts
  /src or /contracts
  /test
  /script

/packages/shared
  /types
  /schemas
  /constants

/docs
  PRODUCT_MASTER.md
  ARCHITECTURE.md
  SECURITY.md
  DEPLOYMENT.md
  DEMO.md
  DECISIONS.md

Recommended tooling:
- pnpm workspace or Turborepo only if it does not slow delivery.
- Foundry for Solidity testing/deployment.
- TypeScript strict mode.
- Zod for API/input validation.
- ESLint + Prettier.
- Vitest for application logic.
- Playwright for critical UI flows if time permits.

Rule: avoid introducing infrastructure merely because it is “production-like.” Every dependency must support the current product proof.


# 23. Engineering Implementation Roadmap

PHASE 0 — Validation freeze (Day 0)
Deliverables:
- Freeze V1 scope.
- Confirm current Arc mainnet RPC, chain ID, explorer, USDC behavior/address, wallet support, and deployment instructions from official Arc documentation.
- Record these in docs/ARC_MAINNET.md.
- Decide pooled contract vs per-milestone vault.
Exit criterion: no unresolved dependency that can invalidate deployment.

PHASE 1 — Contract specification (Day 1)
Deliverables:
- State machine written as tests before full implementation.
- Solidity interfaces/events/errors.
- Threat model.
- Foundry scaffold.
Exit criterion: every state transition has an expected caller, precondition, effect, and failure case.

PHASE 2 — Contract implementation (Days 1–2)
Deliverables:
- Create/fund/submit/approve/release.
- Timeout claim.
- Inactivity refund.
- Mutual cancel/revision if included.
- Events.
- Unit tests and fuzz/invariant tests.
Exit criterion: 100% of value-moving branches tested; no known trapped-fund path.

PHASE 3 — Web MVP (Days 2–4)
Deliverables:
- Wallet connection.
- Create milestone form.
- Fund transaction.
- Detail/status page.
- Contractor submission.
- Client approval.
- Activity timeline.
- Explorer links.
Exit criterion: two browser sessions/wallets can finish happy path on local/test environment.

PHASE 4 — UX hardening (Days 4–5)
Deliverables:
- Wrong-network handling.
- Transaction pending/success/error states.
- Strong FUNDED vs UNFUNDED distinction.
- Deadline/review countdown.
- Empty/error/loading states.
- Mobile usable layout.
Exit criterion: non-developer can complete flow from a shared link without CLI.

PHASE 5 — Arc mainnet deployment (Day 5)
Deliverables:
- Deploy verified contract.
- Record deployment address, commit hash, constructor/config, deployer, and explorer link.
- Run micro-USDC smoke test.
Exit criterion: live mainnet happy path succeeds.

PHASE 6 — Failure-path mainnet validation (Day 6+)
Deliverables:
- Small-value inactivity/timeout test.
- Refund path test where safely feasible.
- Screenshots / tx hashes / evidence log.
Exit criterion: demo evidence covers more than the happy path.

PHASE 7 — Submission packaging
Deliverables:
- Public repo cleaned.
- README: problem -> product -> Arc -> live demo.
- 60–120 second demo video optional but recommended.
- DEMO_EVIDENCE.md with tx links.
- Security limitations.
- Microgrant submission copy.
Exit criterion: reviewer can understand and verify the project in under five minutes.


# 24. AI Engineer Execution Contract

The AI engineer should treat this document as product authority, not as a suggestion list.

Priority order:
1. Safety of user funds.
2. End-to-end working state machine.
3. Arc mainnet proof.
4. Clear UX.
5. Code elegance.
6. Future extensibility.

Required working style:
- Never add a feature that is outside V1 without documenting why it is required.
- Never change a business rule silently; update DECISIONS.md.
- Run tests after every contract state-machine change.
- Keep deployment reproducible.
- Commit small, reviewable changes.
- Record mainnet addresses and transaction evidence.
- Use official Arc/Circle documentation for current network parameters; do not hard-code guessed values from this document.
- Treat onchain state as source of truth.

Definition of done for any feature:
- behavior implemented
- tests implemented
- failure states handled
- UI copy clear
- documentation updated
- no unresolved security TODO on value path

Stop/kill conditions:
- Mainnet USDC interaction cannot safely support the intended vault behavior.
- A contract path can trap user funds with no deterministic resolution.
- The application requires centralized custody to make the core flow work.
- The MVP expands into marketplace/dispute complexity before core milestone settlement is live.


# 25. Demo Storyboard

Demo actors:
- Client wallet A.
- Contractor wallet B.
- A simple digital deliverable, e.g. landing-page implementation.

Demo narrative:
1. “A contractor usually receives a promise to pay later. Here the client creates a $X USDC milestone before work begins.”
2. Client creates milestone with scope and review period.
3. Client funds it.
4. Contractor opens the link and sees FUNDED with onchain proof.
5. Contractor submits deliverable evidence.
6. Client approves.
7. USDC moves to contractor.
8. Show Arc explorer transaction and final timeline.

Optional second proof:
Show a pre-recorded/previous mainnet transaction in which the review timer expired and contractor used the deterministic timeout path.

The demo should explain the problem in <20 seconds and spend the rest proving the state transitions.


# 26. Microgrant Submission Narrative

Recommended structure:

Problem:
Independent contractors frequently begin milestone work before payment is actually secured. An invoice is only a claim after work has been done; it does not prove the money exists.

Solution:
A pre-funded milestone vault on Arc. Clients commit USDC before work starts. Contractors can verify funding onchain. After evidence is submitted, funds are released by client approval or by pre-agreed timeout logic.

Why Arc:
Arc turns USDC from a transfer asset into programmable money. Native USDC gas, fast finality, and an ecosystem explicitly focused on outcome-based commerce make Arc an appropriate settlement layer.

Proof:
Live Arc mainnet app + verified contract + public repo + transaction evidence.

What comes next:
Pluggable verification and settlement can extend the same primitive from human freelance work into agencies, procurement, and agent commerce.


# 27. Roadmap Beyond V1

V1 — Human-to-Human Funded Milestones
Target: contractor + client.
Primitive: pre-fund -> submit -> approve/timeout -> settle.
Success proof: real Arc mainnet settlement.

V1.5 — Better Dispute & Team Operations
- Optional agreed arbiter.
- Split settlement.
- Multiple sequential milestones.
- Agency workspace.
- Email/Telegram notifications.
- PDF/URL scope snapshots and stronger evidence hashing.

V2 — Embedded Payment Assurance API
Target: agencies, platforms, vertical SaaS.
- API/SDK to create funded milestones.
- Webhooks.
- Hosted payment-assurance page.
- Organization policies.
- Fee routing.
- Accounting/export integrations.

V2.5 — Cross-Chain Funding
Target: clients who hold USDC elsewhere.
- Circle CCTP/Gateway/App Kit flow.
- Client funds from supported chain, settlement lands on Arc.
- Preserve one canonical milestone state on Arc.

V3 — Outcome Verification Layer
- Verifier interface.
- GitHub merge verifier.
- URL/deployment health verifier.
- Signed acceptance verifier.
- Oracle/event verifier.
- AI evaluator as advisory/verifier with explicit confidence and appeal path.

V4 — Human <-> Agent Commerce
A person creates an outcome and funds USDC. An agent accepts, performs a task, submits machine-verifiable evidence, and is paid on completion.

V5 — Agent <-> Agent / Autonomous Business
Agent treasury creates funded jobs for other agents/services. Policy-controlled wallets can commit bounded budgets. Verifiers decide whether outcomes satisfy the contract. Arc settles machine commerce.

The invariant across every version:
Commit -> Perform -> Prove -> Verify -> Settle.


# 28. Protocol Extension Architecture

Design future interfaces now conceptually, but do not implement them unless V1 needs them.

IVerifier
- verify(milestone, evidence) -> result
Use cases: GitHub event, API response, signed client acceptance, oracle data, machine test.

IArbiter
- resolve(milestone, evidenceBundle) -> release/refund/split
Use cases: professional dispute provider, DAO, trusted neutral.

IFundingAdapter
- fund from another chain / wallet method -> canonical Arc milestone funding.
Use cases: CCTP/Gateway.

IFeePolicy
- calculate platform/referral/API fees.

IPolicyModule
- spending limits and actor permissions for agent/organization wallets.

The core Milestone primitive should not know the details of every future verifier. It should consume a constrained interface or signed decision so the protocol can evolve without turning the base contract into a monolith.


# 29. Key Product Risks & Countermeasures

Risk 1: Clients do not want to lock funds.
Countermeasure: target buyers already accustomed to deposits/milestones; quantify that the funds remain conditional rather than prepaid.

Risk 2: Contractors still negotiate vague scope.
Countermeasure: require success criteria/scope hash before funding; product cannot fix bad scope but can make it explicit.

Risk 3: Disputes make “automatic” settlement unsafe.
Countermeasure: auto-release only after a defined review window and explicit submission; allow dispute state; do not pretend V1 resolves subjective quality.

Risk 4: Crypto wallet friction.
Countermeasure: make V1 useful to crypto-native technical contractors first; later add embedded wallets/onramp/cross-chain funding.

Risk 5: Smart-contract vulnerability.
Countermeasure: tiny contract surface, no upgradeability, fuzz/invariant tests, low-value pilot, external review before scale.

Risk 6: Regulatory classification.
Countermeasure: avoid custodial claims, limit V1 scope, legal review before commercialization.

Risk 7: Existing platforms copy feature.
Countermeasure: long-term moat must be protocol/API distribution and programmable verification—not the basic vault UI.

Risk 8: Arc ecosystem too early.
Countermeasure: V1 cost is intentionally low; architecture remains EVM-based while Arc-specific advantages drive settlement strategy.


# 30. Moat Hypothesis

The V1 contract is not a moat. A funded milestone can be copied.

Potential long-term defensibility:
1. Verification network: reusable outcome verifiers across domains.
2. Embedded distribution: SDK/API integrated into agencies, vertical SaaS, and agent platforms.
3. Settlement history: reliable contract completion graph for organizations/agents, used carefully and with privacy considerations.
4. Policy layer: company/agent spending rules tied to conditional payments.
5. Workflow integration: payment assurance becomes a standard step before execution, not a separate finance app.
6. Cross-chain liquidity abstraction: clients fund from where money already sits while Arc remains canonical settlement.

The strategic direction is to become infrastructure that other products use, not only a standalone dashboard.


# 31. Decision Log: Decisions Already Made

D-001: Solve payment assurance, not generic transfer.
D-002: Initial user is contractor/small agency with an existing client.
D-003: V1 uses pre-funded milestone in USDC on Arc.
D-004: V1 does not build talent discovery/marketplace.
D-005: V1 does not claim universal dispute resolution.
D-006: Use “conditional payment / milestone vault” language rather than assuming licensed escrow status.
D-007: Onchain state is authoritative for money state.
D-008: Evidence files remain offchain; cryptographic reference can be committed.
D-009: Timeout behavior must be agreed before funding.
D-010: Mainnet deployment is a release requirement, not a post-MVP task.
D-011: Future agent commerce must reuse the same economic primitive rather than introduce a separate product architecture.


# 32. Open Decisions Before Coding

The AI engineer/product owner must resolve these during Phase 0 and record answers in DECISIONS.md:

1. Exact Arc mainnet network parameters from official docs at deployment time.
2. Exact USDC contract/native-token interaction semantics for smart-contract-held funds.
3. Per-milestone vault vs pooled registry architecture.
4. Default review period: 3, 7, or 14 days.
5. Whether contractor acknowledgement is a separate onchain action.
6. Whether revision is V1 or V1.5.
7. Whether explicit DISPUTED state pauses timeout release.
8. Whether mutual split settlement is required in V1.
9. Whether platform fee is exactly 0 for microgrant version.
10. Metadata storage: HTTPS+hash vs IPFS.

None of these questions should expand the product beyond the selected problem.


# 33. Definition of V1 Success

V1 is successful when a reviewer can do this without explanation from the builder:

1. Open the live app.
2. Connect an Arc-compatible wallet.
3. Create a milestone for another wallet.
4. Fund it with USDC.
5. Share/open the milestone as contractor.
6. Verify that the UI proves the funds exist.
7. Submit a deliverable reference.
8. Approve as client.
9. See USDC arrive at contractor.
10. Verify the release on Arc explorer.

The product should communicate why this is better than sending an invoice:
An invoice records a debt after work. A funded milestone proves committed money before work.

Microgrant success is not user count. It is credible proof that the primitive works and is worth taking further.


# 34. Recommended README Structure

# Arc Milestone Assurance
Never start unfunded work again.

## Problem
Evidence and concise explanation.

## What it does
Create -> Fund -> Submit -> Approve/Timeout -> Settle.

## Why Arc
USDC-native programmable settlement, finality, interoperability.

## Live Demo
URL.

## Mainnet Contract
Address + explorer.

## Demo Transactions
3–5 tx links.

## Architecture
Simple diagram.

## Run Locally
Environment + commands.

## Tests
Foundry and web tests.

## Security / Limitations
State what V1 does not solve.

## Roadmap
V1 -> API -> verification -> agent commerce.


# 35. Source & Evidence Register

Sources checked for this decision and document (accessed 17 September 2026):

[1] Arc — “Arc Mainnet Is Live: The Economic OS for the Internet” (16 Sep 2026)
https://www.arc.io/blog/arc-economic-os-internet
Key evidence: mainnet live; USDC native gas; 20+ chain interoperability through CCTP/Gateway; settlement final under a second.

[2] Arc — “The Unfinished Business of Finance, Machine Commerce, and Global Money: A Request For Builders” (16 Sep 2026)
https://www.arc.io/blog/the-unfinished-business-of-finance-machine-commerce-and-global-money
Key evidence: programmable money, outcome marketplaces, USDC bounty released on verified completion, autonomous businesses.

[3] Arc Community — Arc Microgrants
https://community.arc.io/public/events/arc-microgrants-f8tijfjhyq
Key evidence: 20 x 500 USDC; mainnet requirement; public repo; deadline 14 Oct 2026; rolling review; evaluation criteria.

[4] QuickBooks — “2026 Small Business Late Payments Report”
https://quickbooks.intuit.com/r/small-business-data/small-business-late-payments-report-2026/
Key evidence: 59% with invoices 30+ days overdue; average $17.7K unpaid among businesses with unpaid invoices; 49% report cash-flow gaps from processing times.

[5] Upwork Help — “How Fixed-Price Payment Protection works for freelancers on Upwork”
https://support.upwork.com/hc/en-us/articles/211063748-How-Fixed-Price-Payment-Protection-works-for-freelancers-on-Upwork
Key evidence: fixed-price protection depends on active funded milestones; guidance to confirm funding before starting.

[6] Upwork Help — “How to accept and pay for a Direct Contract”
https://support.upwork.com/hc/en-us/articles/360047918314-How-to-accept-and-pay-for-a-Direct-Contract
Key evidence: fixed-price client funds milestone, work is submitted, client reviews/releases.

[7] Upwork — Direct Contracts
https://www.upwork.com/direct-contracts
Key evidence: client payment held for work; 5% public fee; dispute help.

[8] Upwork Agency Direct Contracts
https://www.upwork.com/agency-direct-contracts
Key evidence: funds secured before work starts on fixed-price milestones; public 5% infrastructure fee positioning.

[9] Upwork Legal Center
https://www.upwork.com/legal
Key evidence: escrow entities and formal release conditions; important legal comparison for product-language caution.

[10] Reddit / r/Upwork — “Guys please work only with funded milestone.” (18 Mar 2026)
https://www.reddit.com/r/Upwork/comments/1rxe1s8/guys_please_work_only_with_funded_milestone/
Key evidence: community case of unpaid work and repeated advice to work only against funded milestones.

[11] Reddit / r/Upwork — “(New on Upwork) I finished the contract, but only 1/3 has been paid…” (20 Mar 2026)
https://www.reddit.com/r/Upwork/comments/1rynjxs/new_on_upwork_i_finished_the_contract_but_only_13/
Key evidence: confusion between contract total and funded milestone; community explanation that unfunded work is not protected.

[12] Reddit / r/Upwork — “Client not paying me for milestone…” (25 Apr 2026)
https://www.reddit.com/r/Upwork/comments/1sv2a33/client_not_paying_me_for_milestone_and_instead/
Key evidence: scope expansion and payment dispute after submission.

[13] Reddit / r/Upwork — “My first Upwork client turned a 1-week $100 job into 2 months…” (13 Sep 2026)
https://www.reddit.com/r/Upwork/comments/1wezh7e/my_first_upwork_client_turned_a_1week_100_job/
Key evidence: milestone timing, scope/review leverage, and contractor risk even inside a structured platform.

[14] Arc Docs — App Kit bridge quickstart
https://docs.arc.network/app-kit/quickstarts/bridge-tokens-across-blockchains
Key evidence: Circle App Kit/bridge tooling and cross-chain USDC integration path. This is roadmap evidence, not required V1 functionality.

Research caveat:
Community posts are qualitative evidence, not population-level statistics. They are used to identify repeated failure modes and user language, then cross-checked against platform documentation and macro payment data.
