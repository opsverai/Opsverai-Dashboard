import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type CanvasKey =
  | "partners"
  | "activities"
  | "resources"
  | "value"
  | "relationships"
  | "channels"
  | "segments"
  | "costs"
  | "revenue";

const BLOCKS: { key: CanvasKey; title: string; hint: string }[] = [
  { key: "partners", title: "Key partners", hint: "Who helps you deliver?" },
  { key: "activities", title: "Key activities", hint: "What must you do well?" },
  { key: "resources", title: "Key resources", hint: "Assets, data, team…" },
  { key: "value", title: "Value propositions", hint: "Pain removed, gains created" },
  { key: "relationships", title: "Customer relationships", hint: "Self-serve, success, community…" },
  { key: "channels", title: "Channels", hint: "How you reach customers" },
  { key: "segments", title: "Customer segments", hint: "Who pays / who uses" },
  { key: "costs", title: "Cost structure", hint: "Fixed vs variable" },
  { key: "revenue", title: "Revenue streams", hint: "Pricing logic, bundles" },
];

type CanvasState = Record<CanvasKey, string>;

const emptyCanvas = (): CanvasState =>
  BLOCKS.reduce((acc, b) => ({ ...acc, [b.key]: "" }), {} as CanvasState);

export default function BusinessModelPlanning() {
  const [canvas, setCanvas] = useLocalStorage<CanvasState>("nexus-startup-bmc", emptyCanvas());
  const merged = useMemo(() => ({ ...emptyCanvas(), ...canvas }), [canvas]);

  const completeness = useMemo(() => {
    const filled = BLOCKS.filter((b) => (merged[b.key] ?? "").trim().length >= 12).length;
    return Math.round((filled / BLOCKS.length) * 100);
  }, [merged]);

  const update = (key: CanvasKey, value: string) => {
    setCanvas((prev) => ({ ...emptyCanvas(), ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>Canvas completeness</CardTitle>
          <CardDescription>Each block counts when you write at least ~12 characters (prototype rule).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={completeness} className="h-2" />
          <p className="text-sm text-muted-foreground">{completeness}% filled</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BLOCKS.map((b) => (
          <Card key={b.key} className="border-border/50 bg-card/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{b.title}</CardTitle>
              <CardDescription>{b.hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor={b.key} className="sr-only">
                {b.title}
              </Label>
              <Textarea
                id={b.key}
                value={merged[b.key]}
                onChange={(e) => update(b.key, e.target.value)}
                rows={4}
                placeholder="Type here…"
                className="resize-none bg-background/50 text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
