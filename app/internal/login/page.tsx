import { getTranslations } from 'next-intl/server'
import { loginGate } from '@/lib/auth/login-gate'
import { portalOrigin } from '@/lib/tenant'
import { TeamAuthLayout } from '@/components/auth/AuthLayouts'
import { SignInForm } from '@/components/auth/SignInForm'
import { WrongAddress } from '@/components/auth/WrongAddress'

export default async function InternalLoginPage() {
  const gate = await loginGate('internal')
  const t = await getTranslations('auth.team')
  const clientAddress = portalOrigin('client', process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000').replace(/^https?:\/\//, '')
  return (
    <TeamAuthLayout>
      {gate === 'wrong' ? (
        <WrongAddress portal="internal" />
      ) : (
        <>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-flow-green">{t('title')}</h1>
            <p className="mt-2 text-base text-muted-foreground">{t('subtitle')}</p>
          </div>
          <SignInForm variant="team" />
          <p dir="ltr" className="border-t border-border pt-4 text-center text-xs text-muted-foreground">{t('clientNote', { address: clientAddress })}</p>
        </>
      )}
    </TeamAuthLayout>
  )
}
