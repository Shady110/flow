/**
 * Render every written post in the Sep–Dec plan to a PNG, and build a review
 * page pairing each design with its two captions.
 *
 *   npx tsx scripts/render-social.ts
 *
 * Output lands in `social-exports/` — images plus `index.html`. That folder is
 * a build artefact, not source, so it is gitignored.
 *
 * Runs offline against the same template component the /api/social/render route
 * uses, so what comes out here is byte-identical to what the dashboard previews.
 * Going through the HTTP route instead would mean standing up a server and
 * authenticating 68 times to produce files.
 *
 * What this cannot do, stated plainly: a reel is video and a carousel is many
 * slides. Both render their cover frame only; the remaining frames stay a
 * design brief for a person. Text and article posts get no image at all,
 * because a LinkedIn text post should not have one.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import React from 'react'
// The `next/og` specifier only resolves inside Next's bundler; this is the same
// module it re-exports.
import { ImageResponse } from '../node_modules/next/dist/compiled/@vercel/og/index.node.js'
import { SOCIAL_PLAN, isWritten, CAMPAIGNS } from '../data/social'
import type { PlannedPost } from '../data/social'
import { PostArtwork } from '../lib/social/template'
import { resolveTemplate, PLATFORM_SIZE, SIZES } from '../lib/social/templates'

const OUT = path.join(process.cwd(), 'social-exports')
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts')

/** Formats where a still image is the wrong deliverable. */
const NO_IMAGE = new Set(['text', 'article'])

async function fonts() {
  const [reg, bold, body] = await Promise.all([
    readFile(path.join(FONT_DIR, 'FunnelDisplay-Regular.woff')),
    readFile(path.join(FONT_DIR, 'FunnelDisplay-Bold.woff')),
    readFile(path.join(FONT_DIR, 'DidactGothic-Regular.woff')),
  ])
  const ab = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
  return [
    { name: 'Funnel Display', data: ab(reg), weight: 400 as const, style: 'normal' as const },
    { name: 'Funnel Display', data: ab(bold), weight: 700 as const, style: 'normal' as const },
    { name: 'Didact Gothic', data: ab(body), weight: 400 as const, style: 'normal' as const },
  ]
}

/** `2026-09-01-instagram-the-q4-timeline.png` — sorts chronologically in Finder. */
function filename(post: PlannedPost): string {
  const slug = post.hook
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `${post.date}-${post.platform}-${slug}.png`
}

/**
 * Stories are 9:16 whatever the platform default says, and a story rendered at
 * portrait would be cropped by Instagram rather than fitted.
 */
function sizeFor(post: PlannedPost) {
  if (post.format === 'story') return 'story' as const
  return PLATFORM_SIZE[post.platform]
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const loaded = await fonts()
  const written = SOCIAL_PLAN.filter(isWritten)
  const campaignName = new Map(CAMPAIGNS.map((c) => [c.slug, c.name]))

  const rendered: { post: PlannedPost; file: string | null }[] = []

  for (const post of written) {
    if (NO_IMAGE.has(post.format)) {
      rendered.push({ post, file: null })
      continue
    }

    const template = resolveTemplate(post.template)
    const size = sizeFor(post)
    const { width, height } = SIZES[size]

    const res = new ImageResponse(
      React.createElement(PostArtwork, {
        template,
        size,
        headline: post.hook,
        kicker: post.campaign ? (campaignName.get(post.campaign) ?? 'FLOW') : 'FLOW',
      }),
      { width, height, fonts: loaded },
    )

    const file = filename(post)
    await writeFile(path.join(OUT, file), Buffer.from(await res.arrayBuffer()))
    rendered.push({ post, file })
    process.stdout.write('.')
  }

  await writeFile(path.join(OUT, 'index.html'), reviewPage(rendered, campaignName))

  const images = rendered.filter((r) => r.file).length
  console.log(`\n\n${images} images + ${rendered.length - images} text-only posts`)
  console.log(`→ ${path.relative(process.cwd(), OUT)}/index.html`)
}

