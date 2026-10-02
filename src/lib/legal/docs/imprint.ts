import type { DocContext } from "../context";
import { doc, esc, escLines, h1, h2, mail, ul } from "../md";
import { consumerDisputeText } from "./shared";

export function legalNotice(ctx: DocContext): string {
  const { p, country } = ctx;
  const consumers = p.audience !== "b2b";

  return doc([
    h1(country.imprintTitle),
    country.imprintBasis ? `*Information pursuant to ${esc(country.imprintBasis)}*` : `*Information pursuant to Article 5 of the E-Commerce Directive (2000/31/EC)*`,

    h2("Website operator"),
    `${ctx.company}  \n${escLines(p.address)}  \n${esc(country.name)}`,
    ul([
      p.legalForm && `Legal form: ${esc(p.legalForm)}`,
      p.shareCapital && `Share capital: ${esc(p.shareCapital)}`,
      `${country.code === "FR" ? "Publication director / legal representative" : "Represented by"}: ${esc(p.representative)}`,
    ]),

    h2("Contact"),
    ul([`Email: ${mail(p.email)}`, p.phone && `Phone: ${esc(p.phone)}`]),

    (p.registrationNumber || p.vatId || !p.registered) && h2("Registration"),
    !p.registered &&
      "The business is currently being set up and is not yet entered in a commercial register. Registration details will be added here as soon as they are available.",
    p.registered &&
      ul([
        p.registerName && `Register: ${esc(p.registerName)}`,
        p.registrationNumber && `Registration number: ${esc(p.registrationNumber)}`,
      ]),
    p.vatId &&
      `VAT identification number${country.code === "DE" ? " pursuant to § 27a Umsatzsteuergesetz" : ""}: ${esc(p.vatId)}`,

    p.hostingProvider && h2("Hosting"),
    p.hostingProvider && `This website is hosted by: ${esc(p.hostingProvider)}`,

    consumers && h2("Consumer dispute resolution"),
    consumers &&
      consumerDisputeText(ctx),

    h2("Liability for content and links"),
    `We create the content of this website with care, but cannot guarantee that it is complete, accurate and up to date at all times. Our website contains links to external websites over whose content we have no control. The respective provider is always responsible for the content of linked pages. If we become aware of any legal infringement, we will remove such links immediately.`,

    h2("Copyright"),
    `The content and works on this website are subject to copyright. Reproduction, editing, distribution or any kind of use beyond what copyright law allows requires our prior written consent.`,
  ]);
}
