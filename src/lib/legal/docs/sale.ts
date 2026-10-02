import { docLink, type DocContext } from "../context";
import { doc, esc, escLines, h1, h3, link, mail, numbered, ul } from "../md";
import { consumerDisputeText } from "./shared";

export function termsOfSale(ctx: DocContext): string {
  const { p, country } = ctx;
  const f = p.features;
  const h2 = numbered();
  const consumers = p.audience !== "b2b";
  const businesses = p.audience !== "b2c";
  const withdrawalFn = p.withdrawalUrl ? link("withdrawal function", p.withdrawalUrl) : "withdrawal function";

  const what = [
    f.physicalGoods && "physical goods",
    f.digitalProducts && "digital content",
    (f.subscriptions || f.payments) && "services",
  ].filter(Boolean) as string[];

  return doc([
    h1("Terms of Sale"),
    `*Last updated: ${ctx.updated}*`,

    h2("Scope"),
    `These Terms of Sale apply to all purchases of ${what.join(", ") || "products and services"} from ${ctx.company} ("we", "us") through ${ctx.site}. Our company details are listed in our ${docLink(ctx, "imprint", "Legal Notice")}. Use of the website itself is governed by our ${docLink(ctx, "terms", "Terms of Service")}.`,
    p.audience === "b2b"
      ? "We sell exclusively to businesses. By placing an order, you confirm that you are acting for purposes relating to your trade, business, craft or profession."
      : consumers && businesses
        ? `A "consumer" is anyone acting for purposes outside their trade, business, craft or profession. Some provisions apply only to consumers or only to business customers, as stated.`
        : "",

    h2("Prices and payment"),
    ul([
      consumers
        ? "All prices for consumers are shown in euros and include VAT at the applicable rate."
        : "All prices are shown in euros, excluding VAT. VAT is added where applicable; for intra-EU business customers with a valid VAT number, the reverse-charge mechanism may apply.",
      f.physicalGoods && "Any delivery costs are shown clearly before you place your order.",
      `Payment is due at the time of order unless stated otherwise. We accept the payment methods shown at checkout.`,
      "You will receive an invoice by email.",
    ]),

    h2("How the contract is concluded"),
    `Our product presentations on the website are not binding offers. By clicking the order button (for example "Buy now" or "Subscribe and pay"), you make a binding offer to purchase. The contract is concluded when we confirm your order by email or provide the product or service. Before submitting your order, you can review and correct your details. The contract language is English. We store the contract text and send you the order details and these Terms by email.`,

    f.physicalGoods && h2("Delivery"),
    f.physicalGoods &&
      `We deliver to the addresses and countries shown at checkout. Delivery times are indicated on the product page. If an item is unavailable, we will inform you immediately and refund any payment already made. ${
        consumers ? "For consumers, the risk of loss or damage passes to you only when you, or a person you name, receive the goods." : ""
      }`,

    (f.digitalProducts || f.subscriptions || f.payments) && h2("Provision of digital content and services"),
    (f.digitalProducts || f.subscriptions || f.payments) &&
      `Digital content and services are made available immediately after payment, or at the time agreed, through your account or by email. You need a compatible device and internet connection; the technical requirements are stated in the product description.`,

    f.subscriptions && h2("Subscriptions, renewal and cancellation"),
    f.subscriptions &&
      ul([
        "Subscriptions run for the period you select (for example monthly or yearly) and renew automatically for the same period unless cancelled.",
        "You can cancel at any time in your account settings or by emailing us. Cancellation takes effect at the end of the current billing period; you keep access until then.",
        consumers &&
          "If your subscription has a minimum term longer than one month, after that minimum term it can be cancelled at any time with one month's notice.",
        "We will notify you of any price change at least 30 days before it takes effect. If you do not agree, you can cancel before the change applies.",
      ]),

    consumers && h2("Right of withdrawal (consumers only)"),
    consumers && h3("Your right"),
    consumers &&
      `If you are a consumer, you have the right to withdraw from this contract within 14 days without giving any reason. The withdrawal period expires 14 days after ${
        f.physicalGoods
          ? "the day on which you, or a third party other than the carrier indicated by you, take physical possession of the goods (for multiple goods delivered separately, of the last item)"
          : "the day the contract is concluded"
      }.`,
    consumers && h3("How to withdraw"),
    consumers &&
      `To exercise your right of withdrawal, use the ${withdrawalFn} on our website (labelled "Withdraw from contract here"), which is available throughout the withdrawal period, or inform us by a clear statement (for example by email to ${mail(
        p.email,
      )} or by post to ${ctx.company}, ${escLines(p.address).replace(/ {2}\n/g, ", ")}). You may use the model withdrawal form below, but it is not obligatory. We will confirm receipt of your withdrawal on a durable medium (for example by email) without delay. To meet the deadline, it is sufficient to send your withdrawal before the withdrawal period has expired.`,
    consumers && h3("Effects of withdrawal"),
    consumers &&
      `If you withdraw, we will refund all payments received from you, ${
        f.physicalGoods ? "including standard delivery costs, " : ""
      }without undue delay and at the latest within 14 days of the day we are informed of your decision. We use the same means of payment you used for the original transaction, unless you have expressly agreed otherwise; you will not incur any fees as a result.`,
    consumers &&
      f.physicalGoods &&
      `We may withhold the refund until we have received the goods back or you have supplied evidence of having sent them back, whichever is earlier. You must send back the goods without undue delay and in any event within 14 days of informing us of your withdrawal. You bear the direct cost of returning the goods. You are only liable for any diminished value of the goods resulting from handling beyond what is necessary to establish their nature, characteristics and functioning.`,
    consumers &&
      (f.subscriptions || f.payments) &&
      `If you asked us to start providing services during the withdrawal period, you must pay us an amount proportionate to what has been provided until you inform us of your withdrawal.`,
    consumers && h3("Exceptions"),
    consumers &&
      ul([
        f.digitalProducts &&
          "For digital content not supplied on a tangible medium, the right of withdrawal ends once delivery has begun, if you expressly consented to this before the end of the withdrawal period, acknowledged that you would lose your right of withdrawal, and we confirmed this on a durable medium.",
        (f.subscriptions || f.payments) &&
          "For services, the right of withdrawal ends once the service has been fully performed, if performance began with your express prior consent and your acknowledgement that you would lose the right of withdrawal once we have fully performed the contract.",
        f.physicalGoods && "Goods made to your specifications or clearly personalised, and sealed goods that are unsuitable for return for health or hygiene reasons once unsealed, cannot be returned.",
      ]) || false,
    consumers && h3("Model withdrawal form"),
    consumers &&
      `*(Complete and return this form only if you wish to withdraw from the contract.)*`,
    consumers &&
      [
        `> To ${ctx.company}, ${escLines(p.address).replace(/ {2}\n/g, ", ")}, ${mail(p.email)}:`,
        `> I/We (\\*) hereby give notice that I/We (\\*) withdraw from my/our (\\*) contract of sale of the following goods (\\*)/for the provision of the following service (\\*):`,
        "> Ordered on (\\*)/received on (\\*):",
        "> Name of consumer(s):",
        "> Address of consumer(s):",
        "> Signature of consumer(s) (only if this form is notified on paper):",
        "> Date:",
        "> (\\*) Delete as appropriate.",
      ].join("\n>\n"),

    h2("Warranty and conformity"),
    consumers &&
      `Consumers benefit from the statutory legal guarantee of conformity. For goods, we are liable for any lack of conformity that becomes apparent within two years of delivery. For digital content and services, we ensure they remain in conformity for the period they are provided under the contract and provide the updates, including security updates, needed to keep them in conformity. Your statutory rights are not affected by any commercial guarantee.`,
    businesses &&
      `${consumers ? "For business customers, " : ""}warranty claims must be notified in writing without undue delay after discovery of the defect. The limitation period for warranty claims is one year from delivery, except in cases of intent, gross negligence or injury to life, body or health.`,

    h2("Complaints and dispute resolution"),
    `If you have a complaint, please contact us at ${mail(p.email)} first. We aim to resolve all complaints within 14 days.`,
    consumers &&
      consumerDisputeText(ctx),

    h2("Governing law"),
    `These Terms are governed by the laws of ${esc(country.name)}, excluding the UN Convention on Contracts for the International Sale of Goods.${
      consumers
        ? " If you are a consumer, this choice of law does not deprive you of the protection of the mandatory provisions of the law of the country where you have your habitual residence."
        : ""
    }`,
  ]);
}
