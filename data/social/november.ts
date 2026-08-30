import type { PlannedPost } from './types'

/**
 * November 2026 — the season itself.
 *
 * The month deliberately does not sell. Bookings closed on 23 October, the
 * studio is delivering, and the audience is mid-sale and unavailable to buy
 * agency work. Selling here would be selling to people who cannot say yes.
 *
 * So November's job is proof and goodwill: show the work live on shelves during
 * the busiest retail weekend of the year, and be genuinely useful to sellers
 * under pressure. That is what earns the December retainer conversation — and
 * it is the reason the year-end campaign converts at all.
 *
 * Campaign posts (White Friday, 11.11, Black Friday) carry full copy. The
 * standing rhythm slots carry hooks and design briefs, to be written closer to
 * the date against what is actually happening — writing them now would mean
 * inventing a season that has not occurred yet.
 */
export const NOVEMBER: PlannedPost[] = [
  // ── Week 1 — the work goes live ─────────────────────────────────────────
  {
    date: '2026-11-01',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'white-friday',
    hook: 'The catalogues we shot are live today',
    captionEn: `Everything we photographed in October is live today.

This is the only part of the job that matters — not the studio shots, not the process, but the moment a product is sitting on a marketplace page in front of a shopper who has never heard of the brand.

Swipe for the listings as they appear to customers, not as they look in our folder.`,
    captionAr: `كل اللي صورناه في أكتوبر نازل النهارده.

ده الجزء الوحيد اللي بيفرق في الشغلانة — مش لقطات الاستوديو ولا العملية، لكن اللحظة اللي المنتج بيكون فيها على صفحة متجر قدام مشتري عمره ما سمع عن الماركة.

اسحب لتشوف الصفحات زي ما بتظهر للعملاء، مش زي ما بتبان في الفولدر بتاعنا.`,
    hashtags: ['#whitefriday', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief:
      'Screenshots of real live listing pages, not studio exports. The browser chrome is the point — it proves these shipped.',
    template: 'carousel-categories',
  },
  {
    date: '2026-11-02',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'text',
    campaign: 'white-friday',
    hook: 'Open offer: free listing questions all month',
    captionEn: `We are not selling anything in November.

Our studio is full delivering what was booked in October, and the sellers we would otherwise be talking to are in the hardest four weeks of their year. Pitching into that would be tone-deaf.

So here is the standing offer for the month instead: if you have a question about a listing — why it is not converting, why it got rejected, whether an image meets spec — ask it publicly or send it to me and I will answer it. Free, no follow-up sequence, no pitch afterwards.

We will start January conversations in December. Until then, good luck with the season.`,
    captionAr: `إحنا مش بنبيع حاجة في نوفمبر.

الاستوديو بتاعنا مليان بتسليم اللي اتحجز في أكتوبر، والبائعين اللي كنا هنكلمهم بيعدّوا أصعب أربع أسابيع في سنتهم. العرض عليهم في الوقت ده هيكون قلة ذوق.

فبدالها، ده العرض الثابت للشهر: لو عندك سؤال عن صفحة منتج — ليه مش بتحوّل، ليه اترفضت، هل الصورة مطابقة للمواصفات — اسأله علنًا أو ابعته لي وهرد عليه. مجانًا، من غير سلسلة متابعة، ومن غير عرض بيع بعدها.

هنبدأ كلام يناير في ديسمبر. ولحد كده، بالتوفيق في الموسم.`,
    designBrief: 'Text-only.',
  },
  {
    date: '2026-11-04',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    campaign: 'white-friday',
    hook: 'What to do when a listing gets suppressed mid-season',
    captionEn: `If a listing disappears from search mid-season, do this in order before panicking.

1. Check stock — the most common cause by far
2. Check the listing is still "Active", not "Incomplete"
3. Check for a policy notification in your account, not your email
4. Check the main image still meets spec — a compliance sweep can flag an old image
5. Only then open a case

Most suppressions are one of the first four, and all four are fixable in minutes. Opening a case first puts you in a queue behind everyone who also panicked.`,
    captionAr: `لو صفحة منتج اختفت من البحث في نص الموسم، اعمل ده بالترتيب قبل ما تتوتر.

١. راجع المخزون — ده أكتر سبب بفارق كبير
٢. اتأكد إن الصفحة لسه "نشطة" مش "غير مكتملة"
٣. دوّر على إشعار سياسات في حسابك، مش في الإيميل
٤. اتأكد إن الصورة الرئيسية لسه مطابقة للمواصفات — الفحص الدوري ممكن يعلّم على صورة قديمة
٥. وبعد كده بس افتح شكوى

أغلب حالات الإخفاء واحدة من أول أربعة، وكلهم بيتصلحوا في دقايق. فتح الشكوى الأول بيحطك في طابور ورا كل اللي اتوتروا زيك.`,
    hashtags: ['#amazonseller', '#noonseller', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Numbered troubleshooting card, high contrast, designed to be saved and re-opened under stress.',
    template: 'checklist',
  },
  {
    date: '2026-11-05',
    platform: 'instagram',
    pillar: 'proof',
    format: 'reel',
    campaign: 'white-friday',
    hook: 'Scroll a real category grid and spot our work',
    captionEn: `Scrolling a live category grid.

You can usually tell which listings had someone look at them properly. Not because they are flashy — because they are consistent, and everything around them is not.`,
    captionAr: `بنسكرول في شبكة فئة حقيقية.

غالبًا تقدر تعرف أنهي صفحات فيه حد بصّ عليها صح. مش لأنها لامعة — لأنها متسقة، وكل اللي حواليها مش كده.`,
    hashtags: ['#whitefriday', '#ecommerceegypt'],
    designBrief: 'Screen recording of a real marketplace grid, our listings subtly highlighted as they pass.',
    template: 'reel-grid',
  },
  {
    date: '2026-11-07',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    hook: 'Mid-season: the three metrics worth watching daily',
    designBrief:
      'Three-slide card: session-to-detail-page rate, detail-page-to-order rate, out-of-stock rate. Write closer to the date.',
    template: 'carousel-teach',
  },

  // ── Week 2 — 11.11 ──────────────────────────────────────────────────────
  {
    date: '2026-11-08',
    platform: 'facebook',
    pillar: 'pulse',
    format: 'static',
    campaign: 'white-friday',
    hook: 'Three days to 11.11 — last honest checks',
    designBrief: 'Countdown to 11.11 with the free pre-spike checklist repeated. Write closer to the date.',
    template: 'checklist',
  },
  {
    date: '2026-11-09',
    platform: 'linkedin',
    pillar: 'teach',
    format: 'article',
    hook: 'Why 11.11 matters more in Egypt each year',
    designBrief:
      'Long-form on Singles Day adoption in MENA. Needs current-year data at time of writing — do not write in advance.',
  },
  {
    date: '2026-11-11',
    platform: 'instagram',
    pillar: 'proof',
    format: 'static',
    campaign: 'white-friday',
    hook: '11.11 — our clients are live',
    captionEn: `11.11.

Every product we shot this quarter is on a shelf today, competing on the same grid as everyone else's.

Nothing more to say than that. Good luck to every seller trading today.`,
    captionAr: `١١.١١.

كل منتج صورناه الربع ده موجود على رف النهارده، بيتنافس على نفس الشبكة زي أي حد تاني.

مفيش أكتر من كده نقوله. بالتوفيق لكل بائع شغال النهارده.`,
    hashtags: ['#1111', '#whitefriday', '#ecommerceegypt'],
    designBrief: 'Minimal date card: "11.11" at display size on the dark panel, lockup beneath. No offer, no CTA.',
    template: 'statement-dark',
  },
  {
    date: '2026-11-12',
    platform: 'instagram',
    pillar: 'process',
    format: 'reel',
    hook: 'Studio at season pace',
    designBrief: 'Real footage from delivery week. Shoot on the day.',
    template: 'reel-process',
  },
  {
    date: '2026-11-14',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    hook: 'Reading your search term report after a spike',
    designBrief: 'Teach post on post-spike keyword analysis. Write with real anonymised report screenshots.',
    template: 'carousel-teach',
  },

  // ── Week 3 — into Black Friday ──────────────────────────────────────────
  {
    date: '2026-11-15',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    hook: 'The restock decision nobody makes in time',
    designBrief: 'Short teach post on restock lead times before the Black Friday weekend.',
    template: 'statement-dark',
  },
  {
    date: '2026-11-16',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'text',
    hook: 'Mid-season observations from inside the catalogues',
    designBrief:
      'Written in the week itself from what we are actually seeing. Patterns only, never client numbers.',
  },
  {
    date: '2026-11-18',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    hook: 'A category that surprised us this season',
    designBrief: 'Write after the first fortnight of data. Genuine observation, not a manufactured insight.',
    template: 'carousel-categories',
  },
  {
    date: '2026-11-21',
    platform: 'instagram',
    pillar: 'teach',
    format: 'reel',
    campaign: 'black-friday',
    hook: 'Six days out: leave your listings alone',
    captionEn: `Six days to Black Friday. Here is the advice nobody gives because it does not sell anything.

Stop editing your listings.

Every change you make this week resets something — image recognition, ad creative, sometimes a compliance check. A listing that has been stable for a month is worth more right now than a listing that is 5% better and went live yesterday.

Spend the week on stock, delivery and customer service instead. That is where the season is actually won.`,
    captionAr: `ستة أيام على البلاك فرايداي. ودي النصيحة اللي محدش بيقولها لأنها مش بتبيع حاجة.

بطّل تعديل في صفحاتك.

كل تغيير بتعمله الأسبوع ده بيصفّر حاجة — التعرف على الصورة، أو الإعلان، وأحيانًا فحص المطابقة. الصفحة اللي ثابتة بقالها شهر بتساوي دلوقتي أكتر من صفحة أحسن ٥٪ ونازلة إمبارح.

اصرف الأسبوع على المخزون والشحن وخدمة العملاء بدالها. ده المكان اللي الموسم بيتكسب فيه فعلًا.`,
    hashtags: ['#blackfriday', '#whitefriday', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Reel or static: a "do not touch" treatment over a listing editor screen. Blunt and memorable.',
    template: 'statement-dark',
  },
  {
    date: '2026-11-22',
    platform: 'facebook',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'black-friday',
    hook: 'Black Friday weekend: the customer service prep list',
    captionEn: `The weekend is won on service, not content. Ours is closed for edits; here is what to do with yours.

□ Set expectations in your listing — if delivery slows, say so before they order
□ Pre-write your three most common replies so you are not writing them at 1am
□ Watch your Q&A — questions asked during a spike convert or lose the sale within the hour
□ Check every variant is in stock, not just the parent
□ Decide now what you do when something sells out — pause the listing or leave it up
□ Have someone actually watching the account over the weekend

None of this is glamorous. All of it decides your review score in December.`,
    captionAr: `الويك إند بيتكسب بالخدمة، مش بالمحتوى. المحتوى عندنا مقفول للتعديل؛ ودي اللي تعمله في بتاعك.

□ حدد التوقعات في الصفحة — لو الشحن هيتأخر، قول قبل ما يطلبوا
□ اكتب أكتر تلات ردود متكررة عندك مقدمًا عشان متكتبهمش الساعة واحدة بالليل
□ راقب قسم الأسئلة — الأسئلة وقت الذروة بتكسب البيعة أو تضيّعها خلال ساعة
□ اتأكد إن كل الأنواع متوفرة، مش الأساسي بس
□ قرر من دلوقتي هتعمل إيه لما حاجة تخلص — توقف الصفحة ولا تسيبها
□ خلي فيه حد فعلًا بيراقب الحساب طول الويك إند

مفيش حاجة فيهم لامعة. وكلهم بيحددوا تقييمك في ديسمبر.`,
    hashtags: ['#blackfriday', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Six-row checklist, saveable, same series treatment as the earlier checklists.',
    template: 'checklist',
  },
  {
    date: '2026-11-23',
    platform: 'linkedin',
    pillar: 'process',
    format: 'text',
    campaign: 'black-friday',
    hook: 'What we do during the weekend we sold nothing into',
    designBrief:
      'Short post on being on standby for existing clients through the weekend. Write on the day — it should read as live, not scheduled.',
  },

  // ── Week 4 — Black Friday and the turn to December ──────────────────────
  {
    date: '2026-11-25',
    platform: 'instagram',
    pillar: 'proof',
    format: 'story',
    campaign: 'black-friday',
    hook: 'Live stories through the weekend',
    designBrief:
      'Story series across Thu–Sat: client listings live on real grids. Shot and posted in the moment; scheduling this defeats the point.',
  },
  {
    date: '2026-11-27',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'black-friday',
    hook: 'Black Friday — the work, on the shelf',
    captionEn: `Black Friday.

Today the only thing that counts is whether the listing does its job with nobody helping it. No caption we write changes that.

To every seller trading today: we hope the stock holds and the delivery lands. Genuinely.`,
    captionAr: `بلاك فرايداي.

النهارده الحاجة الوحيدة اللي بتفرق هي إذا كانت الصفحة بتعمل شغلها من غير ما حد يساعدها. مفيش كابشن بنكتبه هيغيّر ده.

لكل بائع شغال النهارده: نتمنى المخزون يكفي والشحن يوصل. بجد.`,
    hashtags: ['#blackfriday', '#whitefriday', '#ecommerceegypt'],
    designBrief: 'Live listing screenshots from the day itself, timestamped. Do not pre-render this one.',
    template: 'carousel-categories',
  },
  {
    date: '2026-11-29',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    hook: 'The Monday after: what to capture before you forget',
    captionEn: `The season is not over, but the spike is. Before the week blurs, write down:

— Which products sold out, and how many days you lost
— Which listings converted above your average, and what was different about them
— Every question a customer asked that your listing should have answered
— What broke operationally

That last list is next year's content brief, and it is worth more than any analytics dashboard. Write it now — by January nobody remembers.`,
    captionAr: `الموسم لسه مخلصش، بس الذروة خلصت. قبل ما الأسبوع يختلط عليك، اكتب:

— أنهي منتجات خلص مخزونها، وضيّعت كام يوم
— أنهي صفحات حوّلت أعلى من متوسطك، وإيه اللي كان مختلف فيها
— كل سؤال سأله عميل كان المفروض الصفحة ترد عليه
— إيه اللي وقع في التشغيل

الليستة الأخيرة دي هي بريف محتوى السنة الجاية، وبتساوي أكتر من أي لوحة تحليلات. اكتبها دلوقتي — في يناير محدش هيفتكر.`,
    hashtags: ['#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Four-row capture list, light ground.',
    template: 'checklist',
  },
  {
    date: '2026-11-30',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'year-end',
    hook: 'January scoping opens',
    captionEn: `November is done. We sold nothing into it on purpose, and it was the right call.

January scoping opens now.

The reason to have the conversation in December rather than January: work booked now starts in the first week of the year, which means your catalogue compounds for eleven months instead of ten. That is the entire argument, and it is a small one — but it is true, and I would rather give you a small true reason than a large invented one.

If your season surfaced content problems — listings that did not convert, questions your pages should have answered, categories where you looked smaller than you are — that list is the best brief you will ever hand an agency. Bring it.

Free scoping, same as always, and we will tell you if you do not need us.`,
    captionAr: `نوفمبر خلص. مبعناش فيه حاجة عن قصد، وكان القرار الصح.

تحديد نطاق يناير بيفتح دلوقتي.

سبب إن الكلام يحصل في ديسمبر مش يناير: الشغل المحجوز دلوقتي بيبدأ أول أسبوع في السنة، يعني كتالوجك بيتراكم ١١ شهر بدل ١٠. دي الحجة كلها، وهي حجة صغيرة — بس صح، وأفضّل أديك سبب صغير حقيقي على سبب كبير مخترع.

لو الموسم كشف لك مشاكل محتوى — صفحات محوّلتش، أسئلة كان المفروض صفحاتك ترد عليها، فئات بانت فيها أصغر مما إنت عليه — الليستة دي أحسن بريف ممكن تدّيه لوكالة. هاتها معاك.

تحديد نطاق مجاني زي كل مرة، وهنقول لك لو مش محتاجنا.`,
    designBrief: 'Text-only.',
  },
]
