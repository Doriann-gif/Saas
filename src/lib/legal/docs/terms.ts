import { docLink, type DocContext } from "../context";
import { doc, esc, h1, mail, numbered, ul } from "../md";
import { sellsOnline } from "../schema";

export function termsOfService(ctx: DocContext): string {
  const { p, country } = ctx;
  const f = p.features;
  const h2 = numbered();
  const consumers = p.audience !== "b2b";
  const businesses = p.audience !== "b2c";
  const minAge = p.minimumAge ?? Math.max(16, country.digitalConsentAge);

  return doc([
    h1("Terms of Service"),
    `*Last updated: ${ctx.updated}*`,

    h2("About these terms"),
    `These Terms of Service ("Terms") govern your use of ${ctx.site} and the services we provide through it (together, the "Service"). The Service is operated by ${ctx.company}, ${esc(country.name)} ("we", "us"). Our full company details are in our ${docLink(ctx, "imprint", "Legal Notice")}.`,
    `By using the Service you agree to these Terms. If you do not agree, please do not use the Service.${
      sellsOnline(p) ? ` Purchases are additionally governed by our ${docLink(ctx, "sale", "Terms of Sale")}.` : ""
    }`,
    `How we handle personal data is described in our ${docLink(ctx, "privacy", "Privacy Policy")}.`,

    h2("Who can use the Service"),
    `You must be at least ${minAge} years old to use the Service${f.accounts ? " and create an account" : ""}.${
      businesses
        ? " If you use the Service on behalf of a company or other organisation, you confirm that you are authorised to accept these Terms on its behalf."
        : ""
    }`,

    f.accounts && h2("Your account"),
    f.accounts &&
      ul([
        "You must provide accurate information when you register and keep it up to date.",
        "You are responsible for keeping your login details confidential and for all activity under your account.",
        `Tell us immediately at ${mail(p.email)} if you suspect unauthorised use of your account.`,
        "You can delete your account at any time.",
      ]),

    h2("Acceptable use"),
    `You agree not to:`,
    ul([
      "use the Service in breach of any applicable law or the rights of others;",
      "upload or distribute malware, spam or content that is illegal, defamatory, hateful or infringes intellectual property rights;",
      "attempt to gain unauthorised access to the Service, other accounts or our systems;",
      "interfere with or overload the Service, including by automated scraping beyond normal use;",
      "resell or commercially exploit the Service without our written permission.",
    ]),

    f.userContent && h2("Your content"),
    f.userContent &&
      `You keep ownership of the content you upload or publish through the Service ("Your Content"). You grant us a non-exclusive, worldwide, royalty-free licence to host, store, reproduce and display Your Content solely to operate and provide the Service to you. This licence ends when you delete Your Content, except for backup copies kept for a limited time.`,
    f.userContent &&
      `You are responsible for Your Content and confirm you have the necessary rights to it. In line with the EU Digital Services Act, anyone can report content they consider illegal by contacting ${mail(
        p.email,
      )}. We review notices diligently and may remove content or suspend accounts that breach these Terms or the law; where we do, we will tell you the reasons and how you can contest the decision.`,

    h2("Intellectual property"),
    `The Service, including its software, design, texts, logos and trademarks, is owned by us or our licensors and protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable right to use the Service in line with these Terms. No other rights are granted.`,

    h2("Third-party services and links"),
    `The Service may contain links to, or integrations with, third-party websites and services. We are not responsible for their content or practices, and their own terms apply.`,

    h2("Availability and changes to the Service"),
    `We work to keep the Service available and secure, but we cannot guarantee uninterrupted availability. We may carry out maintenance and improve, change or discontinue features.${
      consumers
        ? " Where you have paid for the Service, we will only make changes that are reasonable and do not substantially reduce what you paid for, and we will inform you in advance as required by law."
        : ""
    }`,

    h2("Suspension and termination"),
    `You may stop using the Service at any time${f.accounts ? " and delete your account" : ""}. We may suspend or terminate your access if you seriously or repeatedly breach these Terms, or if required by law. Where reasonable, we will warn you first and give you the opportunity to fix the issue.`,

    h2("Liability"),
    consumers &&
      `If you are a consumer, we are liable in accordance with the statutory provisions. Nothing in these Terms limits our liability for death or personal injury caused by our negligence, for fraud, for intent or gross negligence, or any other liability that cannot be limited or excluded under applicable law. Your statutory rights as a consumer are not affected.`,
    businesses &&
      `${consumers ? "If you use the Service as a business, the following applies: " : ""}we are liable without limitation for intent and gross negligence, for injury to life, body or health, and under mandatory product liability law. For slight negligence, we are only liable for breaches of essential contractual obligations, limited to the damage that was foreseeable and typical at the time the contract was concluded${
        sellsOnline(p) ? ", and in any case to the fees you paid us in the 12 months before the event giving rise to the claim" : ""
      }. The Service is otherwise provided "as is".`,

    businesses && h2("Indemnity (business users)"),
    businesses &&
      `If you use the Service as a business, you will indemnify us against third-party claims arising from Your Content or your breach of these Terms, including reasonable legal costs, unless you are not responsible for the breach.`,

    h2("Changes to these Terms"),
    `We may update these Terms, for example to reflect changes to the Service or the law. We will notify you of material changes at least 30 days before they take effect${
      f.accounts ? " by email or in the Service" : " on this page"
    }. If you continue to use the Service after that date, the new Terms apply. If you do not agree, you may stop using the Service${f.accounts ? " and delete your account" : ""}.`,

    h2("Governing law and disputes"),
    `These Terms are governed by the laws of ${esc(country.name)}, excluding the UN Convention on Contracts for the International Sale of Goods.${
      consumers
        ? " If you are a consumer living in another EU country, you keep the protection of the mandatory provisions of the law of your country of residence, and you may bring proceedings in the courts of your country."
        : ""
    }${businesses ? ` For business users, the courts at our registered office have exclusive jurisdiction, to the extent permitted by law.` : ""}`,

    h2("Contact"),
    `Questions about these Terms? Contact us at ${mail(p.email)}.`,
  ]);
}
