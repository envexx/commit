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

## 2. Arc testnet rehearsal (chain 5042002) — 18 September 2026

Phase 5 rehearsal before mainnet (ED-15). Commit `6835a51`, solc 0.8.28
(optimizer 200 runs).

| Item | Value |
| --- | --- |
| Deployer | `0x5bF729412bB61f8cF92f927665397aB7eFbF7802` |
| MilestoneVaultFactory | `0x69083F1e10D95a2bE29e2D9Ef76d3C0CaDDb360D` |
| Deploy tx | `0x4412b053e92bd07032eeb3f9044729b4b43bcddeaa48aae34fbf99570f4641a0` |
| Deployment record | `packages/contracts/deployments/5042002.json` |
| USDC (ERC-20 interface) | `0x3600000000000000000000000000000000000000` (6 decimals) |
| Explorer | https://explorer.testnet.arc.io/address/0x69083F1e10D95a2bE29e2D9Ef76d3C0CaDDb360D |

### Funded milestone (testnet smoke test)

Client `0x5bF7…7802` (deployer), contractor `0x7099…79C8`, amount 0.01 USDC,
submission period 7 days, review period 3 days, scopeHash
`0x45ac8b7363d2d2f2a1da06ee5b72edf79bb69dd19aa060871f371be0a1717c5e`.

| Step | Tx hash | Result |
| --- | --- | --- |
| Create milestone (deploy vault) | `0x3ef604373c499b3b37b2cee8f8387c6d22d681c6fd6920cb7e88796f5541965a` | vault `0x40cEF618633e9517AB40548661EcAE4944dBE071` |
| Approve USDC | `0xb8bdfc8e29a883a2eb519b93b974aeadb6cf55df665dbfe0c328d15e7b582de7` | allowance = 10000 (0.01 USDC) |
| Fund milestone | `0xea23d300dfb10e481e1b8de7efdff06e6e3b89db540cca04c5c0967d43939596` | vault balance = 0.01 USDC |

Post-conditions read onchain: `vaultCount() = 1`, vault `getStatus().state = 1`
(`Funded`), `submitDeadline = fundedAt + 604800` (7 days), USDC
`balanceOf(vault) = 10000`. Remaining testnet balance after the run: ~19.88 USDC.

## 3. Local rehearsal (anvil, chain 31337) — reproducible

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

## 4. Test evidence

```
forge test → Ran 15 test suites: 74 tests passed, 0 failed, 0 skipped
Invariant: MilestoneInvariants — 16 runs, 1024 calls, 0 reverts
           invariant_VaultNeverHoldsMoreThanCommitment
```

Web verification: `tsc --noEmit` clean; `next build` exports 7/7 static pages;
browser smoke test of `/`, `/create`, `/milestones`, `/milestone` (see
`docs/UI-AUDIT-REPORT.md` for the audit that led to the current state).
