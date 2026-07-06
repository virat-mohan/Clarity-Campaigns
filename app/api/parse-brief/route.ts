import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const OBJECTIVES = [
  "Lead Generation",
  "Awareness",
  "Trust",
  "Sign Up",
  "Sale / Revenue",
  "Engagement",
  "Retention",
  "Referral / Advocacy",
];

const INDUSTRIES = [
  { id: "d2c", name: "D2C / E-commerce" },
  { id: "saas", name: "SaaS / B2B Tech" },
  { id: "fmcg", name: "FMCG / Consumer" },
  { id: "fnb", name: "F&B / Hospitality" },
  { id: "finance", name: "Finance / Fintech" },
  { id: "health", name: "Health / Wellness" },
  { id: "edu", name: "Education / EdTech" },
  { id: "realestate", name: "Real Estate" },
];

const CHANNELS = [
  "Meta Ads",
  "Instagram",
  "Google Ads",
  "YouTube",
  "LinkedIn",
  "X / Twitter",
  "Email",
  "WhatsApp",
  "SEO / AEO",
];

const ASSET_TYPES = [
  "Blog Post",
  "Carousel",
  "Reel",
  "Video",
  "Research Article",
  "Case Study",
  "Static Ad",
  "X Post",
  "Slide",
];

const SYSTEM_PROMPT = `You are a campaign planning assistant. Extract structured campaign data from a free-text brief and return ONLY valid JSON — no prose, no markdown, no code fences.

Return a JSON object with these fields (omit any field you cannot confidently determine from the brief):
- client: string — company or client name
- clientSpoc: string — key contact person's name
- name: string — campaign name or title
- objective: one of ${JSON.stringify(OBJECTIVES)}
- goal: string — campaign goal in the client's own words
- sell: string — product, service, or offering being promoted
- icp: string — target audience / ideal customer profile description
- audienceSize: number — estimated contact list or audience size
- industry: one of ${JSON.stringify(INDUSTRIES.map((i) => i.id))} — best match (${INDUSTRIES.map((i) => `${i.id}=${i.name}`).join(", ")})
- channels: array — subset of ${JSON.stringify(CHANNELS)} that the brief mentions
- assets: array of { type: string, qty: number, note?: string } where type is one of ${JSON.stringify(ASSET_TYPES)}
- adSpend: number — monthly or total ad budget in USD/INR as a number (no currency symbols)
- asp: number — average deal value or sale price
- owner: string — account manager or campaign owner name
- notes: string — any other relevant details, special requests, or context
- risks: string — any risks, constraints, or concerns mentioned

Rules:
- Return ONLY the JSON object. No explanation, no markdown.
- Only include fields you can actually determine from the text.
- For channels and assets, only include what is explicitly mentioned or strongly implied.
- audienceSize should be a plain integer.
- adSpend and asp should be plain numbers.`;

export async function POST(req: NextRequest) {
  try {
    const { briefText, sku, apiKey } = await req.json();

    if (!briefText || typeof briefText !== "string" || briefText.trim().length < 10) {
      return NextResponse.json({ error: "Brief text is too short." }, { status: 400 });
    }

    const resolvedKey = (typeof apiKey === "string" && apiKey.trim())
      ? apiKey.trim()
      : process.env.ANTHROPIC_API_KEY ?? "";

    if (!resolvedKey) {
      return NextResponse.json(
        { error: "No Anthropic API key configured. Add it in Admin → Settings." },
        { status: 401 }
      );
    }

    const client = new Anthropic({ apiKey: resolvedKey });

    const userMessage = sku
      ? `Campaign type: ${sku}\n\nBrief:\n${briefText}`
      : `Brief:\n${briefText}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: "Model returned unparseable output." }, { status: 502 });
      }
    }

    return NextResponse.json({ result: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
