import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Braces, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LS_CLASS_VIEW = "nexus-settings-class-view";

function readBool(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
}

type ClassViewContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggle: () => void;
};

const ClassViewContext = createContext<ClassViewContextValue | null>(null);

export function useClassView() {
  const ctx = useContext(ClassViewContext);
  if (!ctx) {
    throw new Error("useClassView must be used within ClassViewProvider");
  }
  return ctx;
}

function getClassNameString(el: Element): string {
  if (typeof el.className === "string") return el.className;
  if (el.className && typeof (el.className as SVGAnimatedString).baseVal === "string") {
    return (el.className as SVGAnimatedString).baseVal;
  }
  return "";
}

function formatClasses(className: string) {
  return className.trim().split(/\s+/).filter(Boolean);
}

function ClassViewHud({ enabled }: { enabled: boolean }) {
  const [info, setInfo] = useState<{ tag: string; classes: string[] } | null>(null);

  useEffect(() => {
    if (!enabled) {
      setInfo(null);
      return;
    }

    const onMove = (e: MouseEvent) => {
      let node: EventTarget | null = e.target;
      if (node instanceof Text) node = node.parentElement;
      if (!(node instanceof Element)) {
        setInfo(null);
        return;
      }
      if (node.closest("[data-class-view-panel]")) return;

      const el = node;
      const cls = formatClasses(getClassNameString(el));
      setInfo({
        tag: el.tagName.toLowerCase(),
        classes: cls,
      });
    };

    document.addEventListener("mousemove", onMove, true);
    return () => document.removeEventListener("mousemove", onMove, true);
  }, [enabled]);

  if (!enabled) return null;

  const fullClassString = info?.classes?.length ? info.classes.join(" ") : "";

  const copy = async () => {
    if (!info?.classes.length) {
      toast.message("No classes on this element.");
      return;
    }
    const text = info.classes.join(" ");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Classes copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div
      data-class-view-panel
      className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[9999] max-h-[40vh] overflow-hidden rounded-lg border border-border/60 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-md md:left-auto md:right-4 md:w-[min(32rem,calc(100vw-2rem))]"
    >
      <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Braces className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>Class view</span>
          <kbd className="hidden rounded border border-border/50 bg-muted/50 px-1 font-mono text-[10px] text-muted-foreground sm:inline">
            Ctrl+Shift+C
          </kbd>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={copy}
            disabled={!fullClassString}
            aria-label="Copy classes"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {info ? (
        <div className="mt-2 space-y-1.5 text-left">
          <p className="font-mono text-xs text-foreground">
            <span className="text-primary">&lt;{info.tag}</span>
            {info.classes.length > 0 ? (
              <span className="text-muted-foreground">
                {" "}
                · {info.classes.length} class{info.classes.length === 1 ? "" : "es"}
              </span>
            ) : null}
            <span className="text-primary">&gt;</span>
          </p>
          {info.classes.length > 0 ? (
            <pre className="max-h-[22vh] overflow-auto break-words rounded-md bg-muted/40 p-2 font-mono text-[11px] leading-relaxed text-foreground/95 whitespace-pre-wrap">
              {fullClassString}
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground">Hover an element — no utility classes on this node.</p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Move the pointer over any element.</p>
      )}
    </div>
  );
}

export function ClassViewProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => readBool(LS_CLASS_VIEW, false));

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    try {
      localStorage.setItem(LS_CLASS_VIEW, String(value));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LS_CLASS_VIEW, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "C")) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
          return;
        }
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo<ClassViewContextValue>(
    () => ({ enabled, setEnabled, toggle }),
    [enabled, setEnabled, toggle],
  );

  return (
    <ClassViewContext.Provider value={value}>
      {children}
      <ClassViewHud enabled={enabled} />
    </ClassViewContext.Provider>
  );
}
