import { describe, expect, it } from "vitest";
import { applicableDocs, DOC_IDS, generateDoc, profileSchema, type ProfileInput } from "./index";
import { markdownToHtml } from "./render";

const base: ProfileInput = {
  businessName: "Acme",
  legalForm: "GmbH",
  representative: "Jane Doe",
  address: "Hauptstraße 1\n10115 Berlin",
  country: "DE",
  email: "hello@acme.example",
  websiteUrl: "https://acme.example",
  audience: "b2c",
  features: { contactForm: true },
  services: [],
};

const parse = (overrides: Partial<ProfileInput> = {}) => profileSchema.parse({ ...base, ...overrides });
const opts = { updatedAt: new Date("2026-10-02T00:00:00Z") };

describe("profileSchema", () => {
  it("rejects non-http website URLs", () => {
    expect(profileSchema.safeParse({ ...base, websiteUrl: "javascript:alert(1)" }).success).toBe(false);
  });

  it("rejects unknown services", () => {
    expect(profileSchema.safeParse({ ...base, services: ["evil"] }).success).toBe(false);
  });
});

describe("applicableDocs", () => {
  it("always includes privacy, cookies and legal notice", () => {
    const ids = applicableDocs(parse()).map((d) => d.id);
    expect(ids).toEqual(expect.arrayContaining(["privacy", "cookies", "imprint", "terms", "accessibility"]));
    expect(ids).not.toContain("sale");
  });

  it("adds terms of sale when selling online", () => {
    const docs = applicableDocs(parse({ features: { payments: true } }));
    expect(docs.find((d) => d.id === "sale")?.required).toBe(true);
  });

  it("requires an accessibility statement for non-micro B2C sellers only", () => {
    const micro = applicableDocs(parse({ features: { physicalGoods: true }, microEnterprise: true }));
    const big = applicableDocs(parse({ features: { physicalGoods: true }, microEnterprise: false }));
    expect(micro.find((d) => d.id === "accessibility")?.required).toBe(false);
    expect(big.find((d) => d.id === "accessibility")?.required).toBe(true);
  });
});

describe("generateDoc", () => {
  it("renders every document for a maximal profile", () => {
    const p = parse({
      audience: "both",
      features: { accounts: true, contactForm: true, newsletter: true, payments: true, subscriptions: true, physicalGoods: true, digitalProducts: true, userContent: true },
      services: ["ga4", "plausible", "meta-pixel", "stripe", "mailchimp", "intercom", "youtube", "google-fonts", "sentry", "vercel"],
      vatId: "DE123456789",
      registerName: "Amtsgericht Charlottenburg",
      registrationNumber: "HRB 12345",
      hostingProvider: "Vercel Inc., San Francisco",
    });
    for (const id of DOC_IDS) {
      const md = generateDoc(id, p, opts);
      expect(md.length, id).toBeGreaterThan(500);
      expect(md, id).not.toMatch(/undefined|\[object Object\]|NaN/);
      expect(markdownToHtml(md), id).toContain("<h1>");
    }
  });

  it("uses the national supervisory authority and imprint statute", () => {
    expect(generateDoc("privacy", parse({ country: "FR" }), opts)).toContain("CNIL");
    expect(generateDoc("imprint", parse(), opts)).toContain("§ 5 Digitale-Dienste-Gesetz");
    expect(generateDoc("cookies", parse(), opts)).toContain("§ 25 TDDDG");
  });

  it("only mentions international transfers when a provider transfers data", () => {
    expect(generateDoc("privacy", parse({ services: ["plausible"] }), opts)).not.toContain("Transfers outside the EU");
    expect(generateDoc("privacy", parse({ services: ["ga4"] }), opts)).toContain("Transfers outside the EU");
  });

  it("includes the withdrawal right and online withdrawal function for consumer sales", () => {
    const md = generateDoc("sale", parse({ features: { payments: true }, withdrawalUrl: "https://acme.example/withdraw" }), opts);
    expect(md).toContain("14 days");
    expect(md).toContain("Withdraw from contract here");
    expect(md).toContain("https://acme.example/withdraw");
    expect(md).toContain("Model withdrawal form");
  });

  it("omits consumer-only sections for B2B", () => {
    const md = generateDoc("sale", parse({ audience: "b2b", features: { payments: true } }), opts);
    expect(md).not.toContain("Right of withdrawal");
  });

  it("numbers sections without gaps", () => {
    const md = generateDoc("privacy", parse({ services: ["plausible"] }), opts);
    const nums = [...md.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });

  it("never lets user input inject HTML into hosted pages", () => {
    const p = parse({ businessName: '<img src=x onerror="alert(1)">', address: "<script>alert(1)</script>", representative: "[click](javascript:alert(1))" });
    for (const id of DOC_IDS) {
      const html = markdownToHtml(generateDoc(id, p, opts));
      expect(html, id).not.toMatch(/<img|<script|href="javascript/i);
    }
  });

  it("never shows a date before the template version", () => {
    expect(generateDoc("privacy", parse(), { updatedAt: new Date("2020-01-01") })).toContain("1 October 2026");
  });
});
