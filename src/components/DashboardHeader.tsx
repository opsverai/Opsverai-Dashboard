import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Startup Workspace", subtitle: "Idea-to-validation overview" },
  "/startup/ideas": { title: "Idea Input & Structuring", subtitle: "Capture, tag, and structure raw ideas" },
  "/startup/concepts": { title: "Concept Generation", subtitle: "Generate and refine product concepts" },
  "/startup/planning": { title: "Business Model Planning", subtitle: "Build and track your business model canvas" },
  "/startup/workflow": { title: "Workflow & Visualization", subtitle: "Map stages and timelines" },
  "/startup/validation": { title: "Concept Validation", subtitle: "Score hypotheses and evidence" },
  "/startup/innovation": { title: "Innovation System", subtitle: "Pipeline from backlog to validated" },
};

type Notice = {
  id: string;
  title: string;
  detail: string;
  read: boolean;
};

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());
  const [notices, setNotices] = useState<Notice[]>([
    { id: "n1", title: "Validation updated", detail: "Concept score changed from latest edits.", read: false },
    { id: "n2", title: "Ideas synced", detail: "Your workspace data is up to date.", read: false },
    { id: "n3", title: "Reminder", detail: "Review pipeline backlog before planning.", read: true },
  ]);
  const { pathname } = useLocation();

  const meta = useMemo(
    () => ROUTE_META[pathname] ?? { title: APP_NAME, subtitle: APP_TAGLINE },
    [pathname],
  );

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unreadCount = useMemo(() => notices.filter((n) => !n.read).length, [notices]);

  const markAllRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[hsl(var(--border)/0.45)] bg-card py-4 pl-6 pr-6 max-lg:pl-16 max-sm:gap-2 max-sm:py-3 max-sm:pr-3 shadow-[0_1px_0_hsl(var(--primary)/0.08)]">
      <div className="min-w-0 flex-1 pr-1 max-sm:pr-0">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-xl">{meta.title}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 px-2 py-1.5 sm:gap-3 sm:px-3">
        <Badge
          variant="outline"
          className="hidden items-center gap-2 rounded-full border-primary/30 bg-background/70 px-3 py-1 text-[11px] font-medium text-foreground sm:inline-flex"
          title="Workspace connection status"
        >
          <span className="glow-dot" />
          <span>System online</span>
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-full border-primary/35 bg-background/70 text-primary hover:bg-primary/15 hover:text-primary"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-xs font-normal text-muted-foreground">{unreadCount} unread</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notices.map((notice) => (
              <DropdownMenuItem
                key={notice.id}
                onSelect={() => markRead(notice.id)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="text-sm font-medium text-foreground">{notice.title}</span>
                <span className="text-xs text-muted-foreground">{notice.detail}</span>
                {!notice.read && <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">New</span>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={markAllRead} className="justify-center text-xs font-semibold text-primary">
              Mark all as read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden rounded-xl border border-primary/30 bg-background/70 px-3 py-1.5 text-right sm:block">
          <p className="text-sm font-bold leading-none text-primary">{time.toLocaleTimeString()}</p>
          <p className="mt-1 text-[11px] leading-none text-foreground/80">{time.toLocaleDateString()}</p>
        </div>
      </div>
    </header>
  );
}
