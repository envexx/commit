export const SITE = {
  name: 'Arc Milestone Assurance',
  shortName: 'Assurance',
  tagline: 'Never start unfunded work again.',
}

export const EXTERNAL = {
  arcDocs: 'https://docs.arc.network',
  arcExplorer: 'https://explorer.arc.io',
  arcCommunity: 'https://community.arc.io',
}

export type SocialLink = {
  name: string
  url: string | null
  note?: string
}

export const SOCIALS: SocialLink[] = [
  { name: 'GitHub', url: null, note: 'public repo at submission' },
  { name: 'X / Twitter', url: null, note: 'builder profile at submission' },
  { name: 'Farcaster', url: null, note: 'builder profile at submission' },
]

export const PRODUCT_LINKS = [
  { href: '/', label: 'Home', hint: 'Your payments and your work' },
  { href: '/create', label: 'Protect a payment', hint: 'Commit USDC before work starts' },
  { href: '/about', label: 'How it works', hint: 'Why Arc Milestone Assurance' },
]

export const BUILD_LINKS = [
  { href: EXTERNAL.arcDocs, label: 'Arc documentation', hint: 'Network, USDC, tooling' },
  { href: EXTERNAL.arcExplorer, label: 'Arc explorer', hint: 'Verify transactions' },
  { href: EXTERNAL.arcCommunity, label: 'Arc community', hint: 'Microgrants and builders' },
]
