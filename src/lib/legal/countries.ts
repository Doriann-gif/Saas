export type Country = {
  code: string;
  name: string;
  /** Lead GDPR supervisory authority for a business established in this country. */
  authority: { name: string; url: string };
  /** Age of digital consent under GDPR Art. 8 as set by national law. */
  digitalConsentAge: number;
  /** Title used for the legal notice / imprint page. */
  imprintTitle: string;
  /** Statute the legal notice is based on, if the country has a specific one. */
  imprintBasis?: string;
};

export const COUNTRIES: Country[] = [
  { code: "AT", name: "Austria", authority: { name: "Österreichische Datenschutzbehörde", url: "https://www.dsb.gv.at" }, digitalConsentAge: 14, imprintTitle: "Imprint (Impressum)", imprintBasis: "§ 5 E-Commerce-Gesetz (ECG) and § 25 Mediengesetz" },
  { code: "BE", name: "Belgium", authority: { name: "Data Protection Authority (APD/GBA)", url: "https://www.dataprotectionauthority.be" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "BG", name: "Bulgaria", authority: { name: "Commission for Personal Data Protection", url: "https://www.cpdp.bg" }, digitalConsentAge: 14, imprintTitle: "Legal Notice" },
  { code: "HR", name: "Croatia", authority: { name: "Personal Data Protection Agency (AZOP)", url: "https://azop.hr" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "CY", name: "Cyprus", authority: { name: "Commissioner for Personal Data Protection", url: "https://www.dataprotection.gov.cy" }, digitalConsentAge: 14, imprintTitle: "Legal Notice" },
  { code: "CZ", name: "Czech Republic", authority: { name: "Office for Personal Data Protection (ÚOOÚ)", url: "https://uoou.gov.cz" }, digitalConsentAge: 15, imprintTitle: "Legal Notice" },
  { code: "DK", name: "Denmark", authority: { name: "Datatilsynet", url: "https://www.datatilsynet.dk" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "EE", name: "Estonia", authority: { name: "Estonian Data Protection Inspectorate (AKI)", url: "https://www.aki.ee" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "FI", name: "Finland", authority: { name: "Office of the Data Protection Ombudsman", url: "https://tietosuoja.fi" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "FR", name: "France", authority: { name: "Commission Nationale de l'Informatique et des Libertés (CNIL)", url: "https://www.cnil.fr" }, digitalConsentAge: 15, imprintTitle: "Legal Notice (Mentions légales)", imprintBasis: "Article 6-III of Law No. 2004-575 of 21 June 2004 (LCEN)" },
  { code: "DE", name: "Germany", authority: { name: "the data protection authority of the federal state (Land) in which we are established", url: "https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html" }, digitalConsentAge: 16, imprintTitle: "Imprint (Impressum)", imprintBasis: "§ 5 Digitale-Dienste-Gesetz (DDG)" },
  { code: "GR", name: "Greece", authority: { name: "Hellenic Data Protection Authority", url: "https://www.dpa.gr" }, digitalConsentAge: 15, imprintTitle: "Legal Notice" },
  { code: "HU", name: "Hungary", authority: { name: "National Authority for Data Protection and Freedom of Information (NAIH)", url: "https://www.naih.hu" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "IE", name: "Ireland", authority: { name: "Data Protection Commission", url: "https://www.dataprotection.ie" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "IT", name: "Italy", authority: { name: "Garante per la protezione dei dati personali", url: "https://www.garanteprivacy.it" }, digitalConsentAge: 14, imprintTitle: "Legal Notice" },
  { code: "LV", name: "Latvia", authority: { name: "Data State Inspectorate", url: "https://www.dvi.gov.lv" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "LT", name: "Lithuania", authority: { name: "State Data Protection Inspectorate", url: "https://vdai.lrv.lt" }, digitalConsentAge: 14, imprintTitle: "Legal Notice" },
  { code: "LU", name: "Luxembourg", authority: { name: "Commission Nationale pour la Protection des Données (CNPD)", url: "https://cnpd.public.lu" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "MT", name: "Malta", authority: { name: "Information and Data Protection Commissioner", url: "https://idpc.org.mt" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "NL", name: "Netherlands", authority: { name: "Autoriteit Persoonsgegevens", url: "https://www.autoriteitpersoonsgegevens.nl" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "PL", name: "Poland", authority: { name: "President of the Personal Data Protection Office (UODO)", url: "https://uodo.gov.pl" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "PT", name: "Portugal", authority: { name: "Comissão Nacional de Proteção de Dados (CNPD)", url: "https://www.cnpd.pt" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
  { code: "RO", name: "Romania", authority: { name: "National Supervisory Authority for Personal Data Processing (ANSPDCP)", url: "https://www.dataprotection.ro" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "SK", name: "Slovakia", authority: { name: "Office for Personal Data Protection of the Slovak Republic", url: "https://dataprotection.gov.sk" }, digitalConsentAge: 16, imprintTitle: "Legal Notice" },
  { code: "SI", name: "Slovenia", authority: { name: "Information Commissioner", url: "https://www.ip-rs.si" }, digitalConsentAge: 15, imprintTitle: "Legal Notice" },
  { code: "ES", name: "Spain", authority: { name: "Agencia Española de Protección de Datos (AEPD)", url: "https://www.aepd.es" }, digitalConsentAge: 14, imprintTitle: "Legal Notice (Aviso legal)", imprintBasis: "Article 10 of Law 34/2002 (LSSI-CE)" },
  { code: "SE", name: "Sweden", authority: { name: "Integritetsskyddsmyndigheten (IMY)", url: "https://www.imy.se" }, digitalConsentAge: 13, imprintTitle: "Legal Notice" },
];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [string, ...string[]];

/** Most common company types per country, shown as choices in the wizard. */
const LEGAL_FORMS: Record<string, string[]> = {
  AT: ["GmbH", "FlexCo", "OG", "KG", "AG"],
  BE: ["SRL / BV", "SA / NV", "SC / CV", "SNC / VOF"],
  CZ: ["s.r.o.", "a.s."],
  DE: ["GmbH", "UG (haftungsbeschränkt)", "GbR", "OHG", "KG", "AG"],
  DK: ["ApS", "A/S", "I/S"],
  ES: ["S.L.", "S.L.U.", "S.A."],
  FI: ["Oy", "Oyj", "Ky", "Ay"],
  FR: ["SAS", "SASU", "SARL", "EURL", "SA", "SNC"],
  IE: ["Ltd", "DAC", "PLC"],
  IT: ["S.r.l.", "S.r.l.s.", "S.p.A.", "S.n.c.", "S.a.s."],
  LU: ["SARL", "SARL-S", "SA", "SAS"],
  NL: ["B.V.", "N.V.", "V.O.F."],
  PL: ["sp. z o.o.", "S.A.", "sp.j.", "sp.k."],
  PT: ["Lda.", "Unipessoal Lda.", "S.A."],
  SE: ["AB", "HB", "KB"],
};

export function legalFormsFor(code: string): string[] {
  return LEGAL_FORMS[code] ?? ["Ltd", "LLC", "PLC"];
}

export function getCountry(code: string): Country {
  const c = COUNTRIES.find((x) => x.code === code);
  if (!c) throw new Error(`Unknown country: ${code}`);
  return c;
}
