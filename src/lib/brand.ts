export const BRAND = {
  name: "Clausely",
  tagline: "Every legal page your EU business needs. One flat price.",
  supportEmail: "support@clausely.eu",
} as const;

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
