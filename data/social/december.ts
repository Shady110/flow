import type { PlannedPost } from './types'

/**
 * December 2026 — "Christmas & start January right."
 *
 * Two jobs running in parallel. The consumer-facing half serves gifting
 * categories, where the buyer is not the user and the description has to do
 * work the product photo cannot. The commercial half sells annual retainers
 * while next-year budgets are being set — which is the one month of the year
 * that conversation is welcome rather than premature.
 *
 * November's restraint is what pays for this. Having sold nothing into the
 * season, the January ask lands as continuity rather than opportunism.
 */
export const DECEMBER: PlannedPost[] = [
  // ── Week 1 — the year in review, honestly ───────────────────────────────
  {
    date: '2026-12-01',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'year-end',
    hook: 'The year in products',
    captionEn: `Everything we shot this year, in one grid.

Eight categories, four marketplaces, one lighting standard held across all of it.

We are not going to dress this up with growth percentages. The number that matters to us is that every one of these went live on a real seller's account and is still there.`,
    captionAr: `كل اللي صورناه السنة دي، في شبكة واحدة.

تمن فئات، أربع منصات، معيار إضاءة واحد محافظين عليه في الكل.

مش هنلبّس ده نسب نمو. الرقم اللي بيفرق معانا إن كل واحد فيهم نزل على حساب بائع حقيقي ولسه موجود.`,
    hashtags: ['#yearinreview', '#productphotography', '#تصوير_منتجات', '#ecommerceegypt'],
    designBrief:
      'Dense full-year grid pulled from portfolioData. Same crop and margin throughout — the uniformity across a whole year is the proof.',
    template: 'carousel-categories',
  },
  {
    date: '2026-12-01',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'article',
    campaign: 'year-end',
    hook: 'The case for booking catalogue work in January',
    captionEn: `A short commercial argument, made plainly, because December is when next year's budgets get set.

Catalogue content compounds. A listing improved in January accumulates behavioural history through eleven months of trading before the next season arrives. The same listing improved in October has four weeks.

That is the whole case. It is not a discount and it is not urgency — it is arithmetic about how marketplace ranking works.

What it means practically: the cheapest time to fix your catalogue is the point furthest from the season, and the most expensive time is the point closest to it. Most sellers do the opposite, which is why October is the busiest month in every studio in Cairo and January is the quietest.

We are opening January scoping now. Free, twenty minutes, and you leave with a shortlist and a number whether or not you book.

And the standing caveats, unchanged: we will not quote a delivery date before production has seen your volume, and we will not promise you a ranking. Nobody honest does.`,
    captionAr: `حجة تجارية قصيرة، بصراحة، لأن ديسمبر هو وقت تحديد ميزانيات السنة الجاية.

محتوى الكتالوج بيتراكم. الصفحة اللي بتتحسن في يناير بتبني تاريخ سلوكي على مدار ١١ شهر تداول قبل ما الموسم الجاي ييجي. نفس الصفحة لو اتحسنت في أكتوبر عندها أربع أسابيع.

دي الحجة كلها. مش خصم ولا استعجال — دي حسبة عن طريقة عمل الترتيب في المتاجر الإلكترونية.

ومعناها عمليًا: أرخص وقت تصلّح فيه كتالوجك هو أبعد نقطة عن الموسم، وأغلى وقت هو أقرب نقطة ليه. أغلب البائعين بيعملوا العكس، وده سبب إن أكتوبر أزحم شهر في كل استوديو في القاهرة ويناير أهدأ شهر.

بنفتح تحديد نطاق يناير دلوقتي. مجانًا، عشرين دقيقة، وهتمشي بقايمة قصيرة ورقم سواء حجزت أو لأ.

والتحفظات الثابتة زي ما هي: مش هنحدد تاريخ تسليم قبل ما الإنتاج يشوف حجم شغلك، ومش هنوعدك بترتيب معين. مفيش حد أمين بيعمل ده.`,
    designBrief:
      'Dark 1200×627: two bars, one labelled January running eleven months, one labelled October running four. The comparison is the argument.',
    template: 'quote-dark',
  },
  {
    date: '2026-12-02',
    platform: 'facebook',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'year-end',
    hook: 'Gifting listings have a different reader',
    captionEn: `In December the person buying your product is often not the person using it. That changes what the listing has to do.

A gift buyer cannot judge whether the size is right, whether the material is good, or whether the recipient already has one. They are buying on your description's ability to reassure them.

What to add for gifting season:
— Explicit dimensions, not "medium"
— What is in the box, photographed
— Whether it arrives in packaging worth giving
— Return window stated clearly — gift buyers check this before ordering

Every one of those removes a reason not to buy.`,
    captionAr: `في ديسمبر، الشخص اللي بيشتري منتجك غالبًا مش هو اللي هيستخدمه. وده بيغيّر شغل الصفحة.

مشتري الهدية مش قادر يحكم إذا كان المقاس مناسب، ولا الخامة كويسة، ولا المستلم عنده واحدة أصلًا. هو بيشتري على قدرة وصفك إنه يطمّنه.

اللي تضيفه لموسم الهدايا:
— أبعاد صريحة، مش "وسط"
— محتويات العلبة، متصورة
— هل بيوصل في تغليف يستاهل يتهدى
— مدة الإرجاع مكتوبة بوضوح — مشتري الهدية بيراجعها قبل ما يطلب

كل واحدة فيهم بتشيل سبب لعدم الشرا.`,
    hashtags: ['#christmas', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Four slides, one addition each, illustrated with a real gift-suitable product from the portfolio.',
    template: 'carousel-teach',
  },
  {
    date: '2026-12-03',
    platform: 'instagram',
    pillar: 'teach',
    format: 'reel',
    campaign: 'year-end',
    hook: 'Photographing packaging as part of the product',
    captionEn: `For gifting, the box is part of the product.

A shopper deciding between two similar items will pick the one that looks like it arrives ready to give. If your packaging is good, photograph it. If it is a plain brown box, that is worth knowing too — say so, and let them plan.`,
    captionAr: `في الهدايا، العلبة جزء من المنتج.

المشتري اللي بيختار بين منتجين متشابهين هيختار اللي شكله بيوصل جاهز للإهداء. لو تغليفك حلو، صوّره. ولو علبة كرتون سادة، ده كمان يستاهل يتعرف — قوله، وسيبه يرتب.`,
    hashtags: ['#packaging', '#تصوير_منتجات', '#christmas'],
    designBrief: 'Reel: unboxing a real client product, shot as product photography rather than as a vlog.',
    template: 'reel-process',
  },
  {
    date: '2026-12-05',
    platform: 'instagram',
    pillar: 'proof',
    format: 'static',
    campaign: 'year-end',
    hook: 'Toys and gifting: the category December is built on',
    designBrief:
      'Real toys-category work from the portfolio. Write closer to the date so it can reference actual seasonal listings.',
    template: 'stat-card',
  },

  // ── Week 2 — 12.12 and the retainer conversation ────────────────────────
  {
    date: '2026-12-06',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'year-end',
    hook: 'January scoping is open',
    captionEn: `January scoping is open.

Why now rather than January: work booked this month starts in the first week of the year. A catalogue fixed in January has eleven months to build before the next season. Fixed in October, it has four weeks.

That is the only reason we are asking, and it is a real one.

Twenty minutes, free, and we will tell you honestly if your content is fine and the problem is somewhere else.`,
    captionAr: `تحديد نطاق يناير مفتوح.

ليه دلوقتي مش في يناير: الشغل المحجوز الشهر ده بيبدأ أول أسبوع في السنة. الكتالوج اللي بيتصلّح في يناير قدامه ١١ شهر يبني قبل الموسم الجاي. لو اتصلّح في أكتوبر، قدامه أربع أسابيع.

ده السبب الوحيد اللي بنطلب عشانه، وهو سبب حقيقي.

عشرين دقيقة، مجانًا، وهنقول لك بصراحة لو المحتوى بتاعك كويس والمشكلة في حتة تانية.`,
    hashtags: ['#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Offer-dark with the eleven-vs-four-months bar comparison carried over from the LinkedIn card.',
    template: 'offer-dark',
  },
  {
    date: '2026-12-07',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'article',
    campaign: 'year-end',
    hook: 'What the season taught us about Egyptian marketplace content',
    designBrief:
      'Written from what actually happened in November. Patterns and observations only — no client numbers, no invented results.',
  },
  {
    date: '2026-12-09',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'year-end',
    hook: 'Your post-season catalogue audit, in six checks',
    captionEn: `The season is the only honest test your catalogue gets. Run these while the data is fresh.

□ Which listings converted above your average — what was different?
□ Which got traffic but no orders — that is a listing problem, not a demand problem
□ Which questions came up repeatedly in Q&A?
□ Which products sold out, and did the listing recover its position?
□ Which returns cited "not as described"?
□ Which of your categories looked weakest next to competitors?

Those six answers are next year's content brief. Write them down before December blurs.`,
    captionAr: `الموسم هو الاختبار الأمين الوحيد اللي كتالوجك بياخده. اعمل ده والبيانات لسه طازة.

□ أنهي صفحات حوّلت أعلى من متوسطك — إيه اللي كان مختلف فيها؟
□ أنهي صفحات جالها ترافيك من غير أوردرات — دي مشكلة صفحة، مش مشكلة طلب
□ أنهي أسئلة اتكررت في قسم الأسئلة؟
□ أنهي منتجات خلص مخزونها، والصفحة رجعت مركزها ولا لأ؟
□ أنهي مرتجعات كان سببها "مش زي الوصف"؟
□ أنهي فئة عندك بانت أضعف حاجة جنب المنافسين؟

الست إجابات دول هما بريف محتوى السنة الجاية. اكتبهم قبل ما ديسمبر يختلط عليك.`,
    hashtags: ['#ecommerceegypt', '#amazonseller', '#تجارة_الكترونية'],
    designBrief: 'Saveable six-row checklist, closing the checklist series that ran through the quarter.',
    template: 'checklist',
  },
  {
    date: '2026-12-10',
    platform: 'instagram',
    pillar: 'process',
    format: 'reel',
    hook: 'How a retainer month actually runs',
    designBrief:
      'Reel walking through a month of account management: uploads, updates, compliance, reporting. Grounded in handbook §4.4.',
    template: 'reel-process',
  },
  {
    date: '2026-12-12',
    platform: 'instagram',
    pillar: 'pulse',
    format: 'static',
    campaign: 'year-end',
    hook: '12.12 — the last spike of the year',
    designBrief: 'Date card matching the 11.11 treatment so the pair reads as a series. Minimal, no offer.',
    template: 'statement-dark',
  },

  // ── Week 3 — Christmas ──────────────────────────────────────────────────
  {
    date: '2026-12-13',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    campaign: 'year-end',
    hook: 'Delivery cut-off dates belong in your listing',
    captionEn: `If there is a date after which you cannot guarantee delivery before Christmas, put it in the listing. Not in a story, not in your bio — in the listing, where the buyer is deciding.

Sellers avoid this because it feels like discouraging a sale. It does the opposite. A stated cut-off converts the people who are in time and prevents the refund, the complaint and the one-star review from the people who are not.

Honesty about delivery is a conversion feature.`,
    captionAr: `لو فيه تاريخ بعده مش هتقدر تضمن التوصيل قبل الكريسماس، حطه في صفحة المنتج. مش في ستوري، ولا في البايو — في الصفحة، المكان اللي المشتري بيقرر فيه.

البائعين بيتجنبوا ده لأنه بيحس إنه بيثبّط البيعة. وهو بيعمل العكس. التاريخ المعلن بيبيع للناس اللي لحقت، وبيمنع الاسترجاع والشكوى وتقييم النجمة الواحدة من اللي ملحقوش.

الصراحة في الشحن ميزة بيعية.`,
    hashtags: ['#christmas', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Listing mockup with the cut-off line highlighted in lime where a buyer actually sees it.',
    template: 'annotated-ui',
  },
  {
    date: '2026-12-15',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'year-end',
    hook: 'Gift-ready listings we shot this quarter',
    designBrief: 'Real gifting-suitable products from the season batches, shown as live listings.',
    template: 'carousel-categories',
  },
  {
    date: '2026-12-16',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'year-end',
    hook: 'Last scoping slots before the break',
    designBrief:
      'Short post: remaining December scoping availability before the studio closes. Confirm real dates first.',
  },
  {
    date: '2026-12-17',
    platform: 'instagram',
    pillar: 'teach',
    format: 'reel',
    hook: 'One frame that answers "will it arrive looking like this?"',
    designBrief: 'Reel on packaging and presentation photography for gift buyers.',
    template: 'reel-process',
  },
  {
    date: '2026-12-20',
    platform: 'facebook',
    pillar: 'pulse',
    format: 'static',
    hook: 'Last week before the holiday — service over content',
    designBrief: 'Short goodwill post. Same register as the season-opening post on 30 October.',
    template: 'statement-dark',
  },

  // ── Week 4 — close the year ─────────────────────────────────────────────
  {
    date: '2026-12-25',
    platform: 'instagram',
    pillar: 'pulse',
    format: 'static',
    campaign: 'year-end',
    hook: 'Christmas — no pitch',
    captionEn: `Merry Christmas from all of us at FLOW.

No offer on this one. Thank you to every seller who trusted us with their catalogue this year — we know handing over your products is not a small thing.`,
    captionAr: `كل سنة وإنتم طيبين من كل الفريق في FLOW.

مفيش أي عرض في البوست ده. شكرًا لكل بائع ائتمننا على كتالوجه السنة دي — إحنا عارفين إن تسليم منتجاتك لحد مش حاجة بسيطة.`,
    hashtags: ['#christmas', '#ecommerceegypt'],
    designBrief:
      'Warm, quiet, brand-only. Lockup, one line, lime rule. No CTA, no link, no product. Restraint is the message.',
    template: 'statement-dark',
  },
  {
    date: '2026-12-27',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'year-end',
    hook: 'The numbers we will actually stand behind',
    captionEn: `Our year, in numbers we can prove.

210+ products photographed and published. Eight categories. Four marketplaces. One lighting standard.

You will notice there is no growth percentage and no client revenue figure in that list. That is deliberate — we do not publish numbers that belong to our clients, and we do not guarantee results, so we are not going to imply them in a year-in-review post either.

What we can show you is the work. It is all on the site.`,
    captionAr: `سنتنا، بأرقام نقدر نثبتها.

أكتر من ٢١٠ منتج اتصوروا واتنشروا. تمن فئات. أربع منصات. معيار إضاءة واحد.

هتلاحظ إن مفيش نسبة نمو ولا رقم إيرادات عميل في الليستة دي. وده مقصود — إحنا مبننشرش أرقام بتخص عملاءنا، ومبنضمنش نتايج، فمش هنلمّح ليها في بوست مراجعة سنة كمان.

اللي نقدر نوريهولك هو الشغل. كله على الموقع.`,
    hashtags: ['#yearinreview', '#ecommerceegypt', '#تصوير_منتجات'],
    designBrief: 'Stat card with the four true figures, matching the site hero stats treatment exactly.',
    template: 'stat-card',
  },
  {
    date: '2026-12-29',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'year-end',
    hook: 'What we are doing differently next year',
    designBrief:
      'Honest year-end reflection plus the January scoping ask. Write in the final week so it reflects the actual year.',
  },
  {
    date: '2026-12-31',
    platform: 'instagram',
    pillar: 'pulse',
    format: 'static',
    campaign: 'year-end',
    hook: 'New Year — see you in January',
    captionEn: `That is the year.

Thank you to every seller who let us near their catalogue, and to everyone who asked us a question in the comments and never bought anything — you kept us honest.

January scoping is open. But not tonight.`,
    captionAr: `وكده السنة خلصت.

شكرًا لكل بائع سمح لنا نقرب من كتالوجه، ولكل حد سألنا سؤال في الكومنتات ومشتراش حاجة أبدًا — إنتم اللي خليتونا نفضل صادقين.

تحديد نطاق يناير مفتوح. بس مش الليلة.`,
    hashtags: ['#newyear', '#ecommerceegypt'],
    designBrief: 'Quiet close. Wordmark, one line, dark panel. Matches the Christmas card so the pair bookends the year.',
    template: 'statement-dark',
  },
]
