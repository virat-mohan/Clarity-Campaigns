// Ported from UNIT_COSTS in the source HTML. Used only for ABM tech-cost modelling
// (computeTechCost / COGS_BASE), per source note: tech cost is modelled for ABM only.
export interface UnitCost {
  label: string;
  val: number;
  note: string;
}

export const UNIT_COSTS: Record<string, UnitCost> = {
  aiark: { label: "AI Ark - dollars per credit", val: 0.0098, note: "49 dollars per 5000 credits (Base). Email credit only on valid find; mobile=5cr." },
  freckle: { label: "Freckle - dollars per credit", val: 0.0358, note: "189 dollars per 5000 credits (Build tier). Most enrichments=1cr, phone=5cr." },
  domain: { label: "Domain - dollars per year", val: 13.0, note: "10 to 15 dollars typical (.com via Cloudflare/Porkbun)." },
  inboxkit: { label: "Inboxkit - 10-mailbox bundle", val: 39.0, note: "Professional plan. Extra mailboxes plus 3.50 dollars each." },
  smartlead: { label: "Smartlead - per 6k-send plan", val: 32.0, note: "Base, annual billing (39 dollars monthly). 2000 active leads." },
  linkup: { label: "Linkup - per 500-credit plan", val: 29.0, note: "Basic. 1 action equals 1 credit. About 20 invites per day per account cap." },
  whatsapp: { label: "WhatsApp - dollars per message", val: 0.01, note: "1 dollar per 100 messages. Meta bills per 24h conversation." },
  claude: { label: "Claude API (NBA) - flat per month", val: 15.0, note: "MOFU next-best-action engine. Haiku/Sonnet 4.x." },
};
