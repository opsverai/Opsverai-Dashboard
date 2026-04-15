import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle,
  Layers,
  Lightbulb,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StartupWorkspaceCharts from "@/components/StartupWorkspaceCharts";
import { cn } from "@/lib/utils";
import { readStartupSnapshot } from "@/lib/startupSnapshot";

/* Brand accent borders: #697565 #3C3D37 #ECDFCC */
const FEATURES = [
  {
    path: "/startup/ideas",
    title: "Idea Input & Structuring",
    blurb: "Capture notes, auto-split problem vs solution, tag ideas.",
    icon: Lightbulb,
    code: "01",
    bar: "border-l-[#697565]",
    grid: "xl:col-span-7",
  },
  {
    path: "/startup/concepts",
    title: "Concept Generation",
    blurb: "Turn seeds into concept variants; save favorites.",
    icon: Rocket,
    code: "02",
    bar: "border-l-[#3C3D37]",
    grid: "xl:col-span-5",
  },
  {
    path: "/startup/planning",
    title: "Business Model Planning",
    blurb: "Nine-block canvas with completeness tracking.",
    icon: Briefcase,
    code: "03",
    bar: "border-l-[#ECDFCC]",
    grid: "md:col-span-2 xl:col-span-4",
  },
  {
    path: "/startup/workflow",
    title: "Workflow & Visualization",
    blurb: "Stage list with durations and timeline preview.",
    icon: Workflow,
    code: "04",
    bar: "border-l-[#697565]/80",
    grid: "md:col-span-2 xl:col-span-4",
  },
  {
    path: "/startup/validation",
    title: "Concept Validation",
    blurb: "Hypothesis kit, evidence checklist, composite score.",
    icon: CheckCircle,
    code: "05",
    bar: "border-l-[#3C3D37]/90",
    grid: "md:col-span-2 xl:col-span-4",
  },
  {
    path: "/startup/innovation",
    title: "Innovation System",
    blurb: "Kanban pipeline from backlog to validated.",
    icon: Layers,
    code: "06",
    bar: "border-l-[#ECDFCC]/75",
    grid: "xl:col-span-12",
  },
] as const;

