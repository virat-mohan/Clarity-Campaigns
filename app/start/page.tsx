import { Suspense } from "react";
import { StartQuizFlow } from "@/components/start/start-quiz-flow";
import { UrlPrefill } from "@/components/start/url-prefill";

export default function StartPage() {
  return (
    <>
      <Suspense fallback={null}>
        <UrlPrefill />
      </Suspense>
      <StartQuizFlow />
    </>
  );
}
