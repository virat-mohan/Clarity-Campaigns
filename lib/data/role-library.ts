// Ported from ROLE_LIBRARY in the source HTML. Core pod — hourly, freelance,
// always auto-staffed per SKU from PROCS. Not user-toggled.
export interface Role {
  name: string;
  dept: "Marketing" | "Sales";
  level: string;
  rate: number; // USD/hr
}

export const ROLE_LIBRARY: Role[] = [
  { name: "Engagement Lead", dept: "Marketing", level: "Agency L1", rate: 55 },
  { name: "Marketing Strategy Lead", dept: "Marketing", level: "Agency L2", rate: 42 },
  { name: "Paid Media Manager", dept: "Marketing", level: "Agency L3", rate: 32 },
  { name: "Content + SEO Manager", dept: "Marketing", level: "Agency L3", rate: 30 },
  { name: "Social + CRM Manager", dept: "Marketing", level: "Agency L3", rate: 28 },
  { name: "Analytics Manager", dept: "Marketing", level: "Agency L3", rate: 32 },
  { name: "Paid Specialist (Search + Social)", dept: "Marketing", level: "Agency L4", rate: 18 },
  { name: "Writer + SEO Executive", dept: "Marketing", level: "Agency L4", rate: 16 },
  { name: "Social + Email Executive", dept: "Marketing", level: "Agency L4", rate: 15 },
  { name: "Reporting Executive", dept: "Marketing", level: "Agency L4", rate: 14 },
  { name: "Creative Pod – Designer", dept: "Marketing", level: "Agency Shared", rate: 22 },
  { name: "Creative Pod – Video Editor", dept: "Marketing", level: "Agency Shared", rate: 24 },
  { name: "Creative Pod – Copywriter", dept: "Marketing", level: "Agency Shared", rate: 20 },
  { name: "Outreach Engagement Lead", dept: "Sales", level: "Agency L1", rate: 50 },
  { name: "Account Book Researcher", dept: "Sales", level: "Agency L2", rate: 28 },
  { name: "Outreach Copywriter", dept: "Sales", level: "Agency L2", rate: 26 },
  { name: "AE Assist Specialist", dept: "Sales", level: "Agency L2", rate: 24 },
  { name: "Outreach Executor", dept: "Sales", level: "Agency L3", rate: 18 },
  { name: "Sales Analytics Executor", dept: "Sales", level: "Agency L3", rate: 22 },
];

export function findRole(name: string): Role | null {
  return ROLE_LIBRARY.find((r) => r.name === name) ?? null;
}

// Fallback rate used by the source tool's applyAutoStaffing() when a PROCS step's
// role string (e.g. "Creative Pod") doesn't exactly match a ROLE_LIBRARY entry.
export const UNMATCHED_ROLE_FALLBACK_RATE = 25;
