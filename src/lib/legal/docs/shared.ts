import type { DocContext } from "../context";
import { esc, mail } from "../md";
import { isIndividual } from "../schema";

/** Label for the person behind the business: an owner for individuals, a representative for companies. */
export function representativeLabel(ctx: DocContext): string {
  const fr = ctx.country.code === "FR";
  if (isIndividual(ctx.p)) return fr ? "Owner and publication director" : "Owner";
  return fr ? "Publication director / legal representative" : "Represented by";
}

/** Consumer ADR statement; France makes access to a consumer mediator mandatory. */
export function consumerDisputeText(ctx: DocContext): string {
  const { p } = ctx;
  if (p.adrEntity) {
    return p.country === "FR"
      ? `In accordance with Articles L.611-1 et seq. of the French Consumer Code, you may refer any dispute to our consumer mediator free of charge: ${esc(p.adrEntity)}.`
      : `We are willing to participate in dispute resolution proceedings before the following consumer arbitration body: ${esc(p.adrEntity)}.`;
  }
  if (p.country === "FR") {
    return `In accordance with Articles L.611-1 et seq. of the French Consumer Code, you may refer any dispute to a consumer mediator free of charge. Contact us at ${mail(p.email)} for our mediator's details.`;
  }
  return "We are not obliged and not willing to participate in dispute resolution proceedings before a consumer arbitration body.";
}
