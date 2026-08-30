import type { PlannedPost } from './types'

/**
 * September 2026 — "Q4 is decided in October."
 *
 * The month's job is awareness and list-building, not closing. Facebook and
 * LinkedIn open from zero here, so the first fortnight over-weights teaching:
 * a page with no followers earns them by being useful, not by announcing
 * itself. The offer pillar appears three times all month, deliberately.
 *
 * Every caption is written to the two handbook constraints — no delivery-date
 * promises, no ranking or sales guarantees. Where a post wants a number, it
 * uses one that is true: 210+ products, 8 categories, 4 marketplaces.
 */
export const SEPTEMBER: PlannedPost[] = [
  // ── Week 1 — open the argument ──────────────────────────────────────────
  {
    date: '2026-09-01',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'The Q4 timeline sellers get wrong every year',
    captionEn: `Most sellers start preparing for the season in November.

By then it is already decided.

Here is the real timeline: your listings need to be live, indexed and converting *before* the traffic arrives. A product published the week of the sale is a product competing with no history, no reviews and no ranking against listings that have been building for a month.

October is when Q4 gets won. November is when you find out.

Swipe for the timeline we work backwards from.`,
    captionAr: `أغلب البائعين بيبدأوا يجهزوا للموسم في نوفمبر.

في الوقت ده الموضوع بيكون خلص خلاص.

الجدول الحقيقي كالآتي: منتجاتك لازم تكون منشورة ومفهرسة وبتحقق مبيعات *قبل* ما الترافيك ييجي. المنتج اللي بيتنشر في أسبوع الأوكازيون بيتنافس من غير تاريخ ولا تقييمات ولا ترتيب، قدام منتجات بقالها شهر بتتبني.

أكتوبر هو الشهر اللي بيتحدد فيه الربع الأخير. نوفمبر هو الشهر اللي بتعرف فيه النتيجة.

اسحب لتشوف الجدول اللي بنشتغل بيه بالعكس.`,
    hashtags: ['#ecommerceegypt', '#amazoneg', '#noon', '#تجارة_الكترونية', '#whitefriday'],
    designBrief:
      'Six-slide carousel. Slide 1: a horizontal timeline Aug→Dec with the "decision point" marker sitting on October, not November. Slides 2–5: one stage each, using the ProcessArt node vocabulary. Slide 6: the audit CTA. Dark panels, lime accent on the October marker.',
    template: 'carousel-timeline',
  },
  {
    date: '2026-09-01',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'article',
    campaign: 'q4-decided-in-october',
    hook: 'Why marketplace content is a Q3 decision, not a Q4 one',
    captionEn: `A pattern we see every year, and it costs sellers real money.

Q4 content budgets get approved in November. The work then has to happen during the exact weeks when the seller's operations team is at its most stretched — and when every studio and freelancer in Cairo is fully booked.

The sellers who do well have usually done three things by the end of October:

1. Audited which listings actually convert, rather than assuming
2. Rebuilt the images and copy on the products that carry the season
3. Got them published early enough to accumulate some history before traffic arrives

None of that is exotic. It is just sequencing.

The uncomfortable part: the products worth the investment are usually not the ones with the most SKUs. They are the three to five that already sell, presented badly. Fixing those beats rebuilding a catalogue of two hundred.

We are FLOW — an e-commerce content studio in Cairo working across Amazon, Noon, TikTok Shop and Shopify.

If you want a second opinion on which of your listings is worth the money before the season, we will look at one for free. No pitch attached.`,
    captionAr: `نمط بنشوفه كل سنة، وبيكلّف البائعين فلوس حقيقية.

ميزانيات محتوى الربع الأخير بتتوافق عليها في نوفمبر. وبالتالي الشغل بيحصل في نفس الأسابيع اللي فريق العمليات بيكون فيها تحت أقصى ضغط، ووقت ما كل استوديو وفريلانسر في القاهرة يكون محجوز بالكامل.

البائعين اللي بيعملوا نتيجة كويسة بيكونوا عملوا ٣ حاجات قبل آخر أكتوبر:

١. راجعوا أنهي منتجات فعلًا بتحوّل، مش بيفترضوا
٢. أعادوا بناء الصور والنصوص للمنتجات اللي شايلة الموسم
٣. نشروها بدري بما يكفي إنها تبني تاريخ قبل ما الترافيك ييجي

مفيش حاجة معقدة في ده. ده مجرد ترتيب صح.

الجزء المزعج: المنتجات اللي تستاهل الاستثمار غالبًا مش اللي عندها أكتر عدد أصناف. دي التلاتة لخمسة اللي بيبيعوا بالفعل، بس معروضين بشكل وحش. إصلاح دول أفضل من إعادة بناء كتالوج فيه ٢٠٠ منتج.

إحنا FLOW — استوديو محتوى للتجارة الإلكترونية في القاهرة، بنشتغل على أمازون ونون وتيك توك شوب وشوبيفاي.

لو عايز رأي تاني في أنهي منتج يستاهل الصرف قبل الموسم، هنراجع لك واحد مجانًا. من غير أي عرض بيع.`,
    designBrief:
      'Single 1200×627. Dark panel, one line of display type: "Q4 content is a Q3 decision." Lime rule beneath. Lockup bottom-left.',
    template: 'quote-dark',
  },
  {
    date: '2026-09-02',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'The white background rule that gets listings rejected',
    captionEn: `The most common reason a marketplace rejects a product image in Egypt is not quality. It is the background.

"White" means pure white — RGB 255, 255, 255. Not off-white. Not the light grey your phone camera produces under a lamp. Not a white wall, which photographs as grey.

Amazon and Noon both check this automatically. A near-white background is a rejection, and a rejection costs you days at exactly the moment you cannot spare them.

If you are shooting yourself: the fix is lighting, not editing. Editing a grey background to pure white eats your product's edges — especially anything white, transparent, or reflective.

Save this one for when you next upload.`,
    captionAr: `أكتر سبب بيخلي المتاجر الإلكترونية ترفض صورة منتج في مصر مش الجودة. الخلفية.

"أبيض" يعني أبيض خالص — RGB ٢٥٥،٢٥٥،٢٥٥. مش قريب من الأبيض. ولا الرمادي الفاتح اللي كاميرا الموبايل بتطلعه تحت لمبة. ولا حيطة بيضا، لأنها بتتصور رمادي.

أمازون ونون الاتنين بيتشيكوا على ده أوتوماتيك. الخلفية القريبة من الأبيض = رفض، والرفض بيكلّفك أيام في أكتر وقت مش قادر تستغنى فيه عنها.

لو بتصور بنفسك: الحل في الإضاءة، مش في التعديل. تفتيح خلفية رمادية لأبيض خالص بياكل حواف المنتج — خصوصًا أي حاجة بيضا أو شفافة أو لامعة.

احفظ البوست ده لحد ما ترفع منتجات المرة الجاية.`,
    hashtags: ['#amazonseller', '#noonseller', '#تجارة_الكترونية', '#ecommerceegypt'],
    designBrief:
      'Split frame: left a grey-cast product shot marked ✗, right the same shot on true white marked ✓, with the RGB value called out. Use a real product from the portfolio.',
    template: 'compare-2up',
  },
  {
    date: '2026-09-03',
    platform: 'instagram',
    pillar: 'proof',
    format: 'reel',
    campaign: 'q4-decided-in-october',
    hook: 'One product, four marketplaces, four different listings',
    captionEn: `Same product. Four platforms. Four different listings — and that is not laziness, it is the job.

Amazon wants keyword density in the title. Noon wants a shorter title and a different category path. TikTok Shop wants the first frame to sell before anyone reads. Shopify lets you write like a brand instead of a search engine.

Publishing the same title everywhere is the single fastest way to be invisible on three of the four.

We build each one separately. Same product story, four different sets of rules.`,
    captionAr: `نفس المنتج. أربع منصات. أربع صفحات مختلفة — وده مش كسل، ده صميم الشغل.

أمازون عايزة كثافة كلمات مفتاحية في العنوان. نون عايزة عنوان أقصر ومسار تصنيف مختلف. تيك توك شوب عايزة أول لقطة تبيع قبل ما حد يقرأ. شوبيفاي بتسيبك تكتب كعلامة تجارية مش كمحرك بحث.

إنك تنشر نفس العنوان في كل مكان هو أسرع طريقة تبقى مش موجود على تلاتة من الأربعة.

إحنا بنبني كل واحدة لوحدها. نفس قصة المنتج، أربع مجموعات قواعد مختلفة.`,
    hashtags: ['#amazoneg', '#noon', '#tiktokshop', '#shopify', '#ecommerceegypt'],
    designBrief:
      'Reel, 15–20s. One product on the turntable, four platform frames snapping around it in sequence, each showing its own title treatment. Use the MarketplaceArt fan-out as the closing frame.',
    template: 'reel-marketplaces',
  },
  {
    date: '2026-09-04',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'Free listing audit — what you actually get',
    captionEn: `We will take one of your live listings apart, for free.

What you get back: what is costing you clicks in the images, what is missing from the title, which keywords you are not ranking for, and what the platform's own rules say you are doing wrong.

What you do not get: a sales pitch, a promise about rankings, or a number we made up.

Why free? Because most sellers have never had anyone look at their listing properly, and the fastest way to show what we do is to do a bit of it.

Comment or DM "AUDIT" with a product link.`,
    captionAr: `هنفكّك واحد من منتجاتك المنشورة، مجانًا.

اللي هتاخده: إيه اللي بيضيّع عليك كليكات في الصور، إيه الناقص في العنوان، أنهي كلمات مفتاحية مش ظاهر فيها، وإيه اللي قواعد المنصة نفسها بتقول إنك بتعمله غلط.

اللي مش هتاخده: عرض بيع، أو وعد بترتيب معين، أو رقم إحنا اخترعناه.

ليه مجانًا؟ لأن أغلب البائعين محدش بصّ على منتجاتهم بشكل جدي قبل كده، وأسرع طريقة نوريك بنعمل إيه إننا نعمل شوية منه.

اكتب "مراجعة" في كومنت أو رسالة مع لينك المنتج.`,
    hashtags: ['#ecommerceegypt', '#amazonseller', '#noonseller'],
    designBrief:
      'Dark panel. Big lime "AUDIT" / "مراجعة" word, with three short bullet lines of what is included. Deliberately plain — this is an offer post, not a showcase.',
    template: 'offer-dark',
  },
  {
    date: '2026-09-05',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'Eight categories, one studio standard',
    captionEn: `Accessories. Cosmetics. Electronics. Fashion. Home. Jewellery. Office. Toys.

Eight categories, 210+ products, one lighting standard.

The reason that matters: a catalogue shot by four different freelancers looks like four different brands on a search results page. Consistency is not a nice-to-have on a marketplace grid — it is the thing that makes a shopper trust that you are a real business.

Swipe through the categories.`,
    captionAr: `إكسسوارات. مستحضرات تجميل. إلكترونيات. أزياء. منزل. مجوهرات. مكتب. لعب أطفال.

تمن فئات، أكتر من ٢١٠ منتج، معيار إضاءة واحد.

ليه ده مهم: الكتالوج اللي متصوّر عند أربع فريلانسرز بيبان كأنه أربع علامات تجارية مختلفة في صفحة نتائج البحث. الاتساق مش رفاهية على شبكة المتجر — ده اللي بيخلي المشتري يثق إنك بيزنس حقيقي.

اسحب لتشوف الفئات.`,
    hashtags: ['#productphotography', '#تصوير_منتجات', '#ecommerceegypt', '#amazoneg'],
    designBrief:
      'Eight-slide carousel, one category cover per slide pulled straight from portfolioData. Same crop, same margin, same label position on every slide — the consistency is the message.',
    template: 'carousel-categories',
  },
  {
    date: '2026-09-06',
    platform: 'instagram',
    pillar: 'process',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'AI moves the volume. A person signs off on what goes live.',
    captionEn: `We use AI in production. We are straight about that, and about where it stops.

AI moves volume — drafting copy variants, handling repetitive catalogue structure, processing images at a scale a person cannot match by hand.

A person reviews everything that goes live. Every title, every image, every description. Because a model does not know that this product's category rules changed last month, and it will produce something plausible and wrong with total confidence.

That combination is why we can price per-item work from 10 EGP and still have a human standard behind it.`,
    captionAr: `إحنا بنستخدم الذكاء الاصطناعي في الإنتاج. بنقول ده بصراحة، وبنقول كمان هو بيقف فين.

الذكاء الاصطناعي بيحرّك الكميات — مسودات النصوص، الهيكل المتكرر للكتالوج، معالجة الصور بحجم مستحيل حد يعمله بإيده.

وفي الآخر شخص بيراجع كل حاجة بتتنشر. كل عنوان، كل صورة، كل وصف. لأن الموديل مش عارف إن قواعد تصنيف المنتج ده اتغيرت الشهر اللي فات، وهيطلّع لك حاجة معقولة وغلط بثقة كاملة.

المزيج ده هو السبب إن سعر الصنف عندنا بيبدأ من ١٠ جنيه ومعاه معيار بشري.`,
    hashtags: ['#ecommerceegypt', '#productcontent'],
    designBrief:
      'Dark panel using the ContentCreationArt vocabulary: the four-pass row with the human review pass highlighted in lime and labelled.',
    template: 'statement-dark',
  },
  {
    date: '2026-09-07',
    platform: 'linkedin',
    pillar: 'process',
    format: 'text',
    campaign: 'q4-decided-in-october',
    hook: 'The handoff problem — why one partner beats four freelancers',
    captionEn: `The usual setup for a growing seller: a photographer, a copywriter, a freelancer who knows Amazon's category rules, and someone in-house chasing all three.

Every one of them is competent. The catalogue still comes out inconsistent.

The reason is that nothing is dropped *inside* a task — things are dropped in the handoffs between them. The photographer does not know the copy angle, so the hero image and the first bullet tell different stories. The copywriter has not seen the final retouch. The category specialist gets both too late to change either.

We built FLOW around removing the handoffs rather than improving them. Photography and copy are briefed together, in one job, by one team, against one platform spec.

That is not a claim about being better at photography than a photographer. It is a claim about the seams.

Where does your catalogue lose its consistency? Genuinely curious — I suspect most people can name the exact handoff.`,
    captionAr: `الترتيب المعتاد للبائع اللي بيكبر: مصور، وكاتب محتوى، وفريلانسر فاهم قواعد تصنيفات أمازون، وحد جوه الشركة بيجري ورا التلاتة.

كل واحد فيهم شاطر. والكتالوج بيطلع في الآخر غير متسق.

السبب إن مفيش حاجة بتقع *جوه* المهمة — الحاجات بتقع في التسليمات ما بينهم. المصور مش عارف زاوية النص، فالصورة الرئيسية وأول سطر بيحكوا قصتين مختلفتين. كاتب المحتوى مشافش الريتاتش النهائي. ومتخصص التصنيفات بيستلم الاتنين متأخر أوي إنه يغيّر أي حاجة.

بنينا FLOW على إلغاء التسليمات دي، مش على تحسينها. التصوير والنصوص بيتبريفوا مع بعض، في شغلانة واحدة، من فريق واحد، على مواصفات منصة واحدة.

ده مش ادعاء إننا بنصور أحسن من مصور محترف. ده كلام عن الوصلات ما بين الخطوات.

كتالوجك بيفقد اتساقه فين؟ سؤال حقيقي — أظن أغلب الناس تقدر تحدد التسليمة بالظبط.`,
    designBrief: 'Text-only. LinkedIn suppresses reach on link posts; keep the audit link in the first comment.',
  },

  // ── Week 2 — teach, then earn the offer ─────────────────────────────────
  {
    date: '2026-09-08',
    platform: 'instagram',
    pillar: 'teach',
    format: 'reel',
    campaign: 'q4-decided-in-october',
    hook: 'Your hero image has about one second',
    captionEn: `On a search results grid your hero image gets roughly one second to earn the tap.

In that second a shopper is not reading your title. They are deciding whether your product looks real, whether it looks like the thing they searched for, and whether you look like a business.

Three things that lose that second:
— the product too small in the frame
— a shadow that makes the background read as grey
— an angle that hides what the product actually is

Fill the frame. Kill the shadow. Show the recognisable side.`,
    captionAr: `في شبكة نتائج البحث، صورتك الرئيسية عندها حوالي ثانية واحدة تكسب فيها الضغطة.

في الثانية دي المشتري مش بيقرأ العنوان. بيقرر إذا كان منتجك شكله حقيقي، وشبه اللي هو دوّر عليه، وإذا كنت شكلك بيزنس محترم.

تلات حاجات بتضيّع الثانية دي:
— المنتج صغير جوه الكادر
— ظل بيخلي الخلفية تبان رمادي
— زاوية بتخبي إن المنتج ده إيه أصلًا

املا الكادر. اقتل الظل. ورّي الوجه اللي بيتعرف عليه.`,
    hashtags: ['#productphotography', '#amazonseller', '#تصوير_منتجات'],
    designBrief:
      'Reel. Simulate a marketplace grid scrolling at real speed, then freeze on the weak thumbnail vs the strong one. Screen-recording feel, not a polished ad.',
    template: 'reel-grid',
  },
  {
    date: '2026-09-09',
    platform: 'facebook',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'How to write a marketplace title that is not just keywords',
    captionEn: `A title stuffed with every keyword you can think of does two things: it ranks for a while, and it reads like spam to the person who has to click it.

The structure that works on Amazon.eg and Noon:

Brand → what it actually is → the one attribute buyers filter by → size or quantity

Everything after that is for the algorithm and should be in the backend keyword fields, not the visible title.

The test: read your title out loud. If you would not say it to a customer standing in front of you, rewrite it.`,
    captionAr: `العنوان المحشو بكل كلمة مفتاحية تخطر على بالك بيعمل حاجتين: بيترتب كويس لفترة، وبيتقري كأنه سبام قدام الشخص اللي المفروض يدوس عليه.

الترتيب اللي بيشتغل على أمازون مصر ونون:

الماركة ← المنتج ده إيه فعلًا ← الخاصية الواحدة اللي المشترين بيفلتروا بيها ← المقاس أو الكمية

أي حاجة بعد كده للخوارزمية، ومكانها خانات الكلمات المفتاحية الخلفية، مش العنوان الظاهر.

الاختبار: اقرا عنوانك بصوت عالي. لو مكنتش هتقوله لعميل واقف قدامك، أعد كتابته.`,
    hashtags: ['#amazoneg', '#noonseller', '#تجارة_الكترونية'],
    designBrief:
      'Four slides. Slide 1 a real over-stuffed title struck through. Slides 2–3 the structure broken into labelled parts. Slide 4 the rewritten title. Use ListingOptimizationArt row treatment.',
    template: 'carousel-teach',
  },
  {
    date: '2026-09-09',
    platform: 'linkedin',
    pillar: 'teach',
    format: 'article',
    campaign: 'q4-decided-in-october',
    hook: 'Bilingual listings are not translated listings',
    captionEn: `A translated listing and a bilingual listing are different products, and the gap costs Egyptian sellers conversions daily.

Translation takes an English title and renders it in Arabic. What comes out is grammatically fine and commercially useless, because the Arabic-speaking shopper does not search using the translated words. They search using the words they actually say — which are frequently transliterated English, dialect, or a category name that has no relationship to the formal Arabic term.

A bilingual listing is written twice, against two different keyword sets, for two different search behaviours.

The practical version: pull your search term report and look at what Arabic queries are actually reaching you. In our experience the winning terms are rarely what a translator would produce.

This is one of the reasons we write both languages in-house rather than translating after the fact.

We are FLOW, an e-commerce content studio in Cairo. If you want us to look at one of your listings in both languages, we do that for free.`,
    captionAr: `الصفحة المترجمة والصفحة ثنائية اللغة حاجتين مختلفتين، والفرق بينهم بيكلّف البائعين المصريين مبيعات كل يوم.

الترجمة بتاخد عنوان إنجليزي وتحوّله عربي. اللي بيطلع سليم لغويًا وبلا فايدة تجاريًا، لأن المشتري اللي بيتكلم عربي مش بيدوّر بالكلمات المترجمة. بيدوّر بالكلمات اللي بيقولها فعلًا — واللي غالبًا بتكون إنجليزي مكتوب بحروف عربي، أو لهجة، أو اسم فئة مالوش علاقة بالمصطلح العربي الفصيح.

الصفحة ثنائية اللغة بتتكتب مرتين، على مجموعتين كلمات مفتاحية مختلفتين، لسلوكين بحث مختلفين.

الخلاصة العملية: افتح تقرير كلمات البحث وشوف الاستعلامات العربية اللي فعلًا بتوصل لك. من خبرتنا، الكلمات الرابحة نادرًا ما تكون اللي المترجم هيطلعها.

ده واحد من أسباب إننا بنكتب اللغتين جوه الاستوديو بدل ما نترجم بعدين.

إحنا FLOW، استوديو محتوى للتجارة الإلكترونية في القاهرة. لو عايز نبص على واحد من منتجاتك باللغتين، بنعمل ده مجانًا.`,
    designBrief:
      'Single 1200×627. Two search bars stacked — one with a formal-Arabic query greyed out, one with the real colloquial query in lime.',
    template: 'quote-dark',
  },
  {
    date: '2026-09-10',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'Before and after: a listing rebuilt',
    captionEn: `Left: what the seller had. Right: what we published.

Nothing about the product changed. What changed was whether a shopper scrolling a grid could tell what it was.

We are not going to tell you this doubled anyone's sales — we do not publish numbers we cannot stand behind, and no honest partner guarantees a result.

What we will say: the second one is a listing. The first one is a photo.`,
    captionAr: `الشمال: اللي كان عند البائع. اليمين: اللي إحنا نشرناه.

مفيش حاجة اتغيرت في المنتج نفسه. اللي اتغير هو إذا كان المشتري وهو بيسكرول يقدر يعرف ده إيه ولا لأ.

مش هنقول لك إن ده ضاعف مبيعات حد — إحنا مبننشرش أرقام مش قادرين نقف وراها، ومفيش شريك أمين بيضمن نتيجة.

اللي هنقوله: التاني ده صفحة منتج. الأول ده صورة.`,
    hashtags: ['#beforeandafter', '#productphotography', '#ecommerceegypt', '#تصوير_منتجات'],
    designBrief:
      'Before/after slider carousel from real portfolio pairs. Keep the "before" genuinely unflattering — a sanitised before reads as fake and undoes the point.',
    template: 'compare-2up',
  },
  {
    date: '2026-09-11',
    platform: 'facebook',
    pillar: 'pulse',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'Q4 category demand in Egypt — what moves and when',
    captionEn: `A rough map of when Q4 demand lands in Egypt, so you can sequence your catalogue work instead of doing all of it at once.

Early: electronics and home. Shoppers research these for weeks before buying, so listings need to be live earliest.

Mid: fashion, accessories, cosmetics. Impulse-heavy, image-led, and the categories where a weak hero image costs you most.

Late: toys, gifting, anything bought for someone else. December, and quality of description matters more because the buyer is not the user.

If you can only fix part of your catalogue before the season, fix the earliest category you sell in.`,
    captionAr: `خريطة تقريبية لوقت وصول الطلب في الربع الأخير في مصر، عشان ترتب شغل الكتالوج بدل ما تعمله كله مرة واحدة.

بدري: الإلكترونيات والمنزل. المشترين بيبحثوا فيها أسابيع قبل الشرا، فالصفحات لازم تكون منشورة من بدري.

النص: الأزياء والإكسسوارات ومستحضرات التجميل. شرا اندفاعي، معتمد على الصورة، ودي الفئات اللي الصورة الرئيسية الضعيفة بتكلفك فيها أكتر حاجة.

متأخر: اللعب والهدايا وأي حاجة بتتشرى لحد تاني. ديسمبر، وجودة الوصف بتبقى أهم لأن المشتري مش هو المستخدم.

لو تقدر تصلّح جزء بس من الكتالوج قبل الموسم، صلّح أبكر فئة بتبيع فيها.`,
    hashtags: ['#ecommerceegypt', '#whitefriday', '#تجارة_الكترونية'],
    designBrief:
      'Horizontal Sep→Dec band with three category clusters positioned along it. Light ground, lime markers.',
    template: 'timeline-light',
  },
  {
    date: '2026-09-12',
    platform: 'instagram',
    pillar: 'process',
    format: 'reel',
    campaign: 'q4-decided-in-october',
    hook: 'Studio day: one product, start to published',
    captionEn: `One product, from the table to the listing.

Unboxed, cleaned, lit, shot from the angles the platform requires, retouched to true white, written in two languages, keyworded, formatted to spec, published.

The whole thing is six steps and we do it in one place. That is the entire pitch.`,
    captionAr: `منتج واحد، من الترابيزة لصفحة المنتج.

يتفتح، يتنضف، يتضاء، يتصور من الزوايا اللي المنصة طالباها، يتعمله ريتاتش لأبيض خالص، يتكتب بلغتين، يتحطله كلمات مفتاحية، يتظبط على المواصفات، يتنشر.

كله ست خطوات وبنعملها في مكان واحد. ده العرض بالكامل.`,
    hashtags: ['#behindthescenes', '#productphotography', '#تصوير_منتجات'],
    designBrief:
      'Reel, 20–30s, real studio footage. No voiceover; on-screen step labels matching the six-step names from the handbook.',
    template: 'reel-process',
  },
  {
    date: '2026-09-13',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'The five images every marketplace listing needs',
    captionEn: `Most sellers upload one image and wonder why the listing underperforms. The platforms give you five to seven slots because shoppers use all of them.

1. Hero — product filling the frame on pure white
2. Scale — the product next to something that gives it size
3. Detail — the material, the finish, the thing a photo has to prove
4. In use — the product doing its job
5. What is in the box — every component laid out

Slot 5 kills more returns than any other thing you can do to a listing.`,
    captionAr: `أغلب البائعين بيرفعوا صورة واحدة وبيستغربوا إن الصفحة أداؤها ضعيف. المنصات بتديك خمس لسبع خانات لأن المشترين بيستخدموهم كلهم.

١. الرئيسية — المنتج مالي الكادر على أبيض خالص
٢. الحجم — المنتج جنب حاجة توضّح مقاسه
٣. التفاصيل — الخامة، التشطيب، الحاجة اللي الصورة لازم تثبتها
٤. أثناء الاستخدام — المنتج وهو بيعمل شغله
٥. محتويات العلبة — كل القطع مفرودة

الخانة الخامسة بتقلل المرتجعات أكتر من أي حاجة تانية ممكن تعملها في صفحة المنتج.`,
    hashtags: ['#amazonseller', '#noonseller', '#productphotography', '#تصوير_منتجات'],
    designBrief:
      'Five slides, one image type each, all from the same real product so the set reads as a system rather than five unrelated examples.',
    template: 'carousel-teach',
  },
  {
    date: '2026-09-14',
    platform: 'linkedin',
    pillar: 'proof',
    format: 'text',
    campaign: 'q4-decided-in-october',
    hook: 'What 210 products taught us about catalogue consistency',
    captionEn: `We have photographed and published over 210 products across eight categories. The most useful thing that volume taught us has nothing to do with photography.

It is that a catalogue's problem is almost never the worst listing. It is the variance.

A shopper who lands on three of your products in a row and sees three different lighting temperatures, three crop ratios and three title structures does not consciously notice any of it. They just come away with a vague sense that the brand is small. That impression is formed before they read a single word.

Fixing the worst listing changes one page. Fixing the variance changes what the brand looks like.

Which is why we shoot to a single standard even when a client only sends us five products — the five have to sit next to the ninety they already had.`,
    captionAr: `صوّرنا ونشرنا أكتر من ٢١٠ منتج في تمن فئات. أهم حاجة اتعلمناها من الحجم ده مالهاش علاقة بالتصوير.

إن مشكلة الكتالوج نادرًا ما تكون أسوأ صفحة فيه. المشكلة هي التفاوت.

المشتري اللي بيفتح تلات منتجات ورا بعض ويشوف تلات درجات إضاءة وتلات نسب قص وتلات هياكل عناوين مش بيلاحظ أي حاجة من ده بوعي. بس بيطلع بإحساس مبهم إن العلامة دي صغيرة. الانطباع ده بيتكوّن قبل ما يقرا كلمة واحدة.

إصلاح أسوأ صفحة بيغيّر صفحة واحدة. إصلاح التفاوت بيغيّر شكل العلامة التجارية.

وده سبب إننا بنصور على معيار واحد حتى لو العميل باعت لنا خمس منتجات بس — الخمسة دول لازم يقفوا جنب التسعين اللي عنده.`,
    designBrief: 'Text-only.',
  },

  // ── Week 3 — turn attention into a list ─────────────────────────────────
  {
    date: '2026-09-15',
    platform: 'instagram',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'What 10 EGP a listing actually buys',
    captionEn: `Our per-item content starts at 10 EGP for listing copy, 30 EGP for photography, 35 EGP for both briefed as one job.

People assume that is a typo, so here is what makes it possible: AI moves the volume, a person signs off on what goes live, and we do photography and copy in the same brief instead of buying them from two suppliers.

What you get per product: 3–5 retouched images on pure white, a platform-compliant title, a description in Arabic and English, and a keyword set.

Monthly plans start at 3,500 EGP if you would rather we ran the whole thing.`,
    captionAr: `شغل المحتوى بالقطعة عندنا بيبدأ من ١٠ جنيه لنص الصفحة، و٣٠ جنيه للتصوير، و٣٥ جنيه للاتنين في بريف واحد.

الناس بتفتكر ده خطأ مطبعي، فخليني أقول ليه ده ممكن: الذكاء الاصطناعي بيحرّك الكميات، وشخص بيراجع كل حاجة بتتنشر، وبنعمل التصوير والنصوص في نفس البريف بدل ما نشتريهم من موردين مختلفين.

اللي بتاخده لكل منتج: ٣ لـ٥ صور بريتاتش على أبيض خالص، عنوان مطابق لقواعد المنصة، وصف بالعربي والإنجليزي، ومجموعة كلمات مفتاحية.

والخطط الشهرية بتبدأ من ٣٥٠٠ جنيه لو تفضّل إننا ندير الموضوع كله.`,
    hashtags: ['#ecommerceegypt', '#تجارة_الكترونية', '#amazoneg'],
    designBrief:
      'Price card. Three tiers as bordered rows on the dark panel, exactly the treatment used on the /pricing plan cards so the numbers look native to the brand.',
    template: 'price-card',
  },
  {
    date: '2026-09-16',
    platform: 'facebook',
    pillar: 'teach',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'The backend keyword field most sellers leave empty',
    captionEn: `There is a field on your Amazon listing that shoppers never see and most Egyptian sellers leave blank.

Backend search terms. It is where every keyword that does not belong in a readable title goes — misspellings people actually type, transliterated Arabic, competitor product names, the dialect word for your category.

Rules that matter: no commas needed, no repeating words already in your title, no brand names you do not own, and there is a byte limit, so do not paste an essay.

Ten minutes per listing. It is the highest-return unpaid thing on this list.`,
    captionAr: `في خانة في صفحتك على أمازون المشترين عمرهم ما بيشوفوها، وأغلب البائعين المصريين سايبينها فاضية.

كلمات البحث الخلفية. ده المكان اللي بتحط فيه كل كلمة مفتاحية مش مناسبة لعنوان مقروء — الأخطاء الإملائية اللي الناس بتكتبها فعلًا، والعربي المكتوب بحروف إنجليزي، وأسماء منتجات المنافسين، والكلمة العامية لفئتك.

قواعد مهمة: مش محتاج فواصل، متكررش كلمات موجودة في العنوان، متحطش أسماء ماركات مش بتملكها، وفيه حد أقصى للحجم فمتلزقش موضوع تعبير.

عشر دقايق للصفحة الواحدة. دي أعلى حاجة عائدًا من غير فلوس في القايمة دي.`,
    hashtags: ['#amazonseller', '#amazoneg', '#تجارة_الكترونية'],
    designBrief: 'Screenshot-style frame of the field, annotated with lime callouts.',
    template: 'annotated-ui',
  },
  {
    date: '2026-09-16',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'q4-decided-in-october',
    hook: 'October capacity — opening the Q4 conversation',
    captionEn: `We are starting to scope October catalogues.

If you sell on Amazon.eg, Noon, TikTok Shop or Shopify and you know your Q4 products need better content, the useful thing to do now is scoping, not booking. Scoping tells you how big the job actually is — and quite often the answer is "smaller than you feared, and it is these six products, not the whole catalogue".

We will do that scoping conversation for free and tell you honestly if the answer is that you do not need us this quarter.

Two things we will not do, so you know what you are getting into: we will not quote you a delivery date before production has looked at your volume, and we will not promise you a ranking. Anyone who does either is guessing.

DM me if Q4 content is on your list.`,
    captionAr: `بدأنا نحدد نطاق كتالوجات أكتوبر.

لو بتبيع على أمازون مصر أو نون أو تيك توك شوب أو شوبيفاي، وعارف إن منتجات الربع الأخير عندك محتاجة محتوى أحسن، الحاجة المفيدة دلوقتي هي تحديد النطاق، مش الحجز. تحديد النطاق بيقول لك الشغل كبير قد إيه فعلًا — وكتير الإجابة بتكون "أصغر مما تتخيل، وهي الست منتجات دول، مش الكتالوج كله".

هنعمل مكالمة تحديد النطاق دي مجانًا، وهنقول لك بصراحة لو الإجابة إنك مش محتاجنا الربع ده.

وحاجتين مش هنعملهم عشان تعرف إنت داخل على إيه: مش هنديك تاريخ تسليم قبل ما الإنتاج يشوف حجم شغلك، ومش هنوعدك بترتيب معين. أي حد بيعمل أي واحدة من دول بيخمّن.

ابعت لي رسالة لو محتوى الربع الأخير على قايمتك.`,
    designBrief: 'Text-only.',
  },
  {
    date: '2026-09-17',
    platform: 'instagram',
    pillar: 'proof',
    format: 'reel',
    campaign: 'q4-decided-in-october',
    hook: 'Retouching a reflective product to true white',
    captionEn: `Reflective products are where cheap retouching falls apart.

Chrome, glass, anything glossy — it picks up the room. Push the background to pure white carelessly and you eat the product's edge along with it, and the shopper gets a floating shape with no form.

This is the part that takes a person, not a filter.`,
    captionAr: `المنتجات اللامعة هي المكان اللي الريتاتش الرخيص بيقع فيه.

الكروم والزجاج وأي حاجة لامعة بتعكس الأوضة. لو فتّحت الخلفية لأبيض خالص بإهمال، هتاكل حرف المنتج معاها، والمشتري هيشوف شكل طايف من غير مجسم.

الجزء ده محتاج شخص، مش فلتر.`,
    hashtags: ['#retouching', '#productphotography', '#تصوير_منتجات'],
    designBrief: 'Screen recording of the retouch, sped up, with the edge detail zoomed at the end.',
    template: 'reel-process',
  },
  {
    date: '2026-09-18',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'Audit reminder with the first results in',
    captionEn: `We have been pulling apart sellers' listings free all month. The three problems that came up most:

1. Hero images shot at an angle that hides the product
2. Titles written for the algorithm and unreadable to a person
3. Arabic descriptions that are translations, not listings

None of those need a new product or a bigger budget. They need someone to look properly.

Still free, still no pitch. Comment "AUDIT" with a link.`,
    captionAr: `قضينا الشهر كله بنفكّك صفحات منتجات البائعين مجانًا. أكتر تلات مشاكل ظهرت:

١. صور رئيسية متصورة بزاوية بتخبي المنتج
٢. عناوين متكتبة للخوارزمية ومستحيل حد يقراها
٣. أوصاف عربية عبارة عن ترجمة، مش صفحات منتج

ولا واحدة من دول محتاجة منتج جديد ولا ميزانية أكبر. محتاجة حد يبص صح.

لسه مجانًا، ولسه من غير عرض بيع. اكتب "مراجعة" مع لينك.`,
    hashtags: ['#ecommerceegypt', '#amazonseller'],
    designBrief: 'Same offer-dark template as 09-04 with the three findings as bordered rows.',
    template: 'offer-dark',
  },
  {
    date: '2026-09-19',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'TikTok Shop needs different photography from Amazon',
    captionEn: `A TikTok Shop listing is not an Amazon listing with a different logo on it.

Amazon: pure white, product isolated, shopper is already searching with intent.

TikTok Shop: the shopper was not looking for anything. Your image has to interrupt. That means context, lifestyle, colour, and a first frame that reads at thumb-speed on a dark feed.

Same product, different job. Sellers who reuse their Amazon set on TikTok Shop underperform and blame the platform.`,
    captionAr: `صفحة تيك توك شوب مش صفحة أمازون بلوجو مختلف.

أمازون: أبيض خالص، منتج معزول، والمشتري أصلًا بيدوّر بنية شرا.

تيك توك شوب: المشتري مكانش بيدوّر على حاجة. صورتك لازم تقاطعه. يعني سياق، ولايف ستايل، ولون، وأول فريم يتقرا بسرعة الصوابع على فيد غامق.

نفس المنتج، شغلانة مختلفة. البائعين اللي بيعيدوا استخدام صور أمازون على تيك توك شوب أداؤهم بيقل وبيلوموا المنصة.`,
    hashtags: ['#tiktokshop', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Two-column comparison across slides: same product, Amazon treatment vs TikTok Shop treatment.',
    template: 'compare-2up',
  },
  {
    date: '2026-09-20',
    platform: 'instagram',
    pillar: 'pulse',
    format: 'static',
    campaign: 'q4-decided-in-october',
    hook: 'Ten days to October',
    captionEn: `Ten days until the month that decides your Q4.

If your season products are not scoped by the end of September, you are going to be making content decisions under time pressure in October — which is how sellers end up publishing whatever they can rather than what works.

The unglamorous work this week: list the products that carry your season. Usually five to ten. Look at each one's images the way a stranger would.

That list is the whole job.`,
    captionAr: `عشر أيام على الشهر اللي بيحدد ربعك الأخير.

لو منتجات موسمك مش محدد نطاقها بنهاية سبتمبر، هتاخد قرارات محتوى تحت ضغط وقت في أكتوبر — وده اللي بيخلي البائعين ينشروا أي حاجة يقدروا عليها بدل اللي بيشتغل.

الشغل غير اللامع الأسبوع ده: اعمل ليستة بالمنتجات اللي شايلة موسمك. غالبًا من خمسة لعشرة. وبص على صور كل واحد فيهم بعين غريب.

الليستة دي هي الشغلانة كلها.`,
    hashtags: ['#ecommerceegypt', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Countdown card: large "10" in display type, dark panel, one line beneath.',
    template: 'statement-dark',
  },
  {
    date: '2026-09-21',
    platform: 'linkedin',
    pillar: 'pulse',
    format: 'article',
    campaign: 'q4-decided-in-october',
    hook: 'Marketplace compliance is a content problem, not a legal one',
    captionEn: `When a marketplace rejects a listing, most sellers treat it as an administrative annoyance. It is usually a content problem, and it usually recurs.

The rejections we see most often on Amazon.eg and Noon are not policy violations in any meaningful sense. They are image specification failures, category attribute mismatches, and titles that break a formatting rule the seller did not know existed. Each one costs days at a point in the calendar where days matter.

The structural fix is not "be more careful". It is to build listings against the destination platform's spec from the start, rather than producing generic content and reformatting it per platform afterwards. Reformatting after the fact is where the errors enter.

That is a workflow decision, not a diligence one — which is why the same sellers keep getting the same rejections no matter how carefully they check.

Worth auditing: how many of your rejections in the last year were the same category of error?`,
    captionAr: `لما المتجر الإلكتروني يرفض صفحة منتج، أغلب البائعين بيتعاملوا معاها كإزعاج إداري. وهي في الغالب مشكلة محتوى، وفي الغالب بتتكرر.

الرفض اللي بنشوفه أكتر حاجة على أمازون مصر ونون مش مخالفات سياسات بأي معنى حقيقي. دي إخفاقات في مواصفات الصور، وعدم تطابق خصائص التصنيف، وعناوين بتكسر قاعدة تنسيق البائع مكانش يعرف إنها موجودة. كل واحدة بتكلّف أيام في وقت من السنة الأيام فيه بتفرق.

الحل الهيكلي مش "خلي بالك أكتر". الحل إنك تبني الصفحات على مواصفات المنصة المستهدفة من الأول، بدل ما تنتج محتوى عام وتعيد تنسيقه لكل منصة بعدين. إعادة التنسيق بعد الإنتاج هي المكان اللي الأخطاء بتدخل منه.

ده قرار سير عمل، مش قرار دقة — وده سبب إن نفس البائعين بيقعوا في نفس الرفض مهما راجعوا بعناية.

يستاهل المراجعة: كام واحدة من حالات الرفض عندك السنة اللي فاتت كانت نفس نوع الخطأ؟`,
    designBrief: 'Text-only.',
  },

  // ── Week 4 — hand off to October ────────────────────────────────────────
  {
    date: '2026-09-22',
    platform: 'instagram',
    pillar: 'proof',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'A jewellery set, shot for three platforms',
    captionEn: `Jewellery is the hardest category we shoot and the one where bad photography costs the most.

Small, reflective, detail-dependent, and bought almost entirely on how it looks. There is nowhere to hide.

Three platforms, three treatments, one shoot.`,
    captionAr: `المجوهرات أصعب فئة بنصورها، وأكتر فئة التصوير الوحش بيكلّف فيها.

صغيرة، لامعة، معتمدة على التفاصيل، وبتتشرى بالكامل تقريبًا على أساس شكلها. مفيش مكان تخبي فيه.

تلات منصات، تلات معالجات، جلسة تصوير واحدة.`,
    hashtags: ['#jewellery', '#productphotography', '#تصوير_مجوهرات', '#ecommerceegypt'],
    designBrief: 'Real jewellery category images from the portfolio, three platform crops of the same hero.',
    template: 'carousel-categories',
  },
  {
    date: '2026-09-23',
    platform: 'facebook',
    pillar: 'process',
    format: 'carousel',
    campaign: 'q4-decided-in-october',
    hook: 'What we need from you to start',
    captionEn: `The question we get most: what do you actually need from me?

1. The products — physical items to the studio, or a location shoot for anything large, fragile or high-value
2. Your product list — names, variants, whatever specs you already have
3. Access to your seller account, if you want us publishing directly
4. Anything you already have that works — existing images, a brand guide, a competitor you like

That is it. You keep ownership of your accounts throughout, and the photography and copy belong to you on delivery.

Access can be revoked any time. We do not hold accounts hostage.`,
    captionAr: `أكتر سؤال بييجي لنا: إنت محتاج مني إيه بالظبط؟

١. المنتجات — تتبعت للاستوديو، أو تصوير في الموقع لأي حاجة كبيرة أو قابلة للكسر أو عالية القيمة
٢. ليستة منتجاتك — الأسماء والأنواع وأي مواصفات موجودة عندك
٣. صلاحية دخول على حساب البائع بتاعك، لو عايزنا ننشر مباشرة
٤. أي حاجة عندك بالفعل وشغالة — صور موجودة، دليل هوية، منافس عاجبك

وبس. إنت بتفضل مالك حساباتك طول الوقت، والتصوير والنصوص بيبقوا ملكك عند التسليم.

والصلاحية ممكن تتسحب في أي وقت. إحنا مش بنحتجز حسابات حد.`,
    hashtags: ['#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Four numbered rows on the light ground, using the WorkflowSection step-card treatment.',
    template: 'carousel-teach',
  },
  {
    date: '2026-09-24',
    platform: 'instagram',
    pillar: 'teach',
    format: 'reel',
    campaign: 'q4-decided-in-october',
    hook: 'Scale shots: the image that stops returns',
    captionEn: `The cheapest return you will ever prevent is a scale shot.

A product photographed alone on white has no size. The shopper builds their own idea of how big it is, and if they are wrong, it comes back — and the return is not just the refund, it is the review.

Put something recognisable next to it. A hand, a coin, a phone. It takes one extra frame.`,
    captionAr: `أرخص مرتجع هتمنعه في حياتك هو صورة توضّح الحجم.

المنتج المتصور لوحده على أبيض مالوش مقاس. المشتري بيبني تصوره الخاص لحجمه، ولو طلع غلط، بيرجع — والمرتجع مش بس استرجاع الفلوس، ده التقييم كمان.

حط جنبه حاجة معروفة. إيد، عملة، موبايل. الموضوع فريم واحد زيادة.`,
    hashtags: ['#productphotography', '#amazonseller', '#تصوير_منتجات'],
    designBrief: 'Reel: same product shot alone, then with a hand for scale. The reveal is the point.',
    template: 'reel-grid',
  },
  {
    date: '2026-09-25',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'October scoping is open',
    captionEn: `October scoping is open.

If your season depends on a handful of products looking better than they do now, this is the month to sort it — not November, when you will be handling orders.

Book a scoping call and we will tell you how big the job is and which products are actually worth it. Free, and we will tell you if the answer is that you do not need us.

We will not quote a delivery date until production has seen your volume. Anyone who does before that is guessing.`,
    captionAr: `تحديد نطاق شغل أكتوبر مفتوح.

لو موسمك متوقف على كام منتج محتاجين يبقوا أحسن من كده، الشهر ده هو وقت ترتيبها — مش نوفمبر، لما تكون بتتعامل مع الأوردرات.

احجز مكالمة تحديد نطاق وهنقول لك الشغل كبير قد إيه، وأنهي منتجات فعلًا تستاهل. مجانًا، وهنقول لك لو الإجابة إنك مش محتاجنا.

مش هنحدد تاريخ تسليم قبل ما الإنتاج يشوف حجم شغلك. أي حد بيعمل كده قبلها بيخمّن.`,
    hashtags: ['#ecommerceegypt', '#whitefriday', '#تجارة_الكترونية'],
    designBrief: 'Offer-dark with a calendar motif; October highlighted in lime.',
    template: 'offer-dark',
  },
  {
    date: '2026-09-26',
    platform: 'instagram',
    pillar: 'proof',
    format: 'static',
    campaign: 'q4-ready',
    hook: '210+ products, 8 categories, 4 marketplaces',
    captionEn: `210+ products photographed and published. Eight categories. Four marketplaces.

Not a big number by global standards. A real one, though — every product in it was shot in our studio, written in two languages, and published to a live seller account.

We would rather show you a real catalogue than a rounded-up statistic.`,
    captionAr: `أكتر من ٢١٠ منتج اتصوروا واتنشروا. تمن فئات. أربع منصات.

مش رقم كبير بالمقاييس العالمية. بس رقم حقيقي — كل منتج فيه اتصور في الاستوديو بتاعنا، واتكتب بلغتين، واتنشر على حساب بائع شغال.

نفضّل نوريك كتالوج حقيقي على إحصائية مكوّرة.`,
    hashtags: ['#ecommerceegypt', '#productphotography', '#تصوير_منتجات'],
    designBrief:
      'Stat card, the three figures set at display size in lime on the dark panel — the same treatment as the site hero stats.',
    template: 'stat-card',
  },
  {
    date: '2026-09-27',
    platform: 'instagram',
    pillar: 'pulse',
    format: 'story',
    campaign: 'q4-ready',
    hook: 'Poll: how ready is your catalogue for Q4?',
    captionEn: `Poll: how ready is your Q4 catalogue?
— Sorted
— Some products need work
— Have not looked yet`,
    captionAr: `استطلاع: كتالوجك جاهز قد إيه للربع الأخير؟
— جاهز
— بعض المنتجات محتاجة شغل
— لسه مبصتش`,
    designBrief: 'Native IG poll sticker on a plain dark panel. The answers seed October DM outreach.',
  },
  {
    date: '2026-09-28',
    platform: 'linkedin',
    pillar: 'offer',
    format: 'text',
    campaign: 'q4-ready',
    hook: 'Where October capacity stands',
    captionEn: `A short, practical note as October opens.

We scope catalogues before we quote them, and scoping slots for October are filling. That is not a scarcity tactic — it is that photography has a physical throughput and we would rather tell you now than take a booking we cannot serve well.

If Q4 content is on your list, the useful next step is a scoping conversation this week rather than a decision in three weeks.

And if you scope with us and decide against it, that is a fine outcome. We would rather have the accurate picture than the booking.`,
    captionAr: `ملاحظة قصيرة وعملية مع بداية أكتوبر.

إحنا بنحدد نطاق الكتالوجات قبل ما نسعّرها، ومواعيد تحديد النطاق في أكتوبر بتمتلي. ده مش أسلوب ندرة — ده لأن التصوير ليه طاقة إنتاجية مادية، ونفضّل نقول لك دلوقتي بدل ما ناخد حجز مش هنقدر نخدمه كويس.

لو محتوى الربع الأخير على قايمتك، الخطوة المفيدة هي مكالمة تحديد نطاق الأسبوع ده، مش قرار بعد تلات أسابيع.

ولو حددت النطاق معانا وقررت إنك مش هتكمل، دي نتيجة كويسة برضه. نفضّل الصورة الدقيقة على الحجز.`,
    designBrief: 'Text-only.',
  },
  {
    date: '2026-09-29',
    platform: 'instagram',
    pillar: 'teach',
    format: 'carousel',
    campaign: 'q4-ready',
    hook: 'Your listing checklist before the season',
    captionEn: `Save this and run it against your top five products before October ends.

□ Hero fills the frame, pure white, no shadow cast
□ Five image slots used, not one
□ A scale reference somewhere in the set
□ Title readable out loud, brand first
□ Backend keywords filled
□ Arabic written, not translated
□ Category attributes complete
□ What-is-in-the-box image present

Eight boxes. Most catalogues fail on three of them, and they are always the same three.`,
    captionAr: `احفظ ده وطبّقه على أعلى خمس منتجات عندك قبل ما أكتوبر يخلص.

□ الصورة الرئيسية مالية الكادر، أبيض خالص، من غير ظل
□ خانات الصور الخمسة مستخدمة، مش واحدة
□ فيه مرجع للحجم في المجموعة
□ العنوان يتقري بصوت عالي، والماركة الأول
□ الكلمات المفتاحية الخلفية متملية
□ العربي متكتب، مش مترجم
□ خصائص التصنيف كاملة
□ صورة محتويات العلبة موجودة

تمن مربعات. أغلب الكتالوجات بتسقط في تلاتة منهم، وهما دايمًا نفس التلاتة.`,
    hashtags: ['#amazonseller', '#noonseller', '#ecommerceegypt', '#تجارة_الكترونية'],
    designBrief: 'Checklist card designed to be screenshotted and saved. High contrast, big tap targets, no clutter.',
    template: 'checklist',
  },
  {
    date: '2026-09-30',
    platform: 'facebook',
    pillar: 'offer',
    format: 'static',
    campaign: 'q4-ready',
    hook: 'September closes — what happens next',
    captionEn: `September is done. Here is the honest state of play.

The sellers who will do well in November mostly finished thinking about it this month. The ones who start in November will be publishing whatever they can get done in time.

October is the last month where you have choices rather than constraints.

If you want us to look at your catalogue, the door is open and the audit is still free.`,
    captionAr: `سبتمبر خلص. وده الوضع بصراحة.

البائعين اللي هيعملوا نتيجة كويسة في نوفمبر أغلبهم خلصوا تفكيرهم في الموضوع الشهر ده. واللي هيبدأوا في نوفمبر هينشروا أي حاجة يقدروا يخلصوها في الوقت.

أكتوبر هو آخر شهر عندك فيه اختيارات بدل قيود.

لو عايزنا نبص على كتالوجك، الباب مفتوح والمراجعة لسه مجانية.`,
    hashtags: ['#ecommerceegypt', '#whitefriday'],
    designBrief: 'Handover card: Sep→Oct arrow, October marked as the decision month.',
    template: 'timeline-light',
  },
]
