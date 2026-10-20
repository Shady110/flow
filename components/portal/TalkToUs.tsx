import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ds/button'

/** The always-there help: WhatsApp (if a number is set) and the in-portal chat. */
export async function TalkToUs({ whatsapp }: { whatsapp: string | null }) {
  const t = await getTranslations('portal.home')
  return (
    <section className="rounded-3xl bg-secondary p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold tracking-tight">{t('talkTitle')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('talkHelp')}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {whatsapp && (
          <Button asChild size="lg" className="h-12 bg-[#0f7a5c] text-white hover:bg-[#0c6a50]">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" /> {t('whatsapp')}
            </a>
          </Button>
        )}
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link href="/chat">{t('openChat')}</Link>
        </Button>
      </div>
    </section>
  )
}
