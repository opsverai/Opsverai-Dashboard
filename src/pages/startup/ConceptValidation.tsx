import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const CHECKS = [
  { id: "interviews", label: "≥5 user interviews done" },
  { id: "prototype", label: "Clickable prototype tested" },
  { id: "metric", label: "Success metric defined" },
  { id: "competitor", label: "Competitive alternatives mapped" },
  { id: "pricing", label: "Willingness-to-pay signal" },
] as const;

type CheckId = (typeof CHECKS)[number]["id"];

export default function ConceptValidation() {
  const [problem, setProblem] = useLocalStorage("nexus-startup-val-problem", "");
  const [hypothesis, setHypothesis] = useLocalStorage("nexus-startup-val-hypothesis", "");
  const [metric, setMetric] = useLocalStorage("nexus-startup-val-metric", "");
  const [confidence, setConfidence] = useLocalStorage("nexus-startup-val-confidence", 60);
  const [evidence, setEvidence] = useLocalStorage("nexus-startup-val-evidence", 40);
  const [checks, setChecks] = useLocalStorage<Record<CheckId, boolean>>(
    "nexus-startup-val-checks",
    {
      interviews: false,
      prototype: false,
      metric: false,
      competitor: false,
      pricing: false,
    },
  );

  const score = useMemo(() => {
    const c = confidence / 100;
    const e = evidence / 100;
    const done = CHECKS.filter((x) => checks[x.id]).length;
    const checkPart = done / CHECKS.length;
    return Math.round((0.35 * c + 0.35 * e + 0.3 * checkPart) * 100);
  }, [confidence, evidence, checks]);

  const verdict = score >= 75 ? "Strong — consider building" : score >= 50 ? "Mixed — run more tests" : "Weak — revisit problem";

  const toggle = (id: CheckId) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reset = () => {
    setProblem("");
    setHypothesis("");
    setMetric("");
    setConfidence(60);
    setEvidence(40);
    setChecks({
      interviews: false,
      prototype: false,
      metric: false,
      competitor: false,
      pricing: false,
    });
    toast.message("Cleared validation draft");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>Hypothesis kit</CardTitle>
          <CardDescription>Fields persist locally. Use sliders + checklist to drive a composite score.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problem">Problem statement</Label>
            <Textarea
              id="problem"
              rows={2}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="resize-none bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hyp">Hypothesis (if… then…)</Label>
            <Textarea
              id="hyp"
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="resize-none bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="met">Metric to observe</Label>
            <Textarea
              id="met"
              rows={2}
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="resize-none bg-background/50"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <Label>Confidence in problem</Label>
              <span className="text-sm text-muted-foreground">{confidence}%</span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(v) => setConfidence(v[0])}
              max={100}
              step={5}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Evidence quality</Label>
              <span className="text-sm text-muted-foreground">{evidence}%</span>
            </div>
            <Slider value={[evidence]} onValueChange={(v) => setEvidence(v[0])} max={100} step={5} />
          </div>

          <div className="space-y-3">
            <Label>Evidence checklist</Label>
            {CHECKS.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <Checkbox id={c.id} checked={checks[c.id]} onCheckedChange={() => toggle(c.id)} />
                <label htmlFor={c.id} className="text-sm cursor-pointer leading-none">
                  {c.label}
                </label>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={reset}>
            Clear all
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>Validation score</CardTitle>
          <CardDescription>Weighted blend: confidence, evidence, checklist (prototype heuristic).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-border/40 bg-primary/10">
            <p className="text-5xl font-bold tabular-nums text-primary">{score}</p>
            <p className="text-sm text-muted-foreground mt-1">out of 100</p>
            <Badge className="mt-4" variant={score >= 75 ? "default" : score >= 50 ? "secondary" : "destructive"}>
              {verdict}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This is a lightweight rubric for demos—not investment advice. Tune weights in code when you wire real data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
