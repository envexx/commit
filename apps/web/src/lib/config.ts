import { arcLocal, arcMainnet, arcTestnet } from './chains'

export const ARC_MAINNET_USDC = '0x3600000000000000000000000000000000000000' as const

export type EnvChain = 'mainnet' | 'testnet' | 'local'

export const envChain: EnvChain =
  (process.env.NEXT_PUBLIC_CHAIN as EnvChain | undefined) ?? 'mainnet'

const CHAINS = { mainnet: arcMainnet, testnet: arcTestnet, local: arcLocal } as const
const DEFAULT_USDC = { mainnet: ARC_MAINNET_USDC, testnet: '', local: '' } as const

export const targetChain = CHAINS[envChain]
export const chainLabel = { mainnet: 'Arc Mainnet', testnet: 'Arc Testnet', local: 'Local (anvil)' }[envChain]

export const USDC_ADDRESS = ((process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  DEFAULT_USDC[envChain]) ?? '') as `0x${string}`
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? '') as `0x${string}`

export function isConfigured() {
  return USDC_ADDRESS.startsWith('0x') && USDC_ADDRESS.length === 42
    && FACTORY_ADDRESS.startsWith('0x') && FACTORY_ADDRESS.length === 42
}

export function explorerAddress(address: string): string | null {
  const base = targetChain.blockExplorers?.default.url
  return base ? `${base}/address/${address}` : null
}

export function explorerTx(hash: string): string | null {
  const base = targetChain.blockExplorers?.default.url
  return base ? `${base}/tx/${hash}` : null
}
