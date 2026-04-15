import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type ColumnId = "backlog" | "research" | "building" | "validated";

type CardItem = { id: string; title: string; column: ColumnId };

const COLUMNS: { id: ColumnId; title: string; description: string }[] = [
  { id: "backlog", title: "Backlog", description: "Captured, not started" },
  { id: "research", title: "Research", description: "Discovery & validation" },
  { id: "building", title: "Building", description: "Design & implementation" },
  { id: "validated", title: "Validated", description: "Evidence of fit" },
];

const ORDER: ColumnId[] = ["backlog", "research", "building", "validated"];

export default function InnovationSystem() {
  const [items, setItems] = useLocalStorage<CardItem[]>("nexus-startup-pipeline", [
    { id: "a", title: "Vendor renewal alerts", column: "backlog" },
    { id: "b", title: "Usage-based billing explorer", column: "research" },
  ]);
  const [title, setTitle] = useState("");

  const add = () => {
    const t = title.trim();
    if (!t) {
      toast.error("Enter an initiative title");
      return;
    }
    setItems((prev) => [...prev, { id: crypto.randomUUID(), title: t, column: "backlog" }]);
    setTitle("");
    toast.success("Added to backlog");
  };

  const advance = (id: string) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const idx = ORDER.indexOf(item.column);
    if (idx >= ORDER.length - 1) {
      toast.message("Already in Validated");
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, column: ORDER[idx + 1] } : x)),
    );
    toast.message("Moved forward");
  };

  const regress = (id: string) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const idx = ORDER.indexOf(item.column);
    if (idx <= 0) {
      toast.message("Already in Backlog");
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, column: ORDER[idx - 1] } : x)),
    );
    toast.message("Moved back");
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast.message("Removed");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/40">
        <CardHeader>
          <CardTitle>New initiative</CardTitle>
          <CardDescription>Cards start in Backlog. Use arrows to simulate a stage gate.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="init">Title</Label>
            <Input
              id="init"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI triage for support tickets"
              className="bg-background/50"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          </div>
          <Button type="button" className="sm:self-end" onClick={add}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <Card key={col.id} className="border-border/50 bg-card/40 flex flex-col min-h-[280px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{col.title}</CardTitle>
              <CardDescription>{col.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              {items
                .filter((i) => i.column === col.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-2"
                  >
                    <p className="text-sm font-medium leading-snug">{item.title}</p>
                    <div className="flex flex-wrap gap-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => regress(item.id)}>
                        ← Back
                      </Button>
                      <Button type="button" size="sm" onClick={() => advance(item.id)}>
                        Forward
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(item.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              {items.filter((i) => i.column === col.id).length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Empty</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
