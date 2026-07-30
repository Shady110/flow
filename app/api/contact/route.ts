import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Record the enquiry as a lead so nothing lives only in an inbox. Uses the
 * service-role client because this route is unauthenticated and leads_insert
 * RLS requires the leads.create permission. Best-effort: a DB failure must not
 * break the email or the visitor's form.
 */
async function recordLead(fields: Record<string, string | undefined>) {
  const { name, email, phone, platform, products, service, message } = fields
  try {
    const admin = createAdminClient()
    const notes = [
      platform ? `Platform: ${platform}` : null,
      products ? `Products: ${products}` : null,
      message ? `\n${message}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    await admin.from('leads').insert({
      name,
      email: email?.toLowerCase(),
      phone: phone || null,
      field: platform || null,
      plan_interest: service || null,
      source: 'website',
      notes: notes || null,
    })
  } catch (err) {
    console.error('[contact] could not record lead:', err)
  }
}

export async function POST(req: NextRequest) {
  const { name, email, phone, platform, products, service, message } =
    await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }

  await recordLead({ name, email, phone, platform, products, service, message })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"FLOW Website" <${process.env.GMAIL_USER}>`,
    to: 'flowagency.eg@gmail.com',
    replyTo: email,
    subject: `New Inquiry from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1B4D2E">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#666;width:140px">Name</td><td style="padding:8px;font-weight:bold">${name}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px">${phone || '—'}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Platform</td><td style="padding:8px">${platform || '—'}</td></tr>
          <tr><td style="padding:8px;color:#666">Products</td><td style="padding:8px">${products || '—'}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Service</td><td style="padding:8px">${service || '—'}</td></tr>
          <tr><td style="padding:8px;color:#666;vertical-align:top">Message</td><td style="padding:8px">${message || '—'}</td></tr>
        </table>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
