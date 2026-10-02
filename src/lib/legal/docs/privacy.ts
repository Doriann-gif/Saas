import { docLink, type DocContext } from "../context";
import { doc, esc, escLines, h1, h3, link, listJoin, mail, numbered, table, ul } from "../md";
import type { ThirdPartyService } from "../services";
import { representativeLabel } from "./shared";

type Activity = {
  title: string;
  data: string;
  purpose: string;
  basis: string;
  retention: string;
};

const BASIS = {
  consent: "your consent (Art. 6(1)(a) GDPR). You can withdraw it at any time with effect for the future.",
  contract: "the performance of a contract with you or steps taken at your request before entering into one (Art. 6(1)(b) GDPR).",
  legal: "compliance with our legal obligations (Art. 6(1)(c) GDPR).",
  interest: (why: string) => `our legitimate interests (Art. 6(1)(f) GDPR) in ${why}.`,
};

function servicesIn(ctx: DocContext, ...groups: ThirdPartyService["group"][]) {
  return ctx.services.filter((s) => groups.includes(s.group));
}

function names(services: ThirdPartyService[]): string {
  return services.map((s) => esc(s.name)).join(", ");
}

function activities(ctx: DocContext): Activity[] {
  const { p } = ctx;
  const f = p.features;
  const list: Activity[] = [];

  list.push({
    title: "Visiting our website",
    data: "IP address, date and time of access, pages visited, referring URL, browser type and version, operating system.",
    purpose: "Delivering the website to your device, keeping it secure and stable, and detecting abuse.",
    basis: BASIS.interest("operating a secure and functional website"),
    retention: "Server log files are deleted after at most 30 days unless they are needed to investigate a specific security incident.",
  });

  list.push({
    title: f.contactForm ? "Contacting us (email or contact form)" : "Contacting us by email",
    data: "Your name, email address, the content of your message and any other details you choose to give us.",
    purpose: "Answering your request.",
    basis: `${BASIS.contract} Where your request is unrelated to a contract, ${BASIS.interest("responding to enquiries")}`,
    retention: "We delete your message once your request has been fully handled, unless we must keep it for legal reasons.",
  });

  if (f.accounts) {
    list.push({
      title: "Your user account",
      data: "Email address, password (stored only as a secure hash), name, profile details you add, and login timestamps.",
      purpose: "Creating and managing your account and letting you log in securely.",
      basis: BASIS.contract,
      retention: "For as long as your account exists. When you delete your account, we delete or anonymise your data within 30 days, except where we must keep it by law.",
    });
  }

  if (f.payments || f.subscriptions || f.physicalGoods || f.digitalProducts) {
    const providers = servicesIn(ctx, "payments");
    list.push({
      title: f.subscriptions ? "Orders, subscriptions and payments" : "Orders and payments",
      data: `${listJoin([
        "Name",
        "billing address",
        "email address",
        ...(f.physicalGoods ? ["delivery address"] : []),
        ...(p.audience !== "b2c" ? ["company name", "VAT number"] : []),
        "order details",
        "invoices",
        "payment status",
      ])}.`,
      purpose: `Processing your order${f.subscriptions ? ", managing your subscription" : ""}${f.physicalGoods ? ", delivering your goods" : ""} and issuing invoices.${
        providers.length
          ? ` Card and payment details are entered directly with our payment provider${providers.length > 1 ? "s" : ""} (${names(providers)}); we never see or store your full card number.`
          : ""
      }`,
      basis: `${BASIS.contract} We keep invoices and accounting records to meet our obligations under tax and commercial law; for that the legal basis is ${BASIS.legal}`,
      retention: "Order data is kept for the duration of the contract. Invoices and accounting records are kept for the period required by tax and commercial law (generally 6 to 10 years, depending on the country).",
    });
  }

  if (f.newsletter) {
    const tools = servicesIn(ctx, "email");
    list.push({
      title: "Newsletter",
      data: "Email address, name (optional), the date and time you subscribed and confirmed, and whether you open emails or click links.",
      purpose: `Sending you our newsletter${tools.length ? ` using ${names(tools)}` : ""}. We use a double opt-in: you only receive emails after confirming your address.`,
      basis: `${BASIS.consent} You can unsubscribe using the link in every email.${
        ctx.p.audience !== "b2b"
          ? " Where you are an existing customer, we may send you information about similar products on the basis of our legitimate interest in direct marketing (Art. 6(1)(f) GDPR and Art. 13(2) of the ePrivacy Directive); you can object at any time."
          : ""
      }`,
      retention: "Until you unsubscribe. We keep proof of your consent for as long as we may need to demonstrate it.",
    });
  }

  if (f.userContent) {
    list.push({
      title: "Content you publish or upload",
      data: "Text, images, files and other content you submit, together with the time of submission and your account details.",
      purpose: "Providing the features of our service that let you create, store or share content.",
      basis: BASIS.contract,
      retention: "Until you delete the content or your account, unless we need to keep it to handle a complaint or comply with a legal obligation.",
    });
  }

  const analytics = servicesIn(ctx, "analytics");
  const consentAnalytics = analytics.filter((s) => s.consent !== "necessary");
  const cookieless = analytics.filter((s) => s.consent === "necessary");
  if (consentAnalytics.length) {
    list.push({
      title: "Analytics",
      data: "Pages viewed, clicks, time spent, device and browser information, approximate location (derived from a shortened IP address), and an online identifier stored in a cookie.",
      purpose: `Understanding how visitors use our website so we can improve it, using ${names(consentAnalytics)}.`,
      basis: `${BASIS.consent} We only load these tools after you have agreed to them in our cookie banner.`,
      retention: "As set out in our Cookie Policy for the individual cookies; aggregated reports are kept without reference to you.",
    });
  }
  if (cookieless.length) {
    list.push({
      title: "Cookieless statistics",
      data: "Pages viewed, referrer, device type, browser and country. No cookies are set and IP addresses are not stored.",
      purpose: `Measuring overall visitor numbers with ${names(cookieless)}.`,
      basis: BASIS.interest("understanding how our website is used without tracking individuals"),
      retention: "Only aggregated statistics are kept.",
    });
  }

  const ads = ctx.services.filter((s) => s.group === "advertising" || (s.group === "support" && s.consent === "marketing"));
  if (ads.length) {
    list.push({
      title: "Advertising and marketing",
      data: "Online identifiers, the pages you visit, actions you take on our website (such as purchases or sign-ups), device and browser information.",
      purpose: `Measuring the effectiveness of our advertising and showing relevant ads, using ${names(ads)}. These providers may combine this data with data they already hold about you and use it for their own purposes; for that processing they are responsible under their own privacy policies.`,
      basis: `${BASIS.consent} We only load these tools after you have agreed to them in our cookie banner.`,
      retention: "As set out in our Cookie Policy for the individual cookies.",
    });
  }

  const support = servicesIn(ctx, "support").filter((s) => s.consent !== "marketing");
  if (support.length) {
    list.push({
      title: "Live chat and support",
      data: "Your messages, name and email address if you provide them, and technical information about your device.",
      purpose: `Answering your questions via ${names(support)}.`,
      basis: `${BASIS.consent} The chat widget is only loaded after you have agreed to functional cookies.`,
      retention: "Conversations are deleted 12 months after they are closed.",
    });
  }

  const embeds = ctx.services.filter((s) => (s.group === "embeds" || s.group === "forms") && s.consent !== "necessary");
  if (embeds.length) {
    list.push({
      title: "Embedded content",
      data: "Your IP address, browser information and the page you are on are transmitted to the provider when the content loads.",
      purpose: `Displaying content from ${names(embeds)}.`,
      basis: `${BASIS.consent} The content is only loaded after you have agreed to functional cookies.`,
      retention: "Determined by the respective provider; see their privacy policy linked below.",
    });
  }

  const fonts = ctx.services.find((s) => s.id === "google-fonts");
  if (fonts) {
    list.push({
      title: "Web fonts",
      data: "Your IP address and browser information are transmitted to Google when fonts are loaded.",
      purpose: "Displaying our website with consistent typography.",
      basis: BASIS.interest("a consistent and appealing presentation of our website"),
      retention: "Determined by Google; see their privacy policy linked below.",
    });
  }

  const monitoring = servicesIn(ctx, "monitoring");
  if (monitoring.length) {
    list.push({
      title: "Error monitoring",
      data: "Technical error reports, which may include your IP address, browser information and the page where the error occurred.",
      purpose: `Detecting and fixing bugs using ${names(monitoring)}.`,
      basis: BASIS.interest("keeping our service stable and secure"),
      retention: "Error reports are deleted after 90 days.",
    });
  }

  return list;
}

