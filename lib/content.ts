/* ── Team ──────────────────────────────────────────────
 * Avatars are rendered as initials on a brand gradient — drop real
 * headshots into /public/assets/team and add a `photo` field to swap in.
 */
export interface TeamMember {
  name: string
  role: string
  initials: string
  photo?: string
}

export const team: TeamMember[] = [
  { name: 'Youssef Adel', role: 'Founder & Creative Director', initials: 'YA' },
  { name: 'Mariam Hassan', role: 'Head of Production', initials: 'MH' },
  { name: 'Omar Khaled', role: 'Lead Product Photographer', initials: 'OK' },
  { name: 'Nour El-Sayed', role: 'Listing & SEO Strategist', initials: 'NS' },
  { name: 'Karim Fathy', role: 'Marketplace Account Manager', initials: 'KF' },
  { name: 'Layla Mostafa', role: 'Bilingual Copy Lead', initials: 'LM' },
]
