// Dates and times in the viewer's language. Arabic uses Latin digits on purpose
// so numbers match invoice numbers and amounts, which are always Latin.

export const intlLocale = (locale: string): string => (locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB')

type DateInput = string | number | Date

const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d))

/** "20 Oct 2026" / "٢٠ أكتوبر ٢٠٢٦" (Latin digits). */
export function formatDate(d: DateInput, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'short', year: 'numeric' }).format(toDate(d))
}

/** Date plus clock time. */
export function formatDateTime(d: DateInput, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(toDate(d))
}

export function formatTime(d: DateInput, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { hour: '2-digit', minute: '2-digit' }).format(toDate(d))
}
