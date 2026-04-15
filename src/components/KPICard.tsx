import { useState } from "react";
import { Target, Play } from "lucide-react";

export default function KPICard() {
  const [targets, setTargets] = useState({ revenue: "500000", users: "10000", conversion: "5.5" });
  const [running, setRunning] = useState(false);

  const handleCheck = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2000);
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">KPI Target Control</h3>
            <p className="text-xs text-muted-foreground">Set and monitor key metrics</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: "Revenue Target ($)", key: "revenue" as const, progress: 72 },
          { label: "Active Users", key: "users" as const, progress: 88 },
          { label: "Conversion Rate (%)", key: "conversion" as const, progress: 64 },
        ].map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <label className="text-muted-foreground">{item.label}</label>
              <span className="text-xs text-primary font-medium">{item.progress}%</span>
            </div>
            <input
              type="text"
              value={targets[item.key]}
              onChange={(e) => setTargets({ ...targets, [item.key]: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-sm text-foreground input-glow focus:outline-none focus:border-primary/50 transition-all"
            />
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCheck}
        disabled={running}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm btn-glow hover:brightness-110 transition-all disabled:opacity-60"
      >
        {running ? (
          <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {running ? "Running Health Check..." : "Run Health Check"}
      </button>

      {running && (
        <p className="text-xs text-center text-primary animate-pulse">Analyzing system performance...</p>
      )}
    </div>
  );
}
