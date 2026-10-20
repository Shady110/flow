import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { chargeDueInvoices, generateDueInvoices } from '@/lib/payments/billing-run'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * The daily billing job: create this month's invoices from signed contracts,
 * then (if automatic payments are switched on) charge saved cards. Called by the
 * scheduler with `Authorization: Bearer $CRON_SECRET`; refuses everyone else, and
 * refuses to run at all if no secret is configured.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 500 })
  const given = Buffer.from(req.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const invoices = await generateDueInvoices()
    const charges = await chargeDueInvoices()
    return NextResponse.json({ ok: true, invoices, charges })
  } catch (e) {
    console.error('[cron billing] failed', e)
    return NextResponse.json({ error: 'billing run failed' }, { status: 500 })
  }
}
