# ARC_MAINNET.md

> Verified Arc mainnet parameters. Source: official Arc developer documentation
> (docs.arc.io), accessed 17 September 2026. Do not hard-code values anywhere
> else; import from this document / `packages/shared/constants`.

## Network

| Parameter        | Value                          |
| :--------------- | :----------------------------- |
| Network name     | Arc                            |
| Chain ID         | `5042`                         |
| RPC (primary)    | `https://rpc.mainnet.arc.io`   |
| Explorer         | `https://explorer.arc.io`      |
| Native currency  | USDC (native gas token)        |
| Native decimals  | 18 (gas display only)          |
| Block time       | sub-second, settlement final < 1s |
| EVM compat       | EVM-equivalent (see notes)     |

Backup RPCs: Alchemy (`https://arc-mainnet.g.alchemy.com/v2/<key>`),
Blockdaemon (`https://rpc.blockdaemon.mainnet.arc.io`),
dRPC (`https://rpc.drpc.mainnet.arc.io`),
QuickNode (`https://rpc.quicknode.mainnet.arc.io`).

## USDC semantics (critical)

- USDC is the **native gas asset** of Arc. There is **no wrapped USDC** on Arc.
- The native USDC balance already satisfies `IERC20` directly. An **optional
  ERC-20 interface** is exposed at:

  ```
  0x3600000000000000000000000000000000000000
  ```

- The ERC-20 interface uses **6 decimals**. The native-gas representation uses
  18 decimals. **Never mix the two.** Per official guidance, applications should
  rely **solely on the standard ERC-20 interface** for balance reads and
  transfers.
- Therefore `MilestoneVault` treats USDC as a normal ERC-20 (`approve` /
  `transferFrom` / `transfer`) at the address above with 6 decimals.
- Native value (`msg.value`) is never accepted by the vault.
- Display rule from docs: never show "native USDC" and "ERC-20 USDC" as two
  balances — they are the same underlying balance.

## Tooling notes

- `viem` ships Arc Mainnet as a built-in chain: `import { arc } from "viem/chains"`.
- Arc Testnet (chain ID `5042002`, `https://rpc.testnet.arc.io`,
  `https://explorer.testnet.arc.io`) is available for rehearsal; faucet:
  `https://faucet.circle.com`.
- `Multicall3` is deployed at `0xcA11bde05977b3631167028862bE2a173976CA11`.
- CREATE2 factory (Arachnid) available at
  `0x4e59b44847b379578588920cA78FbF26c0B4956C` (not required for V1).
- Wallets: MetaMask, Rabby, Coinbase Wallet, Rainbow all support manual network
  addition (RPC / chain ID / symbol `USDC` / explorer as above).

## EVM differences that matter to us

- Arc reverts **runtime value transfers** to/from blocklisted addresses
  (sanctions behavior). A USDC transfer into or out of a blocklisted address
  will revert. Consequence for the vault: settlement to a blocklisted
  beneficiary would revert and be retryable only if the blocklist status
  changes; this is an accepted, documented limitation (see SECURITY.md).
- Gas is denominated in USDC — predictable, stable transaction costs.

## Deployment record

Filled in after Phase 5 (see DEPLOYMENT.md):

| Field              | Value |
| :---------------- | :---- |
| Factory address   | TBD   |
| Deploy tx         | TBD   |
| Deployer          | TBD   |
| Commit hash       | TBD   |
| Compiler          | solc 0.8.28 via Foundry |
| Verification      | TBD   |
