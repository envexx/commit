export type MilestoneRecord = {
  address: string
  chainId: number
  client: string
  contractor: string
  title: string
  scope: string
  amountDisplay: string
  createdAt: number
}

const keyFor = (chainId: number) => `arc.milestones.${chainId}`

export function loadRecords(chainId: number): MilestoneRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(keyFor(chainId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MilestoneRecord[]) : []
  } catch {
    return []
  }
}

export function saveRecord(record: MilestoneRecord) {
  if (typeof window === 'undefined') return
  const records = loadRecords(record.chainId)
  const next = [record, ...records.filter((r) => r.address !== record.address)]
  window.localStorage.setItem(keyFor(record.chainId), JSON.stringify(next))
}

export function deleteRecord(chainId: number, address: string) {
  if (typeof window === 'undefined') return
  const records = loadRecords(chainId)
  window.localStorage.setItem(
    keyFor(chainId),
    JSON.stringify(records.filter((r) => r.address !== address)),
  )
}
