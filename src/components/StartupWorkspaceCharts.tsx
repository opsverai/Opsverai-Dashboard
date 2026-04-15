import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import type { StartupSnapshot } from "@/lib/startupSnapshot";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartTooltipProps = {
  className:
    "rounded-md border-border/50 bg-popover px-2.5 py-1.5 text-xs shadow-sm [&_span.font-mono]:font-sans [&_span.font-mono]:tabular-nums",
};

const pipelineConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const radarConfig = {
  value: { label: "Coverage", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const bmcConfig = {
  fill: { label: "Completion", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const validationConfig = {
  value: { label: "Score", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const workflowConfig = {
  days: { label: "Days", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

type Props = { snap: StartupSnapshot };

export default function StartupWorkspaceCharts({ snap }: Props) {
  const [pipeFocus, setPipeFocus] = useState<string | null>(null);
  const [bmcFocus, setBmcFocus] = useState<string | null>(null);
  const [radarPulse, setRadarPulse] = useState(false);

  const pipelineData = useMemo(
    () => [
      { stage: "Backlog", count: snap.pipeline.backlog, key: "backlog" as const },
      { stage: "Research", count: snap.pipeline.research, key: "research" as const },
      { stage: "Building", count: snap.pipeline.building, key: "building" as const },
      { stage: "Validated", count: snap.pipeline.validated, key: "validated" as const },
    ],
    [snap.pipeline],
  );

  const bar = "hsl(var(--primary))";
  const barMuted = "hsl(var(--muted-foreground) / 0.22)";

  return (
    <div className="space-y-4 animate-fade-in [animation-delay:200ms]">
      <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-[0_8px_32px_-14px_hsl(var(--primary)/0.15)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Overview</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Hover for values · click bars to focus</p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:shrink-0">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPipeFocus(null)}>
            Reset pipeline
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setBmcFocus(null)}>
            Reset canvas
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => setRadarPulse((p) => !p)}>
            Radar emphasis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="visual-lab-card space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Innovation pipeline</p>
            <Button variant="link" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground" asChild>
              <Link to="/startup/innovation">Open</Link>
            </Button>
          </div>
          <ChartContainer config={pipelineConfig} className="h-[168px] min-h-[168px]">
            <BarChart data={pipelineData} layout="vertical" margin={{ left: 2, right: 4, top: 2, bottom: 2 }}>
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                type="category"
                dataKey="stage"
                width={72}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted) / 0.08)" }}
                content={<ChartTooltipContent {...chartTooltipProps} />}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={20} cursor="pointer">
                {pipelineData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={bar}
                    fillOpacity={pipeFocus === null || pipeFocus === entry.key ? 0.92 : 0.22}
                    stroke="transparent"
                    className="outline-none transition-opacity duration-200 cursor-pointer"
                    onClick={() => setPipeFocus(entry.key)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="visual-lab-card space-y-3 p-4 md:p-5">
          <p className="text-sm font-medium text-foreground">Workspace coverage</p>
          <ChartContainer config={radarConfig} className="mx-auto h-[200px] min-h-[200px] max-w-[260px]">
            <RadarChart
              data={snap.workspaceRadar}
              margin={{ top: 6, right: 12, bottom: 6, left: 12 }}
              onClick={() => setRadarPulse((p) => !p)}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent {...chartTooltipProps} />} />
              <PolarGrid className="stroke-border/25" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Coverage"
                dataKey="value"
                stroke={bar}
                fill={bar}
                fillOpacity={radarPulse ? 0.18 : 0.1}
                strokeWidth={radarPulse ? 1.5 : 1}
                dot={{ r: 2, fill: "hsl(var(--background))", stroke: bar, strokeWidth: 1 }}
                activeDot={{ r: 3, fill: bar, stroke: "hsl(var(--background))", strokeWidth: 1 }}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        <div className="visual-lab-card space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Business model canvas</p>
            <Button variant="link" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground" asChild>
              <Link to="/startup/planning">Edit</Link>
            </Button>
          </div>
          <ChartContainer config={bmcConfig} className="h-[192px] min-h-[192px]">
            <BarChart data={snap.bmcBlocks} margin={{ left: 4, right: 4, top: 2, bottom: 38 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
                angle={-35}
                textAnchor="end"
                height={42}
              />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={26} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted) / 0.06)" }}
                content={<ChartTooltipContent {...chartTooltipProps} />}
              />
              <Bar dataKey="fill" radius={[3, 3, 0, 0]} maxBarSize={26} cursor="pointer">
                {snap.bmcBlocks.map((b) => (
                  <Cell
                    key={b.id}
                    fill={bar}
                    fillOpacity={bmcFocus === null || bmcFocus === b.id ? 0.88 : 0.2}
                    stroke="transparent"
                    onClick={() => setBmcFocus(b.id)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="visual-lab-card space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Validation drivers</p>
            <Button variant="link" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground" asChild>
              <Link to="/startup/validation">Adjust</Link>
            </Button>
          </div>
          <ChartContainer config={validationConfig} className="h-[152px] min-h-[152px]">
            <BarChart
              layout="vertical"
              data={snap.validationFactors}
              margin={{ left: 4, right: 4, top: 2, bottom: 2 }}
            >
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted) / 0.06)" }}
                content={<ChartTooltipContent {...chartTooltipProps} />}
              />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} fill={bar} fillOpacity={0.85} maxBarSize={17} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="visual-lab-card space-y-3 p-4 md:p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Workflow durations</p>
            <Button variant="link" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground" asChild>
              <Link to="/startup/workflow">Edit</Link>
            </Button>
          </div>
          {snap.workflowSteps.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Add steps in Workflow & Visualization.</p>
          ) : (
            <ChartContainer config={workflowConfig} className="h-[180px] min-h-[180px]">
              <BarChart data={snap.workflowSteps} margin={{ left: 4, right: 4, top: 2, bottom: 34 }}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  angle={-18}
                  textAnchor="end"
                  height={42}
                />
                <YAxis tickLine={false} axisLine={false} width={26} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.06)" }}
                  content={<ChartTooltipContent {...chartTooltipProps} />}
                />
                <Bar dataKey="days" radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {snap.workflowSteps.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? bar : barMuted} fillOpacity={i % 2 === 0 ? 0.9 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}
