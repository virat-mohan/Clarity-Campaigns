import type { ReadinessComponentId } from "@/lib/scoring/types";

export const READINESS_QUESTIONS: { id: ReadinessComponentId; label: string; helper: string }[] = [
  { id: "website", label: "Website", helper: "A live site customers can land on" },
  { id: "brand_guidelines", label: "Brand Guidelines", helper: "Logo, colors, voice — documented" },
  { id: "crm", label: "CRM", helper: "Somewhere leads and customers are tracked" },
  { id: "analytics", label: "Analytics", helper: "Traffic and conversion tracking in place" },
  { id: "tracking_pixel", label: "Tracking Pixel", helper: "Meta / Google pixel installed" },
  { id: "creative_assets", label: "Creative Assets", helper: "Photos, videos, or templates ready to use" },
  { id: "product_catalogue", label: "Product Catalogue", helper: "Products/services listed with pricing" },
  { id: "marketing_automation", label: "Marketing Automation", helper: "Email/WhatsApp flows already set up" },
];
