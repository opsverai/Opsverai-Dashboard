import { Database, BarChart3, Users, Cloud, Snowflake, MessageSquare } from "lucide-react";

const sources = [
  { name: "PostgreSQL", icon: Database, status: "Active", color: "text-primary" },
  { name: "Google Analytics", icon: BarChart3, status: "Active", color: "text-success" },
  { name: "Salesforce", icon: Users, status: "Connect", color: "text-muted-foreground" },
  { name: "AWS S3", icon: Cloud, status: "Active", color: "text-accent" },
  { name: "Snowflake", icon: Snowflake, status: "Connect", color: "text-muted-foreground" },
  { name: "HubSpot", icon: MessageSquare, status: "Active", color: "text-warning" },
];

export default function DataSources() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Data Sources</h3>
          <p className="text-xs text-muted-foreground">Connected integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sources.map((source) => (
          <div
            key={source.name}
            className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center cursor-pointer group"
          >
            <source.icon className={`h-6 w-6 ${source.color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-medium text-foreground">{source.name}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                source.status === "Active"
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {source.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
