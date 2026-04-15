import { useMemo, useState } from "react";
import { Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Idea = {
  id: string;
  raw: string;
  problem: string;
  solution: string;
  tags: string[];
  createdAt: string;
};

function structureFromRaw(raw: string): { problem: string; solution: string; tags: string[] } {
  const lower = raw.toLowerCase();
  const tagHints = ["b2b", "b2c", "saas", "ai", "mobile", "api", "marketplace", "iot", "fintech", "health"];
  const tags = tagHints.filter((t) => lower.includes(t));

  const solutionIdx = raw.search(/\bsolution:?\s*/i);
  if (solutionIdx >= 0) {
    return {
      problem: raw.slice(0, solutionIdx).trim(),
      solution: raw.slice(solutionIdx).replace(/solution:?\s*/i, "").trim(),
      tags,
    };
  }

  const parts = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return { problem: parts[0], solution: parts.slice(1).join(" "), tags };
  }

  const half = Math.ceil(raw.length / 2);
  const splitAt = raw.lastIndexOf(" ", half);
  const i = splitAt > 20 ? splitAt : half;
  return {
    problem: raw.slice(0, i).trim() || raw,
    solution: raw.slice(i).trim() || "— refine after review",
    tags,
  };
}

export default function IdeaInput() {
  const [ideas, setIdeas] = useLocalStorage<Idea[]>("nexus-startup-ideas", []);
  const [draft, setDraft] = useState("");
  const [tagInput, setTagInput] = useState("");

  const preview = useMemo(() => structureFromRaw(draft), [draft]);

  const addIdea = () => {
    const raw = draft.trim();
    if (!raw) {
      toast.error("Write something first");
      return;
    }
    const manualTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const { problem, solution, tags } = structureFromRaw(raw);
    const merged = Array.from(new Set([...tags, ...manualTags.map((t) => t.toLowerCase())]));
    const idea: Idea = {
      id: crypto.randomUUID(),
      raw,
      problem,
      solution,
      tags: merged,
      createdAt: new Date().toISOString(),
    };
    setIdeas((prev) => [idea, ...prev]);
    setDraft("");
    setTagInput("");
    toast.success("Idea structured and saved");
  };

  const restructure = (id: string) => {
    setIdeas((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const s = structureFromRaw(i.raw);
        return { ...i, ...s };
      }),
    );
    toast.message("Re-structured from raw text");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>New idea</CardTitle>
          <CardDescription>Paste a rough note. We split problem vs solution and infer simple tags.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raw">Raw input</Label>
            <Textarea
              id="raw"
              placeholder="Problem… Optional: Solution: your approach"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="resize-none bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Extra tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="saas, b2b, …"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-2 text-sm">
            <p className="font-medium text-foreground">Live preview</p>
            <p>
              <span className="text-muted-foreground">Problem: </span>
              {preview.problem || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Solution: </span>
              {preview.solution || "—"}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {preview.tags.length === 0 && <span className="text-muted-foreground">No inferred tags</span>}
              {preview.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <Button type="button" onClick={addIdea} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Save structured idea
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>Your ideas ({ideas.length})</CardTitle>
          <CardDescription>Stored in this browser — reorder by newest first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[min(70vh,640px)] overflow-y-auto pr-1">
          {ideas.length === 0 && <p className="text-sm text-muted-foreground">No ideas yet.</p>}
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-xl border border-border/40 bg-background/30 p-4 space-y-2"
            >
              <div className="flex justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(idea.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-1 shrink-0">
                  <Button type="button" variant="ghost" size="sm" onClick={() => restructure(idea.id)}>
                    Re-parse
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setIdeas((prev) => prev.filter((x) => x.id !== idea.id));
                      toast.message("Removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm">
                <span className="text-muted-foreground">Problem: </span>
                {idea.problem}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Solution: </span>
                {idea.solution}
              </p>
              <div className="flex flex-wrap gap-1">
                {idea.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
