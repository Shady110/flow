'use client'

import { useTranslations } from 'next-intl'
import { Banknote, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ds/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ds/sheet'

/**
 * "How do I pay?" in one bottom sheet: the amount, the company's instructions,
 * the reference to write, and a one-tap WhatsApp to send the receipt. When
 * online payment arrives, only this component's action changes.
 */
export function HowToPay({
  amountText,
  reference,
  instructions,
  receiptHref,
  label,
  variant = 'default',
  className,
}: {
  amountText: string
  /** Invoice number to write on the transfer, if the sheet is for one invoice. */
  reference?: string
  instructions: string
  /** wa.me link prefilled with a receipt message, or null when no number is set. */
  receiptHref: string | null
  label: string
  variant?: 'default' | 'outline'
  className?: string
}) {
  const t = useTranslations('portal.payments')
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" variant={variant} className={className ?? 'h-12 w-full text-base'}>
          <Banknote className="h-5 w-5" /> {label}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 sm:mx-auto sm:max-w-lg">
        <SheetTitle className="font-display text-2xl font-bold">{t('howTitle')}</SheetTitle>
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">{t('amountToPay')}</p>
          <p className="font-display text-3xl font-bold">{amountText}</p>
          {reference && <p className="mt-1 text-sm text-muted-foreground">{t('reference', { number: reference })}</p>}
        </div>
        <p className="mt-4 whitespace-pre-line text-base leading-relaxed">{instructions || t('noInstructions')}</p>
        <div className="mt-6 flex flex-col gap-3">
          {receiptHref && (
            <Button asChild size="lg" className="h-14 bg-[#0f7a5c] text-base text-white hover:bg-[#0c6a50]">
              <a href={receiptHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> {t('sendReceipt')}
              </a>
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="outline" size="lg" className="h-12 text-base">{t('close')}</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