/** A single page pairing each design with both captions, for review. */
function reviewPage(
  rows: { post: PlannedPost; file: string | null }[],
  campaignName: Map<string, string>,
): string {
  const cards = rows
    .map(({ post, file }) => {
      const tags = (post.hashtags ?? []).join(' ')
      return `
      <article class="post" data-platform="${post.platform}" data-month="${post.date.slice(0, 7)}">
        <div class="art">
          ${
            file
              ? `<img src="${file}" alt="" loading="lazy">`
              : `<div class="noart"><span>Text post</span><small>No image — a LinkedIn text post should not have one</small></div>`
          }
        </div>
        <div class="copy">
          <header>
            <span class="date">${post.date}</span>
            <span class="chip">${post.platform}</span>
            <span class="chip">${post.format}</span>
            <span class="chip">${post.pillar}</span>
            ${post.campaign ? `<span class="chip hot">${esc(campaignName.get(post.campaign) ?? post.campaign)}</span>` : ''}
          </header>
          <h2>${esc(post.hook)}</h2>
          <pre class="en">${esc(post.captionEn ?? '')}</pre>
          <pre class="ar" dir="rtl">${esc(post.captionAr ?? '')}</pre>
          ${tags ? `<p class="tags">${esc(tags)}</p>` : ''}
          ${post.designBrief ? `<p class="brief"><strong>Design brief.</strong> ${esc(post.designBrief)}</p>` : ''}
        </div>
      </article>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FLOW — Sep–Dec posts</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Didact+Gothic&family=Funnel+Display:wght@400;700&display=swap">
<style>
  :root { --bone:#FBFBF7; --ink:#10231A; --muted:#55685C; --green:#143C28; --lime:#C4F075; --rule:#DEE9D0; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bone); color:var(--ink); font-family:"Didact Gothic",sans-serif; line-height:1.6; }
  .wrap { max-width:1100px; margin:0 auto; padding:48px 24px 96px; }
  h1 { font-family:"Funnel Display",sans-serif; font-size:2.4rem; letter-spacing:-.03em; margin:0 0 .25rem; }
  .lede { color:var(--muted); margin:0 0 2rem; }
  .filters { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:2rem; position:sticky; top:0; background:var(--bone); padding:12px 0; z-index:2; border-bottom:1px solid var(--rule); }
  button { font-family:"Funnel Display",sans-serif; font-weight:700; font-size:.75rem; text-transform:uppercase; letter-spacing:.08em;
           padding:6px 14px; border-radius:999px; border:1px solid var(--rule); background:transparent; color:var(--muted); cursor:pointer; }
  button[aria-pressed="true"] { background:var(--green); color:var(--bone); border-color:var(--green); }
  .post { display:grid; grid-template-columns:300px 1fr; gap:28px; padding:28px 0; border-bottom:1px solid var(--rule); }
  .post[hidden] { display:none; }
  .art img { width:100%; height:auto; border-radius:12px; border:1px solid var(--rule); display:block; }
  .noart { border:1px dashed var(--rule); border-radius:12px; padding:28px; text-align:center; color:var(--muted); display:flex; flex-direction:column; gap:6px; }
  .noart span { font-family:"Funnel Display",sans-serif; font-weight:700; color:var(--ink); }
  .noart small { font-size:.78rem; }
  header { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:.5rem; }
  .date { font-family:"Funnel Display",sans-serif; font-weight:700; }
  .chip { font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; padding:2px 8px; border-radius:999px; border:1px solid var(--rule); color:var(--muted); }
  .chip.hot { border-color:var(--lime); background:var(--lime); color:var(--green); }
  h2 { font-family:"Funnel Display",sans-serif; font-size:1.15rem; margin:.25rem 0 .75rem; letter-spacing:-.01em; }
  pre { white-space:pre-wrap; font-family:"Didact Gothic",sans-serif; font-size:.92rem; margin:0 0 .75rem;
        padding:14px 16px; border-radius:10px; background:#fff; border:1px solid var(--rule); }
  pre.ar { text-align:right; }
  .tags { color:var(--muted); font-size:.85rem; margin:0 0 .5rem; }
  .brief { color:var(--muted); font-size:.85rem; margin:0; }
  @media (max-width:760px) { .post { grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="wrap">
  <h1>Sep–Dec posts</h1>
  <p class="lede">${rows.length} written posts. Reels and carousels show their cover frame only — the remaining slides are a design brief.</p>
  <div class="filters" id="filters">
    <button data-f="all" aria-pressed="true">All</button>
    <button data-f="instagram">Instagram</button>
    <button data-f="facebook">Facebook</button>
    <button data-f="linkedin">LinkedIn</button>
    <button data-f="2026-09">September</button>
    <button data-f="2026-10">October</button>
    <button data-f="2026-11">November</button>
    <button data-f="2026-12">December</button>
  </div>
  ${cards}
</div>
<script>
  const posts = [...document.querySelectorAll('.post')]
  document.getElementById('filters').addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return
    document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)))
    const f = btn.dataset.f
    posts.forEach(p => {
      p.hidden = f !== 'all' && p.dataset.platform !== f && p.dataset.month !== f
    })
  })
</script>
</body>
</html>`
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack : e)
  process.exit(1)
})
