import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { name, email, phone, platform, products, service, message } =
    await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }

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
