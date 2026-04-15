const BMC_KEYS = [
  "partners",
  "activities",
  "resources",
  "value",
  "relationships",
  "channels",
  "segments",
  "costs",
  "revenue",
] as const;

const CHECK_IDS = ["interviews", "prototype", "metric", "competitor", "pricing"] as const;

export const STARTUP_STORAGE = {
  ideas: "nexus-startup-ideas",
  savedConcepts: "nexus-startup-saved-concepts",
  bmc: "nexus-startup-bmc",
  workflow: "nexus-startup-workflow",
  valChecks: "nexus-startup-val-checks",
  valConfidence: "nexus-startup-val-confidence",
  valEvidence: "nexus-startup-val-evidence",
  pipeline: "nexus-startup-pipeline",
} as const;

function parseJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseNum(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = JSON.parse(raw);
    return typeof n === "number" && !Number.isNaN(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

const BMC_SHORT: Record<(typeof BMC_KEYS)[number], string> = {
  partners: "Partners",
  activities: "Activities",
  resources: "Resources",
  value: "Value prop",
  relationships: "Relationships",
  channels: "Channels",
  segments: "Segments",
  costs: "Costs",
  revenue: "Revenue",
};

export type StartupSnapshot = {
  ideaCount: number;
  savedConceptCount: number;
  bmcPercent: number;
  workflowStepCount: number;
  workflowTotalDays: number;
  validationScore: number;
  pipeline: { backlog: number; research: number; building: number; validated: number };
  recentIdeas: { id: string; problem: string }[];
  /** 0–100 per canvas block (12+ chars = 100) */
  bmcBlocks: { id: string; label: string; fill: number }[];
  validationFactors: { name: string; value: number }[];
  workflowSteps: { name: string; days: number }[];
  /** Normalized 0–100 for radar / overview */
  workspaceRadar: { subject: string; value: number; fullMark: number }[];
};

export function readStartupSnapshot(): StartupSnapshot {
  const ideas = parseJson<{ id: string; problem: string }[]>(STARTUP_STORAGE.ideas, []);
  const saved = parseJson<unknown[]>(STARTUP_STORAGE.savedConcepts, []);
  const canvas = parseJson<Record<string, string>>(STARTUP_STORAGE.bmc, {});
  const steps = parseJson<{ days: number }[]>(STARTUP_STORAGE.workflow, []);
  const checks = parseJson<Partial<Record<(typeof CHECK_IDS)[number], boolean>>>(STARTUP_STORAGE.valChecks, {});
  const confidence = parseNum(STARTUP_STORAGE.valConfidence, 60);
  const evidence = parseNum(STARTUP_STORAGE.valEvidence, 40);

  const filledBmc = BMC_KEYS.filter((k) => (canvas[k] ?? "").trim().length >= 12).length;
  const bmcPercent = Math.round((filledBmc / BMC_KEYS.length) * 100);

  const doneChecks = CHECK_IDS.filter((id) => checks[id]).length;
  const checkPart = doneChecks / CHECK_IDS.length;
  const validationScore = Math.round(
    (0.35 * (confidence / 100) + 0.35 * (evidence / 100) + 0.3 * checkPart) * 100,
  );

  const pipelineItems = parseJson<{ column: string }[]>(STARTUP_STORAGE.pipeline, []);
  const pipeline = {
    backlog: pipelineItems.filter((x) => x.column === "backlog").length,
    research: pipelineItems.filter((x) => x.column === "research").length,
    building: pipelineItems.filter((x) => x.column === "building").length,
    validated: pipelineItems.filter((x) => x.column === "validated").length,
  };

  const totalDays = steps.reduce((s, x) => s + (typeof x.days === "number" ? x.days : 0), 0);

  const bmcBlocks = BMC_KEYS.map((k) => {
    const len = (canvas[k] ?? "").trim().length;
    const fill = len >= 12 ? 100 : Math.min(100, Math.round((len / 12) * 100));
    return { id: k, label: BMC_SHORT[k], fill };
  });

  const validationFactors = [
    { name: "Problem confidence", value: confidence },
    { name: "Evidence quality", value: evidence },
    { name: "Checklist done", value: Math.round(checkPart * 100) },
  ];

  type WfStep = { label?: string; days?: number };
  const wf = steps as WfStep[];
  const workflowSteps = wf.map((s, i) => ({
    name: (s.label ?? `Step ${i + 1}`).slice(0, 18),
    days: typeof s.days === "number" ? s.days : 0,
  }));

  const clampPct = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

  const workspaceRadar = [
    { subject: "Ideas", value: clampPct(ideas.length * 18), fullMark: 100 },
    { subject: "Concepts", value: clampPct(saved.length * 22), fullMark: 100 },
    { subject: "Canvas", value: bmcPercent, fullMark: 100 },
    { subject: "Workflow", value: clampPct(steps.length * 14 + (totalDays > 0 ? 12 : 0)), fullMark: 100 },
    { subject: "Validation", value: validationScore, fullMark: 100 },
    {
      subject: "Pipeline",
      value: clampPct(pipelineItems.length * 16),
      fullMark: 100,
    },
  ];

  return {
    ideaCount: ideas.length,
    savedConceptCount: saved.length,
    bmcPercent,
    workflowStepCount: steps.length,
    workflowTotalDays: totalDays,
    validationScore,
    pipeline,
    recentIdeas: ideas.slice(0, 4),
    bmcBlocks,
    validationFactors,
    workflowSteps,
    workspaceRadar,
  };
}
