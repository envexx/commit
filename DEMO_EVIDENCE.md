# DEMO EVIDENCE

> Deployment and transaction evidence for Arc Milestone Assurance.
> Rule: every claim in this file is a verifiable onchain artifact — address,
> tx hash, or reproducible local script. Nothing here is a screenshot-only
> claim. `_TBD_` entries are filled at mainnet deployment.

## 1. Arc mainnet (chain 5042)

| Item | Value |
| --- | --- |
| Deployer | _TBD_ |
| MilestoneVaultFactory | _TBD_ |
| Creation tx | _TBD_ |
| Verified source link | _TBD_ |
| USDC used | native USDC ERC-20 interface `0x3600000000000000000000000000000000000000` |

### Happy path (mainnet)

| Step | Tx hash | Notes |
| --- | --- | --- |
| Create milestone (deploy vault) | _TBD_ | `MilestoneCreated` event |
| Approve USDC | _TBD_ | |
| Fund milestone | _TBD_ | vault balance = amount |
| Submit work | _TBD_ | evidence hash + URI onchain |
| Approve & release | _TBD_ | contractor receives exact amount |

### Failure paths (mainnet, small value)

| Path | Tx hash | Notes |
| --- | --- | --- |
| Review-window timeout release | _TBD_ | permissionless `claimAfterReview` |
| Deadline refund | _TBD_ | `refundExpired` |
| Mutual cancel | _TBD_ | both signatures |

## 2. Local rehearsal (anvil, chain 31337) — reproducible

Recorded by `script/DeployLocal.s.sol`, file `packages/contracts/deployments/31337.json`:

```json
{
  "chainId": 31337,
  "deployedAt": 1789644860,
  "factory": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "usdc": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}
```

Reproduce end-to-end (two wallets, the Phase 3 exit criterion):

```bash
cd packages/contracts && anvil          # terminal 1
forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
cd ../../apps/web && npm run dev        # with .env.local from the JSON above
```

Script (also in `apps/web/README.md`):

1. Wallet A (client, anvil acct 0): `/create` → deploy vault → approve → fund.
2. Wallet B (contractor, anvil acct 1): open shared `/milestone?address=…` →
   confirm FUNDED → submit evidence URL.
3. Wallet A: approve & release → both wallets see SETTLED with the tx timeline.
4. Repeat with `claimAfterReview` (time-warped), `refundExpired`, and mutual
   cancel to cover the failure paths.

## 3. Test evidence

```
forge test → Ran 15 test suites: 74 tests passed, 0 failed, 0 skipped
Invariant: MilestoneInvariants — 16 runs, 1024 calls, 0 reverts
           invariant_VaultNeverHoldsMoreThanCommitment
```

Web verification: `tsc --noEmit` clean; `next build` exports 7/7 static pages;
browser smoke test of `/`, `/create`, `/milestones`, `/milestone` (see
`docs/UI-AUDIT-REPORT.md` for the audit that led to the current state).
