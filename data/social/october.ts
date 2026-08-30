import type { PlannedPost } from './types'

/**
 * October 2026 — "Book your Q4 catalogue." The conversion peak.
 *
 * This is the month the whole plan is built around. Sellers still have runway;
 * by November they are handling orders, not hiring an agency. So the offer
 * pillar carries roughly a third of the month here, against three times a month
 * everywhere else.
 *
 * Urgency comes from a published booking cut-off — a capacity fact we control —
 * never from a delivery promise, which handbook §6 forbids without production
 * sign-off. The cut-off date below is a placeholder: set it from real studio
 * capacity before anything ships.
 */

/** Set from real production capacity. Referenced by several captions. */
export const BOOKING_CUTOFF = '2026-10-23'

export const OCTOBER: PlannedPost[] = [
  // ── Week 1 — state the deadline ─────────────────────────────────────────
  {
    date: '2026-10-01',
    platform: 'instagram',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'October opens — the booking cut-off',
    captionEn: `October. The month your Q4 gets decided.

We are taking catalogue bookings until 23 October. After that date anything we accept goes into a queue that lands after the season starts, which helps nobody.

That is a capacity limit, not a sales tactic — the studio shoots at a fixed rate and we would rather turn work away than take it and disappoint.

Scoping is free and takes one call.`,
    captionAr: `أكتوبر. الشهر اللي بيتحدد فيه ربعك الأخير.

بناخد حجوزات كتالوجات لحد ٢٣ أكتوبر. بعد التاريخ ده أي شغل نقبله هيدخل طابور هيوصل بعد ما الموسم يبدأ، وده مش هيفيد حد.

ده حد طاقة إنتاجية، مش أسلوب بيع — الاستوديو بيصور بمعدل ثابت، ونفضّل نرفض شغل على إننا ناخده ونخيّب الظن.

تحديد النطاق مجاني وبياخد مكالمة واحدة.`,
    hashtags: ['#ecommerceegypt', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Dark offer card, the date set at display size in lime. One line of supporting copy only.',
    template: 'offer-dark',
  },
  {
    date: '2026-10-01',
    platform: 'linkedin',
    pillar: 'teach',
    format: 'article',
    campaign: 'q4-ready',
    hook: 'How to choose which products get the budget',
    captionEn: `If you cannot rebuild your whole catalogue before the season — and almost nobody can — the question becomes which products get the budget.

The instinct is to fix the worst performers. That is usually wrong.

A product that sells badly may be selling badly because of demand, price, or competition, none of which better photography fixes. Money spent there buys you a nicer-looking product that still does not sell.

The products worth the investment are the ones already converting despite poor presentation. They have proven there is demand. Improving how they are presented compounds against something that already works, rather than trying to manufacture something that does not.

The practical test: sort by units sold, not by margin or by how much you personally like the product. Take the top five. Look at their images as a stranger would. That is your list, and it is usually shorter and cheaper than people expect.

We do this scoping conversation free, and we will tell you if the answer is that your content is fine and the problem is elsewhere.`,
    captionAr: `لو مش قادر تعيد بناء الكتالوج كله قبل الموسم — وده تقريبًا مستحيل — السؤال بيبقى أنهي منتجات تاخد الميزانية.

الغريزة بتقول صلّح الأسوأ أداءً. وده غالبًا غلط.

المنتج اللي بيبيع وحش ممكن يكون بيبيع وحش بسبب الطلب أو السعر أو المنافسة، ومفيش واحدة فيهم التصوير الأحسن بيحلها. الفلوس المصروفة هناك بتجيب لك منتج شكله أحلى وبرضه مش بيبيع.

المنتجات اللي تستاهل الاستثمار هي اللي بتحوّل بالفعل رغم العرض الضعيف. دول أثبتوا إن فيه طلب. تحسين طريقة عرضهم بيتراكم على حاجة شغالة أصلًا، بدل محاولة تصنيع حاجة مش شغالة.

الاختبار العملي: رتّب بعدد القطع المباعة، مش بالهامش ولا بحبك الشخصي للمنتج. خد أعلى خمسة. بص على صورهم بعين غريب. دي ليستتك، وغالبًا أقصر وأرخص مما الناس تتوقع.

بنعمل مكالمة تحديد النطاق دي مجانًا، وهنقول لك لو الإجابة إن المحتوى بتاعك كويس والمشكلة في حتة تانية.`,
    designBrief: 'Dark 1200×627: a sorted bar list with the top five highlighted lime, the tail greyed.',
    template: 'quote-dark',
  },
  {
    date: '2026-10-02',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'What a scoping call actually covers',
    captionEn: `"Scoping call" sounds like a sales meeting. It is not.

Twenty minutes. You show us the products carrying your season. We tell you how much work each one actually needs, which ones do not need us at all, and roughly what the batch costs.

You leave with a number and a shortlist whether or not you book.

The reason we do it free: half the sellers who talk to us need less than they assumed, and we would rather be the people who told them that.`,
    captionAr: `"مكالمة تحديد نطاق" اسمها بيوحي باجتماع مبيعات. وهي مش كده.

عشرين دقيقة. تورينا المنتجات اللي شايلة موسمك. ونقول لك كل واحد محتاج شغل قد إيه فعلًا، وأنهي منتجات مش محتاجانا خالص، والباتش هيكلف تقريبًا كام.

هتمشي ومعاك رقم وقايمة قصيرة، سواء حجزت أو لأ.

سبب إننا بنعملها مجانًا: نص البائعين اللي بيكلمونا محتاجين أقل مما افترضوا، ونفضّل نبقى إحنا اللي قلنا لهم كده.`,
    hashtags: ['#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Light ground, three numbered rows of what the call covers. Plain and legible.',
    template: 'carousel-teach',
  },
  {
    date: '2026-10-03',
    platform: 'instagram',
    pillar: 'proof',
    format: 'reel',
    campaign: 'q4-ready',
    hook: 'A season batch, start to finish',
    captionEn: `What a season batch looks like on our side.

Products in, shot against one standard, retouched, written twice, keyworded per platform, formatted to each marketplace's spec, published.

The reason it moves is that none of those steps waits for a different supplier to reply.`,
    captionAr: `شكل باتش الموسم من ناحيتنا.

المنتجات بتدخل، تتصور على معيار واحد، تتعمل ريتاتش، تتكتب مرتين، تتحطلها كلمات مفتاحية لكل منصة، تتظبط على مواصفات كل متجر، تتنشر.

سبب إنها بتتحرك إن مفيش خطوة فيهم بتستنى مورد تاني يرد.`,
    hashtags: ['#behindthescenes', '#productphotography', '#تصوير_منتجات'],
    designBrief: 'Fast-cut studio reel of a real batch. Counter overlay ticking product count up.',
    template: 'reel-process',
  },
  {
    date: '2026-10-04',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'Season listings need different copy',
    captionEn: `Your everyday listing and your season listing are not the same document.

Everyday: explain the product, answer objections, build confidence over time.

Season: the shopper is comparing four tabs and deciding in seconds. Lead with the differentiator, put the deal-breaker spec in the first bullet, and stop making them scroll for the thing they are comparing on.

Same product. Different reader. Different pressure.`,
    captionAr: `صفحة منتجك العادية وصفحة الموسم مش نفس المستند.

العادية: تشرح المنتج، ترد على الاعتراضات، تبني ثقة مع الوقت.

الموسم: المشتري بيقارن أربع تابات وبيقرر في ثواني. ابدأ بالميزة الفارقة، وحط المواصفة الحاسمة في أول سطر، وبطّل تخليه يسكرول عشان يوصل للحاجة اللي بيقارن عليها.

نفس المنتج. قارئ مختلف. ضغط مختلف.`,
    hashtags: ['#amazonseller', '#noonseller', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Side-by-side bullet lists, everyday vs season, with the reordering shown by lime arrows.',
    template: 'compare-2up',
  },
  {
    date: '2026-10-05',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Do not change your main image mid-season',
    captionEn: `A warning that costs sellers every year: do not swap your hero image in the middle of the season.

Changing the main image on a listing that is already converting resets how shoppers recognise it, breaks any ad creative pointing at it, and on some platforms triggers a fresh compliance check — which can take your listing down at the worst possible moment.

If the hero needs fixing, fix it now. Once traffic arrives, leave it alone.`,
    captionAr: `تحذير بيكلّف البائعين كل سنة: متغيّرش الصورة الرئيسية في نص الموسم.

تغيير الصورة الرئيسية لصفحة بتحوّل بالفعل بيصفّر طريقة تعرّف المشترين عليها، وبيكسر أي إعلان مأشّر عليها، وعلى بعض المنصات بيشغّل فحص مطابقة جديد — اللي ممكن ينزّل صفحتك في أسوأ توقيت ممكن.

لو الصورة الرئيسية محتاجة إصلاح، صلّحها دلوقتي. أول ما الترافيك ييجي، سيبها.`,
    hashtags: ['#amazonseller', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Warning card. Dark panel, one struck-through swap icon, short rule beneath.',
    template: 'statement-dark',
  },
  {
    date: '2026-10-05',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'q4-ready',
    hook: 'Booking cut-off, stated plainly',
    captionEn: `We close Q4 catalogue bookings on 23 October.

Being plain about why: photography has a fixed physical throughput. Past a certain point, taking another batch means either delivering it after the season is underway or compressing everyone else's. Neither is a service.

So the cut-off is real, and it is the only urgency we will put in front of you. We are not going to promise you a turnaround date to close a deal — production confirms dates, not sales.

If Q4 content is on your list, a scoping conversation this week is the useful move.`,
    captionAr: `بنقفل حجوزات كتالوجات الربع الأخير يوم ٢٣ أكتوبر.

وبصراحة السبب: التصوير ليه طاقة إنتاجية مادية ثابتة. بعد نقطة معينة، قبول باتش زيادة يعني إما تسليمه بعد ما الموسم يبدأ أو ضغط شغل باقي العملاء. ولا واحدة من دول خدمة.

فالموعد النهائي حقيقي، وهو الاستعجال الوحيد اللي هنحطه قدامك. مش هنوعدك بتاريخ تسليم عشان نقفل صفقة — الإنتاج هو اللي بيأكد التواريخ، مش المبيعات.

لو محتوى الربع الأخير على قايمتك، مكالمة تحديد نطاق الأسبوع ده هي الخطوة المفيدة.`,
    designBrief: 'Text-only.',
  },

  // ── Week 2 — proof under pressure ───────────────────────────────────────
  {
    date: '2026-10-06',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'Electronics: the category with the least forgiveness',
    captionEn: `Electronics shoppers zoom. Every time.

They want the port, the cable, the connector, the exact model marking. A hero shot and three lifestyle images will not close it, because the question they are actually asking is "is this the right one".

For this category we shoot the details as the main event, not the garnish.`,
    captionAr: `مشتري الإلكترونيات بيكبّر الصورة. كل مرة.

عايز يشوف المدخل والسلك والوصلة وعلامة الموديل بالظبط. صورة رئيسية وتلات صور لايف ستايل مش هيقفلوا البيعة، لأن السؤال الحقيقي اللي بيسأله هو "ده الموديل الصح ولا لأ".

في الفئة دي بنصور التفاصيل كحدث رئيسي، مش كزينة.`,
    hashtags: ['#electronics', '#productphotography', '#ecommerceegypt', '#تصوير_منتجات'],
    designBrief: 'Real electronics portfolio set, with a zoom crop on the connector detail as slide 2.',
    template: 'carousel-categories',
  },
  {
    date: '2026-10-07',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Two weeks to the cut-off',
    captionEn: `Just over two weeks until we close Q4 bookings on 23 October.

If you have been meaning to sort your season products out, this is the part of the year where "meaning to" turns into "did not".

Free scoping, twenty minutes, and you leave with a number either way.`,
    captionAr: `أكتر من أسبوعين بشوية على قفل حجوزات الربع الأخير يوم ٢٣ أكتوبر.

لو كنت ناوي تظبط منتجات موسمك، ده وقت السنة اللي "ناوي" بتتحول فيه لـ"معملتش".

تحديد نطاق مجاني، عشرين دقيقة، وهتمشي ومعاك رقم في كل الأحوال.`,
    hashtags: ['#ecommerceegypt', '#whitefriday'],
    designBrief: 'Countdown card with the days remaining as the display figure.',
    template: 'offer-dark',
  },
  {
    date: '2026-10-08',
    platform: 'instagram',
    pillar: 'process',
    format: 'reel',
    campaign: 'q4-ready',
    hook: 'The review pass nobody sees',
    captionEn: `The step clients never see, and the one that decides whether the batch is any good.

Every title, image and description gets read by a person before it goes live. Not skimmed — read, against the destination platform's current rules.

It is slow, it is unglamorous, and it is the difference between a catalogue and a folder of files.`,
    captionAr: `الخطوة اللي العملاء عمرهم ما بيشوفوها، وهي اللي بتحدد لو الباتش كويس ولا لأ.

كل عنوان وصورة ووصف بيتقرا من شخص قبل ما ينزل. مش تصفّح — قراية، على قواعد المنصة المستهدفة الحالية.

بطيئة، وشكلها مش حلو، وهي الفرق بين كتالوج وبين فولدر فيه ملفات.`,
    hashtags: ['#behindthescenes', '#ecommerceegypt'],
    designBrief: 'Over-the-shoulder of the review pass, checklist ticking on screen.',
    template: 'reel-process',
  },
  {
    date: '2026-10-08',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'article',
    campaign: 'q4-ready',
    hook: 'The real cost of a rejected listing in October',
    captionEn: `A listing rejection in March costs you a day of admin. The same rejection in late October can cost you the season.

The arithmetic is simple and sellers rarely do it. A rejection means a fix, a resubmission and a fresh review queue. Do that twice on the same product — which is common, because the second submission often fixes the flagged issue and trips a different one — and you are three weeks from where you started.

Three weeks in October is the difference between a listing that has accumulated some history before traffic arrives and one that goes live cold into the busiest week of the year.

This is the entire argument for doing content work early, and it has nothing to do with anyone's studio being busy. It is that the platforms sit between you and your listing being live, and their queues do not care about your season.

Build to spec first time. It is cheaper than being right on appeal.`,
    captionAr: `رفض صفحة منتج في مارس بيكلفك يوم شغل إداري. نفس الرفض في آخر أكتوبر ممكن يكلفك الموسم.

الحسبة بسيطة والبائعين نادرًا ما بيعملوها. الرفض يعني إصلاح، وإعادة تقديم، وطابور مراجعة جديد. اعمل كده مرتين على نفس المنتج — وده شائع، لأن التقديم التاني غالبًا بيصلّح المشكلة المذكورة ويقع في واحدة تانية — وهتلاقي نفسك بعيد تلات أسابيع عن نقطة البداية.

تلات أسابيع في أكتوبر هي الفرق بين صفحة بنت شوية تاريخ قبل وصول الترافيك، وصفحة نزلت من غير أي تاريخ في أزحم أسبوع في السنة.

دي الحجة كلها لعمل شغل المحتوى بدري، ومالهاش علاقة بإن استوديو حد مزحوم. السبب إن المنصات واقفة بينك وبين إن صفحتك تكون شغالة، وطوابيرهم مش فارق معاها موسمك.

ابنِ على المواصفات من أول مرة. أرخص من إنك تكون على حق في الاستئناف.`,
    designBrief: 'Dark 1200×627: a three-week gap rendered as a timeline slip.',
    template: 'quote-dark',
  },
  {
    date: '2026-10-09',
    platform: 'facebook',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'Before and after, home category',
    captionEn: `Home products photographed on a kitchen counter versus photographed properly.

The first version is not lazy — the seller took it themselves and it took real effort. It just does not survive next to a competitor who shot theirs on white.

That is the whole problem with marketplace grids: you are never judged alone.`,
    captionAr: `منتجات منزلية متصورة على رخامة مطبخ، مقابل متصورة صح.

النسخة الأولى مش كسل — البائع صورها بنفسه وبذل مجهود حقيقي. بس هي مش بتصمد جنب منافس صوّر بتاعه على أبيض.

دي المشكلة كلها في شبكات المتاجر: إنت عمرك ما بتتحكم عليك لوحدك.`,
    hashtags: ['#beforeandafter', '#تصوير_منتجات', '#ecommerceegypt'],
    designBrief: 'Real before/after from the home category, then a mock grid showing both against competitors.',
    template: 'compare-2up',
  },
  {
    date: '2026-10-10',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'Pricing your season listing without destroying your margin',
    captionEn: `Not our department, but the mistake is so common it affects the content we produce.

Sellers discount the product and leave the listing unchanged. The images and copy still sell it as a premium item while the price says otherwise, and the mismatch reads as "something is wrong with this".

If you are discounting for the season, say why in the listing. Seasonal offer, bundle, clearance of last year's colour — a stated reason converts. An unexplained price drop creates suspicion.`,
    captionAr: `مش تخصصنا، بس الغلطة دي شائعة لدرجة إنها بتأثر على المحتوى اللي بننتجه.

البائعين بيخفّضوا سعر المنتج وبيسيبوا الصفحة زي ما هي. الصور والنصوص لسه بتبيعه كمنتج مميز والسعر بيقول العكس، والتضارب ده بيتقري كـ"فيه حاجة غلط في المنتج ده".

لو بتخفّض للموسم، قول السبب في الصفحة. عرض موسمي، أو باقة، أو تصفية لون السنة اللي فاتت — السبب المعلن بيبيع. تخفيض السعر من غير تفسير بيخلق شك.`,
    hashtags: ['#whitefriday', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Two listing mockups: unexplained discount vs stated reason, with the trust signal called out.',
    template: 'compare-2up',
  },
  {
    date: '2026-10-11',
    platform: 'instagram',
    pillar: 'offer',
    format: 'story',
    campaign: 'q4-ready',
    hook: 'Cut-off countdown sticker',
    captionEn: `12 days to the 23 October booking cut-off. Link in bio to book scoping.`,
    captionAr: `١٢ يوم على موعد قفل الحجز في ٢٣ أكتوبر. اللينك في البايو لحجز تحديد النطاق.`,
    designBrief: 'Story with a native countdown sticker set to the cut-off, plus link sticker.',
  },
  {
    date: '2026-10-12',
    platform: 'instagram',
    pillar: 'proof',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Cosmetics: colour accuracy is the whole job',
    captionEn: `In cosmetics, the photograph is a promise about colour. Get it wrong and you do not get a return — you get a review saying the shade is nothing like the picture, and that review outlives the product.

Colour-accurate lighting, a calibrated screen, and a person checking the swatch against the physical product. Every time.`,
    captionAr: `في مستحضرات التجميل، الصورة وعد بخصوص اللون. لو غلط، مش هتاخد مرتجع — هتاخد تقييم بيقول إن الدرجة مالهاش علاقة بالصورة، والتقييم ده بيعيش أطول من المنتج.

إضاءة دقيقة اللون، وشاشة معايرة، وشخص بيقارن العينة بالمنتج الحقيقي. في كل مرة.`,
    hashtags: ['#cosmetics', '#productphotography', '#تصوير_منتجات'],
    designBrief: 'Real cosmetics shot with a colour swatch strip alongside.',
    template: 'stat-card',
  },
  {
    date: '2026-10-13',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Bundle listings: one product or several?',
    captionEn: `Season bundles get built wrong constantly.

If the bundle is the thing you want to sell, it needs its own listing, its own images showing everything included, and its own title. Adding "+ free gift" to an existing title does not create a bundle — it creates a confusing listing that converts worse than either product alone.

A bundle is a product. Photograph it as one.`,
    captionAr: `باقات الموسم بتتبني غلط باستمرار.

لو الباقة هي اللي عايز تبيعها، فهي محتاجة صفحة خاصة بيها، وصور بتوري كل اللي جواها، وعنوان خاص بيها. إضافة "+ هدية مجانية" لعنوان موجود مش بتعمل باقة — بتعمل صفحة مربكة بتحوّل أقل من أي منتج فيهم لوحده.

الباقة منتج. صوّرها كمنتج.`,
    hashtags: ['#whitefriday', '#amazonseller', '#تجارة_الكترونية'],
    designBrief: 'Bundle laid flat with every component visible and labelled.',
    template: 'annotated-ui',
  },

  // ── Week 3 — close ──────────────────────────────────────────────────────
  {
    date: '2026-10-14',
    platform: 'instagram',
    pillar: 'offer',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'What a batch costs, in plain numbers',
    captionEn: `The question everyone asks and few agencies answer publicly.

Per item: 10 EGP listing copy, 30 EGP photography, 35 EGP for both in one brief.

Monthly, if you would rather we ran it: Starter 3,500 EGP covering up to 50 products, Growth 8,000 EGP up to 150.

Those are the real numbers, on our website, unchanged whether you ask us in October or March.

What we cannot tell you before scoping is how long your batch takes. Volume and category decide that, and production confirms it — not us on a post.`,
    captionAr: `السؤال اللي الكل بيسأله وقليل من الوكالات بترد عليه علنًا.

بالقطعة: ١٠ جنيه نص الصفحة، ٣٠ جنيه التصوير، ٣٥ جنيه للاتنين في بريف واحد.

شهريًا، لو تفضّل إننا ندير الموضوع: ستارتر ٣٥٠٠ جنيه لحد ٥٠ منتج، جروث ٨٠٠٠ جنيه لحد ١٥٠.

دي الأرقام الحقيقية، موجودة على موقعنا، وثابتة سواء سألتنا في أكتوبر أو مارس.

اللي مش هنقدر نقوله قبل تحديد النطاق هو الباتش بتاعك هياخد قد إيه. الحجم والفئة بيحددوا ده، والإنتاج بيأكده — مش إحنا في بوست.`,
    hashtags: ['#ecommerceegypt', '#تجارة_الكترونية', '#amazoneg'],
    designBrief: 'Price cards rendered exactly as on /pricing so the numbers read as native to the brand.',
    template: 'price-card',
  },
  {
    date: '2026-10-15',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'One week to the cut-off',
    captionEn: `One week until 23 October, when we close Q4 catalogue bookings.

If your season depends on a handful of products, this is the last comfortable moment to deal with it.

Free scoping. Twenty minutes. A number either way.`,
    captionAr: `أسبوع واحد على ٢٣ أكتوبر، معاد قفل حجوزات كتالوجات الربع الأخير.

لو موسمك متوقف على كام منتج، دي آخر لحظة مريحة تتعامل معاها.

تحديد نطاق مجاني. عشرين دقيقة. ورقم في كل الأحوال.`,
    hashtags: ['#ecommerceegypt', '#whitefriday'],
    designBrief: 'Countdown, larger figure, minimal copy.',
    template: 'offer-dark',
  },
  {
    date: '2026-10-15',
    platform: 'linkedin',
    pillar: 'process',
    format: 'text',
    campaign: 'q4-ready',
    hook: 'Why we scope before we quote',
    captionEn: `We will not give you a price for catalogue work over a message, and it is worth explaining why rather than looking evasive.

A hundred-product catalogue can be a week or a month depending on things that are invisible from the outside: how many are variants of the same item, whether they can travel to a studio, whether the existing product data is usable, and how many destination platforms each needs formatting for.

Quoting before knowing those means one of two things. Either we pad the number to cover the worst case — and you overpay — or we quote optimistically and then renegotiate halfway through, which is worse.

So we scope first, free, and the number we give afterwards is one we hold to.

It also means we sometimes tell people their content is fine and the problem is pricing or demand. That is a real outcome of a real scoping call and it happens more than you would think.`,
    captionAr: `مش هنديك سعر لشغل الكتالوج في رسالة، ويستاهل نشرح ليه بدل ما نبان بنتهرب.

كتالوج فيه ١٠٠ منتج ممكن يكون أسبوع أو شهر حسب حاجات مش باينة من بره: كام واحد فيهم نسخة مختلفة من نفس المنتج، وهل يقدروا يوصلوا لاستوديو، وهل بيانات المنتجات الموجودة صالحة للاستخدام، وكل واحد محتاج تنسيق لكام منصة.

التسعير قبل معرفة ده معناه واحدة من اتنين. يا إما نضخّم الرقم عشان نغطي أسوأ حالة — وإنت تدفع زيادة — يا إما نسعّر بتفاؤل وبعدين نعيد التفاوض في النص، وده أسوأ.

فبنحدد النطاق الأول، مجانًا، والرقم اللي بنديه بعدها بنلتزم بيه.

ومعناه كمان إننا أحيانًا بنقول للناس إن المحتوى بتاعهم كويس والمشكلة في التسعير أو الطلب. دي نتيجة حقيقية لمكالمة تحديد نطاق حقيقية، وبتحصل أكتر مما تتخيل.`,
    designBrief: 'Text-only.',
  },
  {
    date: '2026-10-17',
    platform: 'instagram',
    pillar: 'proof',
    format: 'reel',
    campaign: 'q4-ready',
    hook: 'Fashion: the flat-lay versus the model shot',
    captionEn: `Fashion sellers ask which converts better. The honest answer is that they do different jobs and you need both.

Flat-lay: shows what the item actually is. Colour, cut, detail, no distraction. This is the hero.

Model: shows how it sits, how it moves, what size it reads as. This is what removes doubt.

One without the other leaves a question unanswered, and an unanswered question is an abandoned tab.`,
    captionAr: `بائعين الأزياء بيسألوا أنهي واحدة بتبيع أكتر. الإجابة الأمينة إنهم بيعملوا شغلانتين مختلفتين وإنت محتاج الاتنين.

الفلات لاي: بتوري المنتج ده إيه فعلًا. اللون والقصة والتفاصيل، من غير تشتيت. دي الصورة الرئيسية.

الموديل: بتوري بيقع إزاي، وبيتحرك إزاي، وشكل مقاسه إيه. دي اللي بتشيل الشك.

واحدة من غير التانية بتسيب سؤال من غير إجابة، والسؤال من غير إجابة معناه تاب مقفول.`,
    hashtags: ['#fashion', '#productphotography', '#تصوير_منتجات', '#ecommerceegypt'],
    designBrief: 'Real fashion set, flat-lay and model shot of the same item cut together.',
    template: 'reel-grid',
  },
  {
    date: '2026-10-18',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Final days',
    captionEn: `Final days before 23 October.

After that we are heads-down delivering what is booked, and new catalogue work moves into November — which for a season product is too late to be worth doing.

If you are on the fence, the scoping call costs you twenty minutes and settles it.`,
    captionAr: `آخر أيام قبل ٢٣ أكتوبر.

بعدها بنبقى مركزين في تسليم اللي محجوز، وأي شغل كتالوج جديد بينتقل لنوفمبر — واللي بالنسبة لمنتج موسمي بيكون متأخر أوي إنه يستاهل.

لو متردد، مكالمة تحديد النطاق هتكلفك عشرين دقيقة وهتحسم الموضوع.`,
    hashtags: ['#ecommerceegypt', '#whitefriday'],
    designBrief: 'Offer-dark, minimal, urgent but not shouty.',
    template: 'offer-dark',
  },
  {
    date: '2026-10-19',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'Getting your listing ready for a traffic spike',
    captionEn: `Whether or not you work with anyone, do these before the season:

□ Stock levels accurate — nothing kills a ranking like going out of stock mid-spike
□ Variant listings linked, not floating separately
□ Every image slot filled
□ Delivery settings checked
□ Return policy visible and honest
□ Q&A section answered — unanswered questions convert nobody

None of this costs money. All of it costs the season if it is wrong.`,
    captionAr: `سواء اشتغلت مع حد أو لأ، اعمل ده قبل الموسم:

□ كميات المخزون مضبوطة — مفيش حاجة بتقتل الترتيب زي نفاد المخزون في نص الذروة
□ المنتجات متعددة الأنواع مربوطة ببعض، مش سايبة كل واحدة لوحدها
□ كل خانات الصور متملية
□ إعدادات الشحن متراجعة
□ سياسة الإرجاع ظاهرة وصادقة
□ قسم الأسئلة متجاوب عليه — الأسئلة من غير رد مش بتبيع لحد

مفيش حاجة فيهم بتكلف فلوس. وكلهم بيكلفوا الموسم لو غلط.`,
    hashtags: ['#whitefriday', '#amazonseller', '#noonseller', '#تجارة_الكترونية'],
    designBrief: 'Saveable checklist card, same treatment as the September checklist so the series is recognisable.',
    template: 'checklist',
  },
  {
    date: '2026-10-20',
    platform: 'instagram',
    pillar: 'pulse',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Three days',
    captionEn: `Three days to the cut-off.

After Friday, the honest advice we will be giving sellers changes from "let us fix your listings" to "leave your listings alone and focus on stock and delivery".

Both are the right answer at the right time. Friday is when it flips.`,
    captionAr: `تلات أيام على الموعد النهائي.

بعد الجمعة، النصيحة الأمينة اللي هنقولها للبائعين هتتغير من "سيبنا نصلّح صفحاتك" لـ"سيب صفحاتك وركّز على المخزون والشحن".

الاتنين إجابة صح في وقتها الصح. الجمعة هي نقطة التحول.`,
    hashtags: ['#ecommerceegypt', '#whitefriday'],
    designBrief: 'Countdown, "3", dark panel.',
    template: 'statement-dark',
  },
  {
    date: '2026-10-21',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'q4-ready',
    hook: 'Last call, and what we will say after',
    captionEn: `Q4 catalogue bookings close Friday.

After that, if you come to us about season content, we are going to tell you not to do it. Publishing new listings into the week traffic arrives means going live with no history against competitors who have been building for a month — and asking you to pay us for that would be taking your money.

What we will say instead: leave the listings, get your stock and delivery right, and let us look at the catalogue in January when it can actually compound.

Saying that costs us November revenue. It is still the correct advice, and I would rather be the agency that gives it.

If you do want the season handled, Friday is the date.`,
    captionAr: `حجوزات كتالوجات الربع الأخير بتقفل الجمعة.

بعد كده، لو جيت لنا بخصوص محتوى الموسم، هنقول لك متعملهوش. نشر صفحات جديدة في أسبوع وصول الترافيك معناه إنك تنزل من غير أي تاريخ قدام منافسين بقالهم شهر بيبنوا — وإننا ناخد منك فلوس على ده هيكون سرقة.

اللي هنقوله بدالها: سيب الصفحات، وظبّط المخزون والشحن، وسيبنا نبص على الكتالوج في يناير لما يقدر فعلًا يتراكم.

قول ده بيكلفنا إيراد نوفمبر. وبرضه هي النصيحة الصح، وأفضّل أكون الوكالة اللي بتقولها.

لو عايز الموسم يتظبط فعلًا، الجمعة هي الميعاد.`,
    designBrief: 'Text-only.',
  },
  {
    date: '2026-10-22',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'The catalogue as one object',
    captionEn: `A grid of everything we shot this quarter.

Look at it as one object rather than as individual products. Same light, same crop logic, same margin, same white.

That is what a shopper sees when they land on your store page — not one product, a wall of them. Consistency is the brand.`,
    captionAr: `شبكة بكل اللي صورناه الربع ده.

بص عليها كقطعة واحدة مش كمنتجات فردية. نفس الإضاءة، نفس منطق القص، نفس الهوامش، نفس الأبيض.

ده اللي المشتري بيشوفه لما يفتح صفحة متجرك — مش منتج واحد، حيطة منهم. الاتساق هو العلامة التجارية.`,
    hashtags: ['#productphotography', '#تصوير_منتجات', '#ecommerceegypt'],
    designBrief: 'Dense grid of many real portfolio thumbnails at once. The uniformity is the entire message.',
    template: 'carousel-categories',
  },
  {
    date: '2026-10-23',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'Bookings closed',
    captionEn: `Q4 catalogue bookings are closed.

Thank you to everyone who booked — the studio is full through the season and we are heads-down.

If you missed it: genuinely, do not rush new listings out now. Focus on stock accuracy, delivery settings and answering your Q&A. Those matter more in the next four weeks than new photography would.

We will open January scoping in December. See you then.`,
    captionAr: `حجوزات كتالوجات الربع الأخير اتقفلت.

شكرًا لكل اللي حجز — الاستوديو مليان طول الموسم وإحنا مركزين في الشغل.

ولو فاتك الموعد: بجد، متستعجلش تنشر صفحات جديدة دلوقتي. ركّز على دقة المخزون وإعدادات الشحن والرد على الأسئلة. دول أهم في الأربع أسابيع الجايين من أي تصوير جديد.

هنفتح تحديد نطاق يناير في ديسمبر. نشوفكم وقتها.`,
    hashtags: ['#ecommerceegypt', '#whitefriday'],
    designBrief: 'Closed-state card. Lime rule struck through the date. Calm, not dramatic.',
    template: 'statement-dark',
  },

  // ── Week 4 — switch to service ──────────────────────────────────────────
  {
    date: '2026-10-25',
    platform: 'facebook',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'white-friday',
    hook: 'Pre-season checks that are free and take an hour',
    captionEn: `Bookings are closed, so this is not a pitch. It is the list we would run if we were you, and it costs nothing.

1. Search your own products the way a customer would — not by SKU
2. Check stock counts against physical reality, not the system
3. Open every listing on a phone, not a laptop
4. Read your own reviews from the last three months
5. Answer every unanswered question
6. Check your delivery promise is one you can keep at 4x volume

An hour, no money, and it catches more season problems than most paid work.`,
    captionAr: `الحجوزات اتقفلت، فده مش عرض بيع. دي الليستة اللي كنا هنعملها لو مكانك، ومش بتكلف حاجة.

١. دوّر على منتجاتك زي ما العميل هيدوّر — مش بالكود
٢. راجع أعداد المخزون على الواقع الفعلي، مش على النظام
٣. افتح كل صفحة منتج على موبايل، مش لابتوب
٤. اقرا تقييماتك في آخر تلات شهور
٥. رد على كل سؤال من غير إجابة
٦. اتأكد إن وعد الشحن بتاعك تقدر تلتزم بيه مع ٤ أضعاف الحجم

ساعة، من غير فلوس، وبتمسك مشاكل موسمية أكتر من أغلب الشغل المدفوع.`,
    hashtags: ['#whitefriday', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Six-row checklist, light ground.',
    template: 'checklist',
  },
  {
    date: '2026-10-26',
    platform: 'instagram',
    pillar: 'process',
    format: 'reel',
    campaign: 'white-friday',
    hook: 'Inside a full studio during season delivery',
    captionEn: `What a full studio looks like.

Every product on these tables is going live before the season. This is the part of the year the whole calendar is built around.`,
    captionAr: `شكل استوديو مليان.

كل منتج على الترابيزات دي هينزل قبل الموسم. دي الفترة من السنة اللي التقويم كله متبني حواليها.`,
    hashtags: ['#behindthescenes', '#تصوير_منتجات'],
    designBrief: 'Wide studio footage, busy, real. No captions needed beyond the on-screen date.',
    template: 'reel-process',
  },
  {
    date: '2026-10-27',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'article',
    campaign: 'white-friday',
    hook: 'What we expect to see this White Friday',
    captionEn: `Three things we expect to watch happen over the next month, based on the last few seasons.

**Stock-outs will cost more than price.** A listing that goes out of stock during a traffic spike loses its position, and getting it back after the season is slower than sellers expect. The discount you did not need to give matters less than the four days you were unavailable.

**Late listings will underperform and get blamed on the platform.** Products published in the sale week go live with no behavioural history. The platform is not suppressing them; they simply have nothing to rank on yet.

**The catalogues that do well will look boring.** Consistent, complete, correctly specified. Not clever. The sellers who spent October on fundamentals will quietly outperform the ones who spent November on tactics.

None of this is a prediction about anyone's numbers — we do not make those. It is a pattern, and patterns are worth naming before the month rather than after.

Good luck to everyone selling. It is a hard four weeks.`,
    captionAr: `تلات حاجات متوقعين نشوفها الشهر الجاي، بناءً على المواسم اللي فاتت.

**نفاد المخزون هيكلّف أكتر من السعر.** الصفحة اللي بينفد مخزونها وقت ذروة الترافيك بتفقد مركزها، واسترجاعه بعد الموسم أبطأ مما البائعين متوقعين. الخصم اللي مكنتش محتاج تديه أقل أهمية من الأربع أيام اللي مكنتش متاح فيهم.

**الصفحات المتأخرة أداؤها هيبقى ضعيف وهيتلام على المنصة.** المنتجات اللي بتتنشر في أسبوع الأوكازيون بتنزل من غير أي تاريخ سلوكي. المنصة مش بتخنقها؛ هي ببساطة معندهاش حاجة تترتب عليها لسه.

**الكتالوجات اللي هتعمل نتيجة كويسة هتبان مملة.** متسقة، كاملة، بمواصفات صح. مش ذكية. البائعين اللي صرفوا أكتوبر على الأساسيات هيتفوقوا بهدوء على اللي صرفوا نوفمبر على التكتيكات.

ولا حاجة من ده تنبؤ بأرقام حد — إحنا مبنعملش كده. ده نمط، والأنماط تستاهل تتقال قبل الشهر مش بعده.

بالتوفيق لكل اللي بيبيع. دي أربع أسابيع صعبة.`,
    designBrief: 'Text-only.',
  },
  {
    date: '2026-10-29',
    platform: 'instagram',
    pillar: 'teach',
    format: 'story',
    campaign: 'white-friday',
    hook: 'Story series: season-eve checks',
    captionEn: `Three-frame story: stock accurate / images complete / delivery promise honest.`,
    captionAr: `ستوري من تلات فريمات: المخزون مضبوط / الصور كاملة / وعد الشحن صادق.`,
    designBrief: 'Three sequential frames, one check each, saved to a "Season" highlight.',
  },
  {
    date: '2026-10-30',
    platform: 'facebook',
    pillar: 'pulse',
    format: 'static',
    campaign: 'white-friday',
    hook: 'Season opens — good luck',
    captionEn: `The season starts. Good luck to every seller reading this.

We are not selling anything this month. If you have a question about a listing, ask it in the comments and we will answer it free — that is more useful to you right now than anything we could invoice for.`,
    captionAr: `الموسم بيبدأ. بالتوفيق لكل بائع بيقرا ده.

إحنا مش بنبيع حاجة الشهر ده. لو عندك سؤال عن صفحة منتج، اسأله في الكومنتات وهنرد عليك مجانًا — ده أنفع لك دلوقتي من أي حاجة نقدر نحاسبك عليها.`,
    hashtags: ['#whitefriday', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Warm, plain. Lime rule, one line, lockup. No offer.',
    template: 'statement-dark',
  },
]
