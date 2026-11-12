import type { ContractLocale } from './contracts'

/**
 * A plain starting point for the CEO's first template. It is NOT legal advice —
 * have a lawyer review the wording before it goes to a client. Placeholders are
 * documented in the template editor.
 */
export const STARTER_CONTRACT: Record<ContractLocale, { name: string; body: string }> = {
  en: {
    name: 'Service agreement (starter)',
    body: `SERVICE AGREEMENT

This agreement is made on {{today}} between FLOW Agency ("FLOW") and {{company}} ("the Client"), represented by {{contact_name}}.

1. Scope of services
FLOW will provide e-commerce services for the Client on the following marketplace(s): {{platforms}}. The services in scope are those agreed with the Client in writing, which may include seller-account setup, product photography, listing creation and optimisation, uploading to the marketplace, and ongoing account management.

2. Term
The agreement starts on {{start_date}} and runs for {{months}} months.

3. Fees and payment
The Client will pay FLOW the following:
{{phases_table}}
Total contract value: {{total}}. Fees are due in advance for each month unless agreed otherwise in writing. Late payment may pause the services until the balance is settled.

4. Client responsibilities
The Client will supply, in good time, the documents, product information and access that FLOW reasonably needs, and will confirm that everything supplied is accurate and that the Client has the right to use it.

5. Ownership
The Client owns its marketplace accounts, brand and product data. FLOW may keep and show non-confidential examples of its own work (such as photography) in its portfolio unless the Client objects in writing.

6. Results
FLOW will perform the services with reasonable skill and care. Sales and rankings on marketplaces depend on factors outside FLOW's control, so FLOW cannot guarantee specific results.

7. Confidentiality
Each party will keep the other's non-public business information confidential during and after this agreement.

8. Termination
Either party may end this agreement for a serious, unremedied breach after 14 days' written notice. Fees for work already performed remain payable.

9. General
This agreement is the whole agreement between the parties on its subject. Changes must be in writing. Egyptian law governs it, and the courts of Cairo have jurisdiction.

By accepting below, the Client confirms it has read and agrees to this agreement.`,
  },
  ar: {
    name: 'اتفاقية خدمات (نموذج أولي)',
    body: `اتفاقية خدمات

تُبرم هذه الاتفاقية بتاريخ {{today}} بين وكالة FLOW ("فلو") و{{company}} ("العميل") ويمثله {{contact_name}}.

١. نطاق الخدمات
تقدّم فلو للعميل خدمات التجارة الإلكترونية على المنصات التالية: {{platforms}}. وتشمل الخدمات ما تم الاتفاق عليه كتابةً مع العميل، ومنها إنشاء حساب البائع، وتصوير المنتجات، وإنشاء قوائم المنتجات وتحسينها، والرفع على المنصة، وإدارة الحساب بشكل مستمر.

٢. المدة
تبدأ الاتفاقية في {{start_date}} وتستمر لمدة {{months}} أشهر.

٣. الأتعاب والدفع
يدفع العميل لفلو ما يلي:
{{phases_table}}
إجمالي قيمة العقد: {{total}}. تُستحق الأتعاب مقدمًا عن كل شهر ما لم يُتفق على غير ذلك كتابةً. وقد يؤدي التأخر في السداد إلى إيقاف الخدمات مؤقتًا حتى تسوية المستحق.

٤. التزامات العميل
يوفّر العميل في الوقت المناسب المستندات ومعلومات المنتجات وصلاحيات الدخول التي تحتاجها فلو بصورة معقولة، ويقرّ بصحة كل ما يقدمه وبأن له الحق في استخدامه.

٥. الملكية
يملك العميل حساباته على المنصات وعلامته التجارية وبيانات منتجاته. ويجوز لفلو الاحتفاظ بأمثلة غير سرية من أعمالها (مثل التصوير) وعرضها في معرض أعمالها ما لم يعترض العميل كتابةً.

٦. النتائج
تؤدي فلو الخدمات بمهارة وعناية معقولتين. ونظرًا لأن المبيعات وترتيب المنتجات على المنصات تتأثر بعوامل خارجة عن إرادة فلو، فلا يمكنها ضمان نتائج محددة.

٧. السرية
يلتزم كل طرف بالحفاظ على سرية المعلومات غير المعلنة للطرف الآخر أثناء الاتفاقية وبعدها.

٨. الإنهاء
يجوز لأي من الطرفين إنهاء الاتفاقية عند الإخلال الجسيم غير المعالج بعد إخطار كتابي مدته ١٤ يومًا. وتبقى الأتعاب المستحقة عن الأعمال المنفذة واجبة السداد.

٩. أحكام عامة
تمثل هذه الاتفاقية كامل الاتفاق بين الطرفين في موضوعها، ولا يُعدّل أي بند فيها إلا كتابةً. وتخضع للقانون المصري، ويختص بها قضاء القاهرة.

بقبوله أدناه، يقرّ العميل بأنه قرأ هذه الاتفاقية ووافق عليها.`,
  },
}
