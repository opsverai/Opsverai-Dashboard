import { Brain, Sparkles, Zap } from "lucide-react";

export default function AIEngine() {
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 animate-shimmer opacity-50" />

      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 animate-float">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Intelligence Engine</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Powered by Advanced AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Models Active", value: "12", icon: Brain },
            { label: "Predictions", value: "2.4K", icon: Sparkles },
            { label: "Accuracy", value: "97.8%", icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/20">
              <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" />
          <span>Neural networks processing 1.2M data points/sec</span>
        </div>
      </div>
    </div>
  );
}
