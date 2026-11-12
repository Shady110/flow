import { PRODUCT } from '../product.ts'
import type { AccountKind } from '../auth/route-guard.ts'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** The "choose a new password" email. Clients get Arabic first, then English. */
export function resetEmail(link: string, kind: AccountKind) {
  const product = PRODUCT[kind === 'staff' ? 'internal' : 'client'].name
  const en = {
    subject: `Choose a new password for ${product}`,
    body: `Someone asked to reset the password for your ${product} account. Open the link to choose a new one. It works once and expires soon. If this wasn't you, ignore this email.`,
    cta: 'Choose a new password',
  }
  const ar = {
    subject: `اختر كلمة مرور جديدة لحسابك في ${product}`,
    body: `طُلب إعادة تعيين كلمة المرور لحسابك في ${product}. افتح الرابط لاختيار كلمة مرور جديدة. الرابط يعمل مرة واحدة وينتهي قريبًا. إذا لم تكن أنت، تجاهل هذه الرسالة.`,
    cta: 'اختر كلمة مرور جديدة',
  }
  const block = (t: typeof en, dir: 'ltr' | 'rtl') =>
    `<div dir="${dir}" style="font-size:16px;line-height:1.7;color:#13261B;margin:0 0 20px">${esc(t.body)}</div>
     <p dir="${dir}" style="margin:0 0 28px"><a href="${esc(link)}" style="display:inline-block;background:#0D422C;color:#C4F075;padding:14px 26px;border-radius:12px;text-decoration:none;font-weight:700">${esc(t.cta)}</a></p>`
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px"><h2 style="color:#0D422C;margin:0 0 20px">${esc(product)}</h2>${
    kind === 'client' ? block(ar, 'rtl') + '<hr style="border:0;border-top:1px solid #DCE5DE;margin:8px 0 24px">' + block(en, 'ltr') : block(en, 'ltr')
  }</div>`
  const text = kind === 'client' ? `${ar.body}\n${link}\n\n${en.body}\n${link}` : `${en.body}\n${link}`
  return { subject: kind === 'client' ? `${ar.subject} / ${en.subject}` : en.subject, html, text }
}
