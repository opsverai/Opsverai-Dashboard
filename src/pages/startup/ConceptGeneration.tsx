import { useState } from "react";
import { Copy, Rocket, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Concept = {
  id: string;
  title: string;
  pitch: string;
  differentiator: string;
  segment: string;
  savedAt?: string;
};

const ADJECTIVES = ["Adaptive", "Trusted", "Lightweight", "Composable", "Real-time", "Privacy-first"];
const NOUNS = ["workspace", "copilot", "hub", "fabric", "layer", "mesh"];
const VALUE = [
  "cuts manual work by automating handoffs",
  "gives teams a single source of truth",
  "turns fragmented data into decisions",
  "helps operators spot issues before customers do",
];

function pick<T>(arr: T[], seed: number, i: number): T {
  return arr[(seed + i * 17) % arr.length];
}

function generateConcepts(seedText: string, vertical: string, count: number): Concept[] {
  let h = 0;
  for (let i = 0; i < seedText.length; i++) h = (h * 31 + seedText.charCodeAt(i)) >>> 0;
  const base = h || 1;
  return Array.from({ length: count }, (_, i) => {
    const adj = pick(ADJECTIVES, base, i);
    const noun = pick(NOUNS, base, i + 3);
    const v = pick(VALUE, base, i + 5);
    return {
      id: crypto.randomUUID(),
      title: `${adj} ${noun} for ${vertical}`,
      pitch: `A ${vertical} product that ${v}. Anchored in: “${seedText.slice(0, 120)}${seedText.length > 120 ? "…" : ""}”.`,
      differentiator: `Focuses on ${vertical} workflows first, then expands—unlike generic tools that force heavy customization.`,
      segment: vertical,
    };
  });
}

export default function ConceptGeneration() {
  const [seed, setSeed] = useState("");
  const [vertical, setVertical] = useState("SaaS teams");
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [saved, setSaved] = useLocalStorage<Concept[]>("nexus-startup-saved-concepts", []);

  const run = () => {
    const s = seed.trim();
    if (!s) {
      toast.error("Add a seed idea or problem statement");
      return;
    }
    setConcepts(generateConcepts(s, vertical, 4));
    toast.success("Generated concept variants");
  };

  const copy = (c: Concept) => {
    const text = `${c.title}\n\n${c.pitch}\n\nDifferentiator: ${c.differentiator}`;
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleSave = (c: Concept) => {
    const exists = saved.some((x) => x.id === c.id);
    if (exists) {
      setSaved((prev) => prev.filter((x) => x.id !== c.id));
      toast.message("Removed from saved");
    } else {
      setSaved((prev) => [{ ...c, savedAt: new Date().toISOString() }, ...prev]);
      toast.success("Saved");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>Generator</CardTitle>
          <CardDescription>Prototype mixer: combines your seed with vertical context—swap inputs and regenerate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="seed">Seed (problem, user, or idea)</Label>
              <Textarea
                id="seed"
                rows={3}
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g. Ops teams lose track of vendor renewals across spreadsheets…"
                className="resize-none bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Vertical / audience</Label>
              <Select value={vertical} onValueChange={setVertical}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SaaS teams">SaaS teams</SelectItem>
                  <SelectItem value="Healthcare clinics">Healthcare clinics</SelectItem>
                  <SelectItem value="Manufacturing plants">Manufacturing plants</SelectItem>
                  <SelectItem value="Retail stores">Retail stores</SelectItem>
                  <SelectItem value="Developers">Developers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count-hint">Variants</Label>
              <Input id="count-hint" readOnly value="4 per run" className="bg-muted/30" />
            </div>
          </div>
          <Button type="button" onClick={run}>
            <Rocket className="h-4 w-4" />
            Generate concepts
          </Button>
        </CardContent>
      </Card>

      {concepts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {concepts.map((c) => (
            <Card key={c.id} className="border-border/50 bg-card/40 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-snug">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground flex-1">{c.pitch}</p>
                <p className="text-sm">
                  <span className="text-primary font-medium">Differentiator: </span>
                  {c.differentiator}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => copy(c)}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleSave(c)}>
                    <Star className={`h-4 w-4 ${saved.some((x) => x.id === c.id) ? "fill-primary text-primary" : ""}`} />
                    {saved.some((x) => x.id === c.id) ? "Saved" : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {saved.length > 0 && (
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle>Saved concepts ({saved.length})</CardTitle>
            <CardDescription>Persisted locally for this browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {saved.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/30 p-3"
              >
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.savedAt ? new Date(c.savedAt).toLocaleString() : ""}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => toggleSave(c)}>
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
