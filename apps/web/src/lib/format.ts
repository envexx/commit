import { keccak256, toHex } from 'viem'

export type MilestoneMetadata = {
  version: 1
  title: string
  scope: string
  createdAt: number
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

export function buildMetadataUri(meta: MilestoneMetadata): string {
  return `data:application/json;base64,${toBase64(JSON.stringify(meta))}`
}

export function parseMetadataUri(uri: string): MilestoneMetadata | null {
  try {
    const prefix = 'data:application/json;base64,'
    if (!uri.startsWith(prefix)) return null
    const json = atob(uri.slice(prefix.length))
    const parsed = JSON.parse(json)
    if (parsed && parsed.version === 1 && typeof parsed.title === 'string') return parsed
    return null
  } catch {
    return null
  }
}

export function hashText(text: string): `0x${string}` {
  return keccak256(toHex(text))
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatUsdc(amount: bigint): string {
  const whole = amount / 1_000_000n
  const frac = (amount % 1_000_000n).toString().padStart(6, '0').slice(0, 2)
  return `${whole.toLocaleString('en-US')}.${frac}`
}

export function formatRemaining(deadlineSec: bigint | number): string {
  const deadline = Number(deadlineSec) * 1000
  const diff = deadline - Date.now()
  if (diff <= 0) return 'expired'
  const mins = Math.floor(diff / 60_000)
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const minutes = mins % 60
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

export function periodLabel(seconds: bigint | number): string {
  const days = Number(seconds) / 86400
  return days === 1 ? '1 day' : `${days} days`
}
