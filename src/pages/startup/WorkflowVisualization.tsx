import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/branding";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const chartConfig = {
  days: { label: "Days", color: BRAND.sage },
} satisfies ChartConfig;

type Step = { id: string; label: string; days: number };

export default function WorkflowVisualization() {
  const [steps, setSteps] = useLocalStorage<Step[]>("nexus-startup-workflow", [
    { id: "1", label: "Discovery", days: 5 },
    { id: "2", label: "Design sprint", days: 10 },
    { id: "3", label: "Build MVP", days: 21 },
    { id: "4", label: "Pilot", days: 14 },
  ]);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(7);
  const [focusId, setFocusId] = useState<string | null>(null);

  const totalDays = steps.reduce((s, x) => s + x.days, 0);

  const chartRows = useMemo(
    () => steps.map((s) => ({ id: s.id, name: s.label.slice(0, 14) || "—", days: s.days })),
    [steps],
  );

  const add = () => {
    const t = label.trim();
    if (!t) {
      toast.error("Name the step");
      return;
    }
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), label: t, days: Math.max(1, days) }]);
    setLabel("");
    toast.success("Step added");
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-1 border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>Stages</CardTitle>
          <CardDescription>Add, reorder, and set duration. Total: {totalDays} days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step-label">Step name</Label>
            <Input
              id="step-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Security review"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="step-days">Duration (days)</Label>
            <Input
              id="step-days"
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 1)}
              className="bg-background/50"
            />
          </div>
          <Button type="button" onClick={add} className="w-full">
            <Plus className="h-4 w-4" />
            Add step
          </Button>

          <ul className="space-y-2 pt-2">
            {steps.map((step, i) => (
              <li
                key={step.id}
                className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 p-2 transition-opacity"
                style={{ opacity: focusId === null || focusId === step.id ? 1 : 0.45 }}
                onMouseEnter={() => setFocusId(step.id)}
                onMouseLeave={() => setFocusId(null)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.days}d</p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setSteps((prev) => prev.filter((s) => s.id !== step.id));
                      toast.message("Step removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2 border-border/50 bg-card/40 overflow-hidden">
        <CardHeader>
          <CardTitle>Timeline preview</CardTitle>
          <CardDescription>Width ∝ duration. Hover blocks to read labels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 w-full rounded-xl overflow-hidden border border-border/40 bg-muted/20">
            {steps.map((step) => (
              <div
                key={step.id}
                title={`${step.label} (${step.days}d)`}
                className="flex items-end justify-center pb-2 px-1 text-[10px] sm:text-xs font-medium text-center text-primary-foreground bg-primary/80 hover:bg-primary border-r border-primary-foreground/20 last:border-r-0 transition-colors overflow-hidden"
                style={{ flex: step.days }}
              >
                <span className="line-clamp-3 break-words">{step.label}</span>
              </div>
            ))}
          </div>
          {steps.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">Add steps to see the bar chart.</p>
          )}

          {steps.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Interactive chart
              </p>
              <p className="text-xs text-muted-foreground">
                Hover a stage in the list or click a bar — highlights stay in sync.
              </p>
              <ChartContainer config={chartConfig} className="h-[220px] min-h-[220px]">
                <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/40" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip cursor={{ fill: "hsl(var(--muted) / 0.12)" }} content={<ChartTooltipContent />} />
                  <Bar dataKey="days" radius={[6, 6, 0, 0]} maxBarSize={36} cursor="pointer">
                    {chartRows.map((row) => (
                      <Cell
                        key={row.id}
                        fill={BRAND.sage}
                        fillOpacity={focusId === null || focusId === row.id ? 1 : 0.3}
                        stroke={focusId === row.id ? BRAND.cream : "transparent"}
                        strokeWidth={2}
                        onClick={() => setFocusId((id) => (id === row.id ? null : row.id))}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
