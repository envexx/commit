import { isAddress, type Address } from 'viem'

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

/**
 * Accepts a bare vault address, a full milestone link, or a scheme-less URL —
 * anything a client might paste into a chat. Returns the vault address, or
 * null when the input does not contain one. Addresses pass through with the
 * user's casing; every consumer compares lowercased.
 */
export function parseMilestoneInput(raw: string): Address | null {
  const value = raw.trim()
  if (!value) return null

  if (ADDRESS_RE.test(value)) {
    return isAddress(value) ? (value as Address) : null
  }

  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value)
    const url = new URL(hasScheme ? value : `https://${value}`)
    const candidate = url.searchParams.get('address')
    if (candidate && ADDRESS_RE.test(candidate) && isAddress(candidate)) {
      return candidate as Address
    }
  } catch {
    return null
  }
  return null
}
