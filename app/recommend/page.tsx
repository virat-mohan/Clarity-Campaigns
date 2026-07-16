import { redirect } from "next/navigation";

/** Quiz lives on /start — keep /recommend as an alias. */
export default function RecommendPage() {
  redirect("/start");
}
