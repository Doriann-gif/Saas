import type { DocContext } from "../context";
import { doc, esc, h1, mail, numbered, ul } from "../md";

export function accessibilityStatement(ctx: DocContext): string {
  const { p, country } = ctx;
  const h2 = numbered();

  return doc([
    h1("Accessibility Statement"),
    `*Last updated: ${ctx.updated}*`,
    `${ctx.company} is committed to making ${ctx.site} and our services accessible to everyone, including people with disabilities, in line with the European Accessibility Act (Directive (EU) 2019/882) and its implementation in ${esc(country.name)}.`,

    h2("Standard we follow"),
    `We aim to meet the requirements of the harmonised European standard EN 301 549, which incorporates the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA.`,

    h2("How our service meets accessibility requirements"),
    ul([
      "Content can be navigated using a keyboard alone.",
      "Text alternatives are provided for meaningful images.",
      "Colour contrast meets WCAG AA requirements for text and interface elements.",
      "Pages use a clear heading structure and labelled form fields, so they work with screen readers.",
      "Text can be resized up to 200% without loss of content or function.",
      p.features.payments || p.features.subscriptions || p.features.physicalGoods || p.features.digitalProducts
        ? "The checkout process, including identification, payment and order confirmation, can be completed with assistive technologies."
        : null,
    ]),

    h2("Compliance status"),
    `This website is partially compliant with the standard above. We continuously test and improve it. Known limitations:`,
    ul([
      "Some older documents (for example PDFs) may not be fully accessible. Contact us and we will provide them in an accessible format.",
      "Some third-party content, such as embedded videos or maps, may not be fully accessible. We choose providers with accessibility in mind.",
    ]),

    h2("Feedback and contact"),
    `If you encounter an accessibility barrier, or need information in an accessible format, please contact us at ${mail(p.email)}${
      p.phone ? ` or ${esc(p.phone)}` : ""
    }. We aim to respond within 5 working days.`,

    h2("Enforcement"),
    `If you are not satisfied with our response, you can contact the authority responsible for market surveillance of accessibility requirements for products and services in ${esc(country.name)}.`,

    h2("Preparation of this statement"),
    `This statement was prepared on ${ctx.updated} based on a self-assessment and is reviewed at least once a year.`,
    p.microEnterprise
      ? `*Note: As a micro-enterprise (fewer than 10 employees and an annual turnover or balance sheet total not exceeding €2 million), we may be exempt from some obligations under the European Accessibility Act. We nevertheless aim to make our website accessible to everyone.*`
      : null,
  ]);
}
