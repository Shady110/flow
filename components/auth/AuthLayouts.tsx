import { getTranslations } from 'next-intl/server'
import { BarChart3, CreditCard, MessageCircle, ShoppingBag } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { AnimatedGridPattern } from '@/components/ds/animated-grid-pattern'
import { AnimatedShinyText } from '@/components/ds/animated-shiny-text'
import { Meteors } from '@/components/ds/meteors'
import { OrbitingCircles } from '@/components/ds/orbiting-circles'
import { Ripple } from '@/components/ds/ripple'
import { ShineBorder } from '@/components/ds/shine-border'
import { PRODUCT } from '@/lib/product'

function ProductMark({ kind, tone }: { kind: 'internal' | 'client'; tone: 'white' | 'green' }) {
  return (
    <div className="flex items-center gap-3">
      <Logo variant="mark" tone={tone} className="h-9" />
      <Logo variant="wordmark" tone={tone} className="h-6" />
      <span className="rounded-full bg-flow-lime px-3 py-1 font-display text-sm font-bold text-flow-green">{PRODUCT[kind].short}</span>
    </div>
  )
}

/** The form sits in a card with a slow travelling light around its edge. */
function FormCard({ children, size }: { children: React.ReactNode; size: 'sm' | 'md' }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-card p-6 shadow-[var(--shadow-md)] sm:p-8 ${size === 'sm' ? 'max-w-sm' : 'max-w-md'}`}>
      <ShineBorder shineColor={['#C4F075', '#143C28', '#C4F075']} borderWidth={2} duration={9} />
      <div className="relative space-y-6">{children}</div>
    </div>
  )
}

/** Team sign-in: half green stage (drifting grid, meteors), half form. */
export async function TeamAuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth.team')
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-flow-green p-12 text-white lg:flex">
        <AnimatedGridPattern
          numSquares={32}
          maxOpacity={0.4}
          duration={3}
          className="fill-flow-lime/15 stroke-flow-lime/20 [mask-image:radial-gradient(ellipse_at_40%_45%,white,transparent_78%)]"
        />
        <Meteors number={26} minDuration={4} maxDuration={11} className="bg-flow-lime" tailClassName="from-flow-lime" />
        <div className="relative"><ProductMark kind="internal" tone="white" /></div>
        <div className="relative space-y-4">
          <AnimatedShinyText className="mx-0 text-sm font-semibold uppercase tracking-[0.25em] text-white/50 via-white">{PRODUCT.internal.name}</AnimatedShinyText>
          <h2 className="font-display text-5xl font-bold leading-[1.1]">{t('headline')}</h2>
        </div>
      </aside>
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-4">
          <div className="lg:hidden"><ProductMark kind="internal" tone="green" /></div>
          <LanguageSwitcher className="ms-auto min-h-11 px-3" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <FormCard size="sm">{children}</FormCard>
        </div>
      </main>
    </div>
  )
}

const ORBIT = [ShoppingBag, BarChart3, MessageCircle, CreditCard]

/** Client sign-in: half big-and-simple form, half lime stage with ripples and a slow orbit. */
export async function ClientAuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth.client')
  return (
    <div className="min-h-screen bg-card lg:grid lg:grid-cols-2">
      <main className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between p-4 sm:px-8">
          <ProductMark kind="client" tone="green" />
          <LanguageSwitcher className="min-h-11 px-3" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <FormCard size="md">{children}</FormCard>
        </div>
      </main>
      <aside className="relative hidden items-center justify-center overflow-hidden bg-flow-lime lg:flex">
        <Ripple mainCircleSize={170} numCircles={7} mainCircleOpacity={0.22} className="mask-none [--foreground:#143C28] [&>div]:bg-flow-green/10" />
        <div className="relative flex size-[460px] items-center justify-center">
          <OrbitingCircles radius={120} duration={26} iconSize={56} className="rounded-2xl bg-white shadow-lg">
            {ORBIT.slice(0, 2).map((Icon, i) => <Icon key={i} className="size-6 text-flow-green" />)}
          </OrbitingCircles>
          <OrbitingCircles radius={195} duration={40} reverse iconSize={56} className="rounded-2xl bg-white shadow-lg">
            {ORBIT.slice(2).map((Icon, i) => <Icon key={i} className="size-6 text-flow-green" />)}
          </OrbitingCircles>
          <div className="relative flex size-28 items-center justify-center rounded-[32px] bg-flow-green shadow-xl">
            <Logo variant="mark" tone="white" className="h-14" />
          </div>
        </div>
        <AnimatedShinyText className="absolute inset-x-0 bottom-10 mx-auto text-center text-lg font-semibold text-flow-green/70 via-flow-green">{t('features')}</AnimatedShinyText>
      </aside>
    </div>
  )
}
