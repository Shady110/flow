import type { Campaign } from './types'

/**
 * The Q4 campaign windows.
 *
 * The ordering here encodes the one strategic idea the whole plan turns on:
 * FLOW's selling window sits *before* the seller's selling window. A seller
 * needs photography and listings live three to six weeks ahead of White Friday.
 * By the sale weekend they are firefighting orders, not onboarding an agency.
 *
 * So the conversion peak is `q4-ready` in October, not the sale campaigns in
 * November. November's job is proof and goodwill — which is what earns the
 * December retainer conversation.
 */
export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'q4-decided-in-october',
    name: 'Q4 is decided in October',
    startsAt: '2026-09-01',
    endsAt: '2026-09-30',
    goal:
      'Awareness and list-building. Open Facebook and LinkedIn from zero, and get the free listing audit in front of as many Egyptian sellers as possible.',
    colour: 'flow-green-light',
  },
  {
    slug: 'q4-ready',
    name: 'Book your Q4 catalogue',
    startsAt: '2026-10-01',
    endsAt: '2026-10-31',
    goal:
      'The conversion peak. Close content batches and retainers against a published booking cut-off, while sellers still have runway before the season.',
    colour: 'flow-lime',
  },
  {
    slug: 'white-friday',
    name: 'White Friday',
    // Noon and Amazon.eg set the actual window and usually announce in October.
    // Dated provisionally so the slots exist; confirm before anything ships.
    startsAt: '2026-11-05',
    endsAt: '2026-11-30',
    goal:
      'Ride the season with genuinely useful content for sellers mid-sale, plus last-minute capacity for anyone who left it late. Selling hard here is selling to people who cannot buy.',
    colour: 'flow-mint-glow',
    datesProvisional: true,
  },
  {
    slug: 'black-friday',
    name: 'Black Friday weekend',
    startsAt: '2026-11-24',
    endsAt: '2026-11-30',
    goal:
      'Peak-visibility proof. Show the work live on shelves during the busiest retail weekend of the year.',
    colour: 'flow-green',
  },
  {
    slug: 'year-end',
    name: 'Christmas & start January right',
    startsAt: '2026-12-01',
    endsAt: '2026-12-31',
    goal:
      'Gifting-category content, the year in review, and annual retainers sold while next-year budgets are being set.',
    colour: 'flow-lime-bright',
  },
]

/** Fixed commercial dates the calendar pins to. */
export const KEY_DATES = [
  { date: '2026-11-11', label: '11.11' },
  { date: '2026-11-27', label: 'Black Friday' },
  { date: '2026-12-12', label: '12.12' },
  { date: '2026-12-25', label: 'Christmas' },
  { date: '2026-12-31', label: 'New Year' },
] as const