function MomentumRing({ value }: { value: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center md:h-32 md:w-32">
      <div className="absolute inset-0 rounded-full border border-primary/15 bg-primary/5" />
      <div className="absolute inset-2 rounded-full border border-dashed border-primary/20 opacity-60" />
      <svg className="relative h-full w-full -rotate-90 drop-shadow-[0_0_12px_hsl(var(--primary)/0.35)]" viewBox="0 0 100 100">
        <circle
          className="text-muted/25"
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />
        <circle
          className="text-primary transition-[stroke-dasharray] duration-700 ease-out"
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground md:text-[1.65rem]">{value}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">momentum</span>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const snap = useMemo(() => readStartupSnapshot(), []);

  const statPills = [
    { label: "Structured ideas", value: String(snap.ideaCount), hint: "capture" },
    { label: "Saved concepts", value: String(snap.savedConceptCount), hint: "explore" },
    { label: "Canvas filled", value: `${snap.bmcPercent}%`, hint: "canvas" },
    { label: "Validation score", value: String(snap.validationScore), hint: "proof" },
  ];

  const statForPath: Record<string, string> = {
    "/startup/ideas": `${snap.ideaCount} saved`,
    "/startup/concepts": `${snap.savedConceptCount} starred`,
    "/startup/planning": `${snap.bmcPercent}% complete`,
    "/startup/workflow": `${snap.workflowStepCount} steps · ${snap.workflowTotalDays}d`,
    "/startup/validation": `Score ${snap.validationScore}`,
    "/startup/innovation": `${snap.pipeline.backlog + snap.pipeline.research + snap.pipeline.building + snap.pipeline.validated} cards`,
  };

  const pipelineTotal =
    snap.pipeline.backlog +
    snap.pipeline.research +
    snap.pipeline.building +
    snap.pipeline.validated;

  const momentum = Math.min(
    100,
    Math.round(
      (snap.bmcPercent +
        Math.min(100, snap.ideaCount * 12) +
        Math.min(100, snap.savedConceptCount * 20) +
        snap.validationScore) /
        4,
    ),
  );

  return (
    <div className="relative -mx-1 space-y-8 pb-4">
      <div
        className="dashboard-mesh pointer-events-none absolute inset-0 -z-10 rounded-[2rem] opacity-90 [mask-image:linear-gradient(180deg,black,transparent_96%)]"
        aria-hidden
      />

      <section
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border border-primary/35 bg-card p-6 md:p-8 lg:p-10",
          "dashboard-hero-glow animate-fade-in [animation-delay:50ms]",
        )}
      >
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/90">workspace · local</span>
              <span className="hidden h-px w-8 bg-border sm:block" aria-hidden />
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Live sync
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
                Shape ideas into something{" "}
                <span className="bg-gradient-to-r from-primary via-[#E6501B] to-muted-foreground bg-clip-text text-transparent">
                  validation-ready
                </span>
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Six connected studios share one browser vault—metrics, charts, and cards update as you work. No server
                round-trip in this prototype.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statPills.map((s, i) => (
                <div
                  key={s.label}
                  className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border)/0.55)] bg-card px-3 py-3 shadow-inner transition-colors hover:border-primary/35 hover:bg-muted/30"
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                    {s.hint}
                  </span>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-foreground md:text-xl">{s.value}</p>
                  <p className="text-[11px] leading-tight text-muted-foreground">{s.label}</p>
                  <span
                    className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary/60 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-widest text-muted-foreground">Trajectory</span>
                <span className="font-mono tabular-nums text-primary">{momentum}%</span>
              </div>
              <Progress value={momentum} className="h-1.5 bg-muted/60" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 lg:border-l lg:border-border/30 lg:pl-10">
            <MomentumRing value={momentum} />
            <p className="max-w-[14rem] text-center font-mono text-[10px] leading-relaxed text-muted-foreground">
              Composite of canvas, ideas, concepts & validation—your studio pulse at a glance.
            </p>
          </div>
        </div>
      </section>

      <StartupWorkspaceCharts snap={snap} />

      <section className="space-y-4 animate-fade-in [animation-delay:280ms]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">studios</p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Six workspaces</h3>
          </div>
          <p className="text-xs text-muted-foreground">Bento layout · gradient orbit · numbered flow</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const isRunway = f.code === "06";
            return (
              <Link
                key={f.path}
                to={f.path}
                className={cn("feature-orbit group animate-fade-in", f.grid)}
                style={{ animationDelay: `${120 + i * 45}ms` }}
              >
                <div
                  className={cn(
                    "relative flex h-full min-h-[8.5rem] flex-col justify-between p-5 pl-6 md:min-h-[9rem]",
                    "border-l-2 bg-gradient-to-br from-background/20 to-transparent",
                    isRunway && "md:flex-row md:items-center md:justify-between md:gap-10 md:py-6",
                    f.bar,
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/45 bg-card shadow-inner">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{f.code}</span>
                        <h3 className="font-semibold leading-snug text-foreground">{f.title}</h3>
                        <p className="mt-0.5 font-mono text-[11px] text-primary/90">{statForPath[f.path]}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-sm leading-relaxed text-muted-foreground",
                      isRunway && "md:mt-0 md:max-w-md md:flex-1",
                    )}
                  >
                    {f.blurb}
                  </p>
                  <span
                    className={cn(
                      "mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary/80 group-hover:text-primary",
                      isRunway && "md:mt-0 md:shrink-0",
                    )}
                  >
                    Enter
                    <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in [animation-delay:380ms]">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-[0_16px_48px_-20px_hsl(var(--primary)/0.2)]">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#697565] to-transparent opacity-90" />
          <div className="pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">stream</p>
            <h3 className="text-base font-semibold text-foreground">Recent structured ideas</h3>
            {snap.recentIdeas.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No ideas yet — open studio 01.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {snap.recentIdeas.map((idea) => (
                  <li
                    key={idea.id}
                    className="border-l border-border/50 bg-muted/20 py-2 pl-3 text-sm leading-snug text-foreground/90 line-clamp-2"
                  >
                    {idea.problem || "Untitled"}
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="mt-5 border-primary/25 font-mono text-xs uppercase tracking-wider" asChild>
              <Link to="/startup/ideas">Add idea</Link>
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-[0_16px_48px_-20px_hsl(var(--primary)/0.2)]">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent/40 opacity-80" />
          <div className="pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">pipeline</p>
            <h3 className="text-base font-semibold text-foreground">Innovation stages</h3>
            {pipelineTotal === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Empty runway — open studio 06.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ["Backlog", snap.pipeline.backlog],
                    ["Research", snap.pipeline.research],
                    ["Building", snap.pipeline.building],
                    ["Validated", snap.pipeline.validated],
                  ] as const
                ).map(([label, n]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border/40 bg-card px-2 py-3 text-center transition-colors hover:border-primary/30"
                  >
                    <p className="font-mono text-xl font-semibold tabular-nums text-foreground">{n}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-5 border-primary/25 font-mono text-xs uppercase tracking-wider" asChild>
              <Link to="/startup/innovation">Manage pipeline</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
