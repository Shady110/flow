import { getTranslations } from 'next-intl/server'
import { loginGate } from '@/lib/auth/login-gate'
import { whatsappUrl } from '@/lib/contact'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { ClientAuthLayout } from '@/components/auth/AuthLayouts'
import { SignInForm } from '@/components/auth/SignInForm'
import { WrongAddress } from '@/components/auth/WrongAddress'

/** The same sign-in for every client: your email decides whose dashboard opens. */
export default async function PortalLoginPage() {
  const gate = await loginGate('client')
  const [t, settings] = await Promise.all([getTranslations('auth'), getPortalSettings()])
  return (
    <ClientAuthLayout>
      {gate === 'wrong' ? (
        <WrongAddress portal="client" />
      ) : (
        <>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-flow-green">{t('client.title')}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t('client.subtitle')}</p>
          </div>
          <SignInForm variant="client" helpHref={whatsappUrl(settings.whatsapp, t('helpText'))} />
        </>
      )}
    </ClientAuthLayout>
  )
}
