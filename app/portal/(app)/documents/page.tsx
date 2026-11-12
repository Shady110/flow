import { redirect } from 'next/navigation'

// Documents now live on the Papers tab; keep old links working.
export default function DocumentsRedirect() {
  redirect('/papers')
}
