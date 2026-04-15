import { useState } from "react";
import { ClipboardList, Plus, Trash2, Check } from "lucide-react";

interface Task {
  id: number;
  text: string;
  done: boolean;
}

export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Review Q4 analytics report", done: false },
    { id: 2, text: "Update data pipeline config", done: true },
    { id: 3, text: "Schedule team sync", done: false },
  ]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/10">
          <ClipboardList className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Operations Tracker</h3>
          <p className="text-xs text-muted-foreground">{tasks.filter(t => t.done).length}/{tasks.length} completed</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground input-glow focus:outline-none focus:border-primary/50 transition-all"
        />
        <button
          onClick={addTask}
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
              task.done
                ? "bg-success/5 border-success/20"
                : "bg-muted/20 border-border/30 hover:border-border/50"
            }`}
          >
            <button
              onClick={() =>
                setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
              }
              className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                task.done
                  ? "bg-success border-success text-background"
                  : "border-muted-foreground/30 hover:border-primary"
              }`}
            >
              {task.done && <Check className="h-3 w-3" />}
            </button>
            <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.text}
            </span>
            <button
              onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
              className="text-muted-foreground/50 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
