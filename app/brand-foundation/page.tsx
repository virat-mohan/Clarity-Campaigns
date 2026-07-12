"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ILLUSTRATIVE_ICP =
  "D2C founders and growth leads at $1-10M ARR e-commerce brands, India-first, active on Instagram and LinkedIn, price-sensitive but conversion-literate.";
const ILLUSTRATIVE_BRAND_BOOK =
  "Voice: direct, no-fluff, confident. Primary palette skews dark with a single warm accent. Typography pairs a geometric display face with a plain-spoken body face. Never uses stock-photo aesthetics.";

function FileUploadField({
  label,
  accept,
  hint,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label>{label}</Label>
      <div
        className={cn(
          "mt-1 flex items-center gap-3 rounded-[4px] border border-dashed px-3 py-3 cursor-pointer transition-colors",
          file
            ? "border-secondary/60 bg-secondary/5"
            : "border-border-strong hover:border-primary/50 bg-transparent"
        )}
        onClick={() => inputRef.current?.click()}
      >
        {file ? (
          <>
            <CheckCircle2 className="h-4 w-4 flex-none text-secondary" />
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-foreground">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · ready to process</div>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 flex-none text-muted-foreground" />
            <div>
              <div className="text-[12.5px] text-foreground">Click to upload</div>
              <div className="text-[11px] text-muted-foreground">{hint}</div>
            </div>
          </>
        )}
        {file && (
          <button
            type="button"
            className="ml-auto flex-none font-mono text-[10px] text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function BrandFoundationPage() {
  const router = useRouter();
  const setBrand = useCampaignStore((s) => s.setBrand);

  const [brandBookFile, setBrandBookFile] = useState<File | null>(null);
  const [icpFile, setIcpFile] = useState<File | null>(null);
  const [salesDataName, setSalesDataName] = useState("");
  const [socialHandles, setSocialHandles] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  function handleProcess() {
    setStatus("processing");
    setTimeout(() => {
      setBrand({
        brandBookName: brandBookFile?.name ?? "",
        salesDataName,
        socialHandles,
        websiteUrl,
        processed: true,
        icpSnippet: ILLUSTRATIVE_ICP,
        brandBookSnippet: ILLUSTRATIVE_BRAND_BOOK,
      });
      setStatus("done");
    }, 1400);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Step 1 of 4</div>
        <h1 className="font-heading text-2xl font-semibold">Brand Foundation</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Upload your brand assets. These pre-fill your campaign brief in the next step — nothing is
          sent anywhere in this demo.
        </p>
      </div>

      <Card className="bg-paper border-paper-border">
        <CardContent className="pt-5 text-paper-foreground">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileUploadField
              label="Brand Book"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              hint="PDF, Word, or PowerPoint"
              file={brandBookFile}
              onChange={setBrandBookFile}
            />
            <FileUploadField
              label="ICP / Target Audience Brief"
              accept=".pdf,.doc,.docx,.csv,.xlsx"
              hint="PDF, Word, Excel or CSV"
              file={icpFile}
              onChange={setIcpFile}
            />
            <div>
              <Label>Sales data (CSV file name or path)</Label>
              <Input
                placeholder="sales-export-2026.csv"
                value={salesDataName}
                onChange={(e) => setSalesDataName(e.target.value)}
              />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input
                placeholder="https://yourbrand.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>Social handles</Label>
              <Input
                placeholder="@yourbrand (Instagram, LinkedIn, X…)"
                value={socialHandles}
                onChange={(e) => setSocialHandles(e.target.value)}
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground-2 flex items-center gap-1">
            <FileText size={12} />
            Files are selected locally — no upload or storage occurs in this demo.
          </p>
          <Button className="mt-4" onClick={handleProcess} disabled={status === "processing"}>
            {status === "processing" ? "Processing…" : "Process brand inputs"}
          </Button>
        </CardContent>
      </Card>

      {status === "processing" && (
        <Card className="mt-4">
          <CardContent className="pt-5 text-[13px] text-muted-foreground">
            Analyzing brand inputs…
          </CardContent>
        </Card>
      )}

      {status === "done" && (
        <Card className="mt-4 border-secondary/30">
          <CardContent className="pt-5">
            <CardTitle className="text-secondary">Brand Intelligence Summary — illustrative</CardTitle>
            <p className="mb-3 text-[11px] text-muted-foreground-2">
              This is a hardcoded placeholder output for demo purposes, not a real analysis of your
              inputs.
            </p>
            <div className="mb-3">
              <div className="font-mono-label text-[9.5px] text-primary mb-1">ICP snippet</div>
              <p className="text-[13px] text-foreground">{ILLUSTRATIVE_ICP}</p>
            </div>
            <div>
              <div className="font-mono-label text-[9.5px] text-primary mb-1">Brand book snippet</div>
              <p className="text-[13px] text-foreground">{ILLUSTRATIVE_BRAND_BOOK}</p>
            </div>
            {/* Brand-foundation feeds useCampaignStore's prefill (see campaign-store.ts createCampaign) —
                this is part of the old cost-plus flow's onboarding, so it continues into /classic. */}
            <Button className="mt-5" variant="secondary" onClick={() => router.push("/classic")}>
              Continue to campaign selection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
