import { z } from "zod";
import { COUNTRY_CODES } from "./countries";
import { SERVICES } from "./services";

const text = (max: number) => z.string().trim().max(max).default("");
const SERVICE_IDS = SERVICES.map((s) => s.id) as [string, ...string[]];

export const profileSchema = z.object({
  // Business identity
  businessName: z.string().trim().min(1, "Required").max(120),
  legalForm: text(60),
  registered: z.boolean().default(true),
  registerName: text(120),
  registrationNumber: text(80),
  vatId: text(40),
  shareCapital: text(40),
  representative: z.string().trim().min(1, "Required").max(120),
  address: z.string().trim().min(1, "Required").max(300),
  country: z.enum(COUNTRY_CODES),
  email: z.email("Enter a valid email").max(200),
  phone: text(40),
  dpoContact: text(200),

  // Website
  websiteUrl: z.url({ protocol: /^https?$/, error: "Enter a full URL, e.g. https://example.com" }).max(200),
  hostingProvider: text(200),

  // Business model
  audience: z.enum(["b2c", "b2b", "both"]),
  microEnterprise: z.boolean().default(true),
  features: z.object({
    accounts: z.boolean().default(false),
    contactForm: z.boolean().default(true),
    newsletter: z.boolean().default(false),
    payments: z.boolean().default(false),
    subscriptions: z.boolean().default(false),
    physicalGoods: z.boolean().default(false),
    digitalProducts: z.boolean().default(false),
    userContent: z.boolean().default(false),
  }),
  services: z.array(z.enum(SERVICE_IDS)).max(SERVICES.length).default([]),

  // Optional overrides
  minimumAge: z.number().int().min(13).max(21).optional(),
  withdrawalUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/ })]).default(""),
  adrEntity: text(200),
});

export type Profile = z.output<typeof profileSchema>;
export type ProfileInput = z.input<typeof profileSchema>;

export const EMPTY_PROFILE: ProfileInput = {
  businessName: "",
  legalForm: "",
  registered: true,
  registerName: "",
  registrationNumber: "",
  vatId: "",
  shareCapital: "",
  representative: "",
  address: "",
  country: "FR",
  email: "",
  phone: "",
  dpoContact: "",
  websiteUrl: "https://",
  hostingProvider: "",
  audience: "b2c",
  microEnterprise: true,
  features: {
    accounts: false,
    contactForm: true,
    newsletter: false,
    payments: false,
    subscriptions: false,
    physicalGoods: false,
    digitalProducts: false,
    userContent: false,
  },
  services: [],
  withdrawalUrl: "",
  adrEntity: "",
};

export function sellsToConsumers(p: Profile): boolean {
  return p.audience !== "b2b";
}

export function sellsOnline(p: Profile): boolean {
  const f = p.features;
  return f.payments || f.subscriptions || f.physicalGoods || f.digitalProducts;
}