export function privacyPolicy(ctx: DocContext): string {
  const { p, country } = ctx;
  const recipients = ctx.services;
  const transfers = recipients.filter((s) => s.transfersOutsideEea);
  const minAge = p.minimumAge ?? country.digitalConsentAge;
  const h2 = numbered();

  return doc([
    h1("Privacy Policy"),
    `*Last updated: ${ctx.updated}*`,
    `This Privacy Policy explains how ${ctx.company} ("we", "us") collects and uses your personal data when you use ${ctx.site} and our related services, and what rights you have under the EU General Data Protection Regulation (GDPR).`,

    h2("Who is responsible for your data"),
    `The controller responsible for processing your personal data is:`,
    `${ctx.company}  \n${escLines(p.address)}  \n${esc(country.name)}`,
    ul([`Email: ${mail(p.email)}`, p.phone && `Phone: ${esc(p.phone)}`, `${representativeLabel(ctx)}: ${esc(p.representative)}`]),
    p.dpoContact
      ? `You can reach our Data Protection Officer at: ${esc(p.dpoContact)}.`
      : `We are not required to appoint a Data Protection Officer. For any privacy question, contact us at ${mail(p.email)}.`,

    h2("What data we process and why"),
    ...activities(ctx).flatMap((a) => [
      h3(a.title),
      ul([`**Data:** ${a.data}`, `**Purpose:** ${a.purpose}`, `**Legal basis:** ${a.basis}`, `**Retention:** ${a.retention}`]),
    ]),
    h3("Cookies and similar technologies"),
    `We use cookies and similar technologies on our website. Cookies that are not strictly necessary are only used with your consent. Details are in our ${docLink(ctx, "cookies", "Cookie Policy")}.`,

    h2("Who we share your data with"),
    `We only share your personal data where this is necessary for the purposes described above. We use the following service providers, who process data on our behalf under a data processing agreement (Art. 28 GDPR) or, where stated in their own terms, as independent controllers:`,
    recipients.length
      ? table(
          ["Provider", "Purpose", "Location", "Privacy policy"],
          recipients.map((s) => [`${esc(s.name)} (${esc(s.provider)})`, esc(s.purpose), esc(s.country), link("Link", s.privacyUrl)]),
        )
      : "We currently do not use external service providers that receive personal data, apart from the hosting provider of our website.",
    `We may also share data with professional advisers (such as accountants and lawyers) who are bound by confidentiality, and with public authorities where we are legally required to do so. We do not sell your personal data.`,

    transfers.length > 0 && h2("Transfers outside the EU/EEA"),
    transfers.length > 0 &&
      `Some of our providers (${names(transfers)}) may process data outside the European Economic Area, in particular in the United States. Where this happens, we ensure an adequate level of protection, either through an adequacy decision of the European Commission (including the EU-U.S. Data Privacy Framework, where the recipient is certified under it) or through Standard Contractual Clauses adopted by the European Commission (Art. 46(2)(c) GDPR), together with additional safeguards where needed. You can request a copy of the relevant safeguards by contacting us.`,

    h2("Your rights"),
    `Under the GDPR you have the right to:`,
    ul([
      "**Access** the personal data we hold about you (Art. 15)",
      "**Rectify** inaccurate or incomplete data (Art. 16)",
      "**Erase** your data (Art. 17)",
      "**Restrict** processing (Art. 18)",
      "**Data portability**: receive your data in a structured, machine-readable format (Art. 20)",
      "**Object** to processing based on legitimate interests, and to direct marketing at any time (Art. 21)",
      "**Withdraw your consent** at any time, without affecting the lawfulness of processing before the withdrawal (Art. 7(3))",
    ]),
    `To exercise any of these rights, email us at ${mail(p.email)}. We will respond within one month. We may ask you to verify your identity.`,
    `You also have the right to lodge a complaint with a supervisory authority, in particular in the EU country where you live, work, or where you believe an infringement took place (Art. 77 GDPR). Our lead supervisory authority is ${link(
      country.authority.name,
      country.authority.url,
    )}.`,

    h2("Do you have to give us your data?"),
    `You are not obliged to provide personal data. However, some data is required to conclude or perform a contract (for example, an email address to create an account or a billing address to issue an invoice). Without it, we may not be able to provide the requested service.`,
    `We do not use automated decision-making, including profiling, that produces legal effects concerning you or similarly significantly affects you (Art. 22 GDPR).`,

    h2("Children"),
    `Our services are not directed at children under ${minAge}. We do not knowingly collect personal data from children under this age without the consent of a parent or guardian. If you believe a child has provided us with data, please contact us and we will delete it.`,

    h2("Security"),
    `We use appropriate technical and organisational measures to protect your data, including encrypted connections (TLS), access controls and regular backups. No method of transmission over the internet is completely secure, but we work to protect your data in line with the state of the art.`,

    h2("Changes to this policy"),
    `We may update this Privacy Policy when our services or the law change. The current version is always available on this page, with the date of the last update at the top. Where changes are significant, we will inform you directly (for example by email) where we can.`,

    h2("Contact"),
    `For any questions about this Privacy Policy or your personal data, contact us at ${mail(p.email)}${p.phone ? ` or ${esc(p.phone)}` : ""}.`,
  ]);
}
