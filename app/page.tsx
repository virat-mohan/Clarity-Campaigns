import { redirect } from "next/navigation";

// campaign.clarityhq.ai's root is Screen 1 of the new 4-screen flow (see
// Campaign Flow Product Brief) — the old 9-step marketplace/builder lives on
// unchanged at /classic. Server-side redirect avoids a client-side flash.
export default function RootPage() {
  redirect("/start");
}
