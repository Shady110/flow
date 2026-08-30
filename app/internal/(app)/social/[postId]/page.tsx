import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { requirePermission, getCurrentUser } from '@/lib/auth/session'
import { getSocialPost, getSocialCampaigns } from '@/lib/db/social-queries'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SocialComposer } from '@/components/dashboard/SocialComposer'

export default async function SocialPostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  await requirePermission('social.view')
  const { postId } = await params

  const [post, campaigns, user, t] = await Promise.all([
    getSocialPost(postId),
    getSocialCampaigns(),
    getCurrentUser(),
    getTranslations('internal.social'),
  ])

  if (!post) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/social"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('backToCalendar')}
      </Link>

      <PageHeader title={post.hook} description={t('composerDescription')} />
      <SocialComposer
        post={post}
        campaigns={campaigns}
        canEdit={!!user?.permissions.has('social.create')}
        canPublish={!!user?.permissions.has('social.publish')}
      />
    </div>
  )
}
