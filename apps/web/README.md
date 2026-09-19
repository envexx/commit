# Commit — Web App

Next.js (App Router) + wagmi/viem frontend for the MilestoneVault contracts
(`packages/contracts`). Static-exportable; money state is read directly from
the chain, human-readable metadata lives in browser localStorage.

## Run locally

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 with an injected wallet (MetaMask / Rabby / Coinbase
Wallet). The app forces the network configured via `NEXT_PUBLIC_CHAIN`.

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Values | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CHAIN` | `mainnet` (default) / `testnet` / `local` | selects chain 5042 / 5042002 / 31337 |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | `0x…` | MilestoneVaultFactory address (from `packages/contracts/deployments/<chainId>.json`) |
| `NEXT_PUBLIC_USDC_ADDRESS` | `0x…` | optional; defaults to Arc mainnet native-USDC ERC-20 interface `0x3600…0000`. Required for testnet/local. |

## Local end-to-end rehearsal (anvil)

Terminal 1 — chain + contracts:

```bash
cd packages/contracts
anvil
# terminal 2
forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

`DeployLocal` deploys a mintable mock USDC and the factory, mints 1,000,000
USDC to anvil accounts 0 and 1, and writes `deployments/31337.json`. Use the
printed addresses:

```bash
cd apps/web
cat > .env.local <<'EOF'
NEXT_PUBLIC_CHAIN=local
NEXT_PUBLIC_FACTORY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
EOF
npm run dev
```

Two-wallet happy path (the Phase 3 exit criterion):

1. Import anvil account 0 (`0xac0974…ff80`) into wallet A → client.
2. Import anvil account 1 (`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`) into wallet B → contractor.
3. Wallet A: `/create` → create (deploy vault) → approve USDC → fund.
4. Wallet B: open the shared `/milestone?address=…` link → verify FUNDED → submit evidence.
5. Wallet A: approve and release → both see SETTLED plus the explorer-less
   local tx timeline (local chain has no explorer; hashes still render).

> Anvil keys above are the standard public test keys — never fund them.

## Screens

- `/` landing
- `/create` create → approve → fund (client flow, two transactions)
- `/milestones` list of milestones this browser knows for the connected wallet
- `/milestone?address=0x…` shared detail page: status banner, role-aware
  actions, activity timeline, explorer links, scope-hash verification
