import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Lightbulb, Rocket, Briefcase, Workflow, CheckCircle, Layers,
  Menu, X, LogOut, Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileSettingsDialog from "@/components/ProfileSettingsDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { clearSession, getSession, type UserSession } from "@/lib/session";

const mainNav = [
  { title: "Main Dashboard", icon: LayoutDashboard, path: "/" },
];

const startupLab = [
  { title: "Idea Input & Structuring", icon: Lightbulb, path: "/startup/ideas" },
  { title: "Concept Generation", icon: Rocket, path: "/startup/concepts" },
  { title: "Business Model Planning", icon: Briefcase, path: "/startup/planning" },
  { title: "Workflow & Visualization", icon: Workflow, path: "/startup/workflow" },
  { title: "Concept Validation", icon: CheckCircle, path: "/startup/validation" },
  { title: "Innovation System", icon: Layers, path: "/startup/innovation" },
];

const FALLBACK_PROFILE: UserSession = {
  name: "Workspace operator",
  email: "Sign in to personalize",
};

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<UserSession | null>(() => getSession());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setProfile(getSession());
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 1023px)");
    const syncViewport = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        setMobileOpen(false);
      }
    };
    syncViewport(query.matches);
    const onChange = (event: MediaQueryListEvent) => syncViewport(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const closeOnMobile = () => {
    if (isMobile) setMobileOpen(false);
  };

  const activeProfile = profile ?? FALLBACK_PROFILE;
  const avatarLetter = activeProfile.name.trim().charAt(0).toUpperCase() || "?";

  const handleLogout = () => {
    clearSession();
    setProfile(null);
    closeOnMobile();
    navigate("/signin");
  };

  const isCompactDesktop = !isMobile && collapsed;

  const NavItem = ({ item }: { item: typeof mainNav[0] }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        className={active ? "sidebar-item-active" : "sidebar-item"}
        onClick={closeOnMobile}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!isCompactDesktop && <span className="truncate">{item.title}</span>}
      </Link>
    );
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl border border-border/50 bg-card p-2 text-foreground shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col border-r border-[hsl(var(--sidebar-border)/0.45)] bg-[hsl(var(--sidebar-background))] shadow-[4px_0_32px_-8px_hsl(var(--primary)/0.12)] transition-all duration-300
          ${isCompactDesktop ? "w-16" : "w-64"}
          ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
        `}
      >
        <div className="flex items-center border-b border-[hsl(var(--sidebar-border)/0.35)] px-4 py-5">
          <img src="/Logo OA.svg" alt="OA logo" className="ml-[60px] h-8 w-auto shrink-0 scale-[1.9] origin-left" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex sidebar-item w-full mb-2"
          >
            <Menu className="h-4 w-4 shrink-0" />
            {!isCompactDesktop && <span>Collapse</span>}
          </button>

          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          <div className="mt-6 space-y-1">
            {startupLab.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </nav>

        <div className="mt-auto space-y-2 border-t border-[hsl(var(--sidebar-border)/0.35)] px-3 py-4">
          {!isCompactDesktop ? (
            <>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex w-full items-center gap-2 rounded-xl border border-[hsl(var(--sidebar-border)/0.5)] bg-[hsl(var(--sidebar-accent)/0.35)] px-3 py-2.5 text-left shadow-inner transition-colors hover:bg-[hsl(var(--sidebar-accent)/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open settings"
              >
                <Avatar className="h-10 w-10 shrink-0 border-0">
                  <AvatarFallback className="rounded-full bg-muted text-sm font-bold text-foreground ring-1 ring-border/40">
                    {avatarLetter}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{activeProfile.name}</p>
                  <p
                    className={`truncate text-xs ${profile ? "text-muted-foreground" : "text-muted-foreground/80 italic"}`}
                  >
                    {activeProfile.email}
                  </p>
                </div>
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/70 bg-transparent py-2.5 text-sm font-medium text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsOpen(true);
                      closeOnMobile();
                    }}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--sidebar-border)/0.5)] bg-[hsl(var(--sidebar-accent)/0.4)] transition-colors hover:bg-[hsl(var(--sidebar-accent)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Open settings"
                  >
                    <Avatar className="h-9 w-9 border-0">
                      <AvatarFallback className="rounded-full bg-muted text-sm font-bold text-foreground ring-1 ring-border/40">
                        {avatarLetter}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="pointer-events-none absolute -right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-[hsl(var(--sidebar-background))] text-muted-foreground shadow-sm"
                      aria-hidden
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/70 text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>

      <ProfileSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={() => setProfile(getSession())}
      />
    </>
  );
}
