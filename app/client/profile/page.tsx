"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClientStore } from "@/lib/store/client-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { IND } from "@/lib/data/industry-benchmarks";
import { CheckCircle2 } from "lucide-react";

const INDUSTRIES = Object.entries(IND).map(([id, ind]) => ({ id, name: ind.name }));

export default function ClientProfilePage() {
  const router = useRouter();
  const profile = useClientStore((s) => s.profile);
  const upsertProfile = useClientStore((s) => s.upsertProfile);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    industry: "d2c",
    website: "",
    brandBookFileName: "",
    icpText: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName,
        contactName: profile.contactName,
        email: profile.email,
        industry: profile.industry,
        website: profile.website,
        brandBookFileName: profile.brandBookFileName,
        icpText: profile.icpText,
      });
    }
  }, [profile]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    upsertProfile(form);
    setSaved(true);
    setTimeout(() => router.push("/client"), 800);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Client Portal</div>
        <h1 className="font-heading text-2xl font-semibold">
          {profile ? "Edit Company Profile" : "Set Up Your Company Profile"}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Your profile helps us pre-fill campaign briefs and understand your business context.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-primary mb-4">Company details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Company name</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <Label>Contact name</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-primary mb-4">Brand intelligence</div>
            <p className="text-[12px] text-muted-foreground mb-4">
              Upload your brand book or sales playbook so we can align campaigns to your voice, positioning, and ICP.
              In this demo, enter the filename — no actual upload occurs.
            </p>
            <div className="mb-4">
              <Label>Brand book / sales playbook filename</Label>
              <Input
                value={form.brandBookFileName}
                onChange={(e) => set("brandBookFileName", e.target.value)}
                placeholder="acme-brand-book-2025.pdf"
              />
              <p className="mt-1 text-[11px] text-muted-foreground-2">
                Mock file reference — name the document you&apos;d share with us.
              </p>
            </div>
            <div>
              <Label>ICP description</Label>
              <Textarea
                value={form.icpText}
                onChange={(e) => set("icpText", e.target.value)}
                placeholder="Describe your ideal customer profile — industry, company size, role, pain points, geography…"
                rows={4}
              />
              <p className="mt-1 text-[11px] text-muted-foreground-2">
                This is pre-filled into campaign briefs when you start a new campaign.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!form.companyName || !form.contactName}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Saved
              </>
            ) : (
              "Save profile"
            )}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/client")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
