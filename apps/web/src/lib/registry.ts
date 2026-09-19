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

export type CreateDraft = {
  vaultAddress: string
  createTx: string | null
  history: { label: string; hash: string }[]
}

const draftKeyFor = (chainId: number, client: string) =>
  `arc.create.draft.${chainId}.${client.toLowerCase()}`

/**
 * In-progress create flow: survives a reload so a deployed-but-unfunded vault
 * is never lost between the deploy and the approve/fund steps.
 */
export function loadCreateDraft(chainId: number, client: string): CreateDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(draftKeyFor(chainId, client))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CreateDraft
    return parsed && typeof parsed.vaultAddress === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function saveCreateDraft(chainId: number, client: string, draft: CreateDraft) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(draftKeyFor(chainId, client), JSON.stringify(draft))
  } catch {
    // storage full / disabled — the flow still works, it just won't resume.
  }
}

export function clearCreateDraft(chainId: number, client: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(draftKeyFor(chainId, client))
}
