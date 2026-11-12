import 'server-only'
import nodemailer from 'nodemailer'

/**
 * One place that sends mail (Gmail today; swap the transport here for Resend or
 * SMTP later). Without credentials it logs the message in development so flows
 * can be tried, and fails loudly in production.
 */
export async function sendMail(msg: { to: string; subject: string; html: string; text: string }) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') throw new Error('Mail is not configured')
    console.info(`[mail:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`)
    return
  }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  await transporter.sendMail({ from: `"FLOW" <${user}>`, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text })
}
