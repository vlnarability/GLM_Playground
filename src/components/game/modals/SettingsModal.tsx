"use client";

import { useGameStore } from "@/game/state/store";
import { STAGES } from "@/game/data/stages";
import { ACHIEVEMENTS } from "@/game/data/achievements";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Settings, Download, Upload, Save, AlertTriangle, Copy, Check,
  Clock, Users, Star, Award, Database, Keyboard,
} from "lucide-react";
import { formatNumber, formatTime } from "../shared/format";

export function SettingsModal() {
  const showSettings = useGameStore((s) => s.showSettings);
  const setShowSettings = useGameStore((s) => s.setShowSettings);
  const exportSave = useGameStore((s) => s.exportSave);
  const importSave = useGameStore((s) => s.importSave);
  const hardReset = useGameStore((s) => s.hardReset);
  const saveGame = useGameStore((s) => s.saveGame);

  // Game stats
  const time = useGameStore((s) => s.time);
  const population = useGameStore((s) => s.population);
  const totalRuns = useGameStore((s) => s.totalRuns);
  const galacticWins = useGameStore((s) => s.galacticWins);
  const evolutionPoints = useGameStore((s) => s.evolutionPoints);
  const achievements = useGameStore((s) => s.achievements || {});
  const stageIndex = useGameStore((s) => s.stageIndex);
  const lastSaved = useGameStore((s) => s.lastSaved);

  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [importResult, setImportResult] = useState<"idle" | "success" | "error">("idle");
  const [confirmReset, setConfirmReset] = useState(false);

  const stage = STAGES[stageIndex];
  const earnedAchievements = ACHIEVEMENTS.filter((a) => achievements[a.id]).length;

  const handleExport = () => {
    const data = exportSave();
    setExportText(data);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text field
      setCopied(false);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setImportResult("error");
      return;
    }
    const ok = importSave(importText.trim());
    setImportResult(ok ? "success" : "error");
    if (ok) {
      setTimeout(() => {
        setShowSettings(false);
        setImportText("");
        setImportResult("idle");
      }, 1000);
    }
  };

  const handleDownload = () => {
    const data = exportSave();
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-idle-save-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const lastSavedDate = lastSaved ? new Date(lastSaved).toLocaleString() : "never";

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            Settings & Save Management
          </DialogTitle>
          <DialogDescription>
            Export your progress, import a backup, or reset.
          </DialogDescription>
        </DialogHeader>

        {/* Game stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <StatCard icon={<Clock className="w-3 h-3" />} label="Run Time" value={formatTime(time)} />
          <StatCard icon={<Users className="w-3 h-3" />} label="Population" value={formatNumber(population, 0)} />
          <StatCard icon={<Star className="w-3 h-3" />} label="Total Runs" value={String(totalRuns)} />
          <StatCard icon={<Award className="w-3 h-3" />} label="Achievements" value={`${earnedAchievements}/${ACHIEVEMENTS.length}`} />
          <StatCard icon={<Database className="w-3 h-3" />} label="Galactic Wins" value={String(galacticWins)} />
          <StatCard icon={<Star className="w-3 h-3" />} label="Evolution Pts" value={formatNumber(evolutionPoints, 0)} />
          <StatCard icon={<Star className="w-3 h-3" />} label="Stage" value={`${stageIndex + 1}/7`} />
          <StatCard icon={<Save className="w-3 h-3" />} label="Last Saved" value={lastSavedDate.split(",")[0] || "now"} />
        </div>

        <Separator className="my-3" />

        {/* Export section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Download className="w-4 h-4 text-primary" />
            Export Save
          </h3>
          <p className="text-xs text-muted-foreground">
            Generate an encoded save string. Copy it or download as a file to back up your progress.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="h-8">
              <Download className="w-3 h-3 mr-1" />
              Generate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={!exportText}
              className="h-8"
            >
              {copied ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={!exportText}
              className="h-8"
            >
              <Save className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
          {exportText && (
            <textarea
              readOnly
              value={exportText}
              className="w-full h-20 text-xs font-mono p-2 rounded bg-muted/40 border border-border resize-none"
              onFocus={(e) => e.target.select()}
            />
          )}
        </div>

        <Separator className="my-3" />

        {/* Import section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-primary" />
            Import Save
          </h3>
          <p className="text-xs text-muted-foreground">
            Paste a save string or load from a file. This will overwrite your current progress.
          </p>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportResult("idle");
            }}
            placeholder="Paste your save string here..."
            className="w-full h-20 text-xs font-mono p-2 rounded bg-muted/40 border border-border resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleImport}
              disabled={!importText.trim()}
              className="h-8"
            >
              <Upload className="w-3 h-3 mr-1" />
              Import
            </Button>
            <label className="inline-flex items-center gap-1 px-3 h-8 text-xs rounded-md border border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
              <Upload className="w-3 h-3" />
              Load File
              <input type="file" accept=".txt,.json" onChange={handleFileImport} className="hidden" />
            </label>
            {importResult === "success" && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 self-center">
                <Check className="w-3 h-3" /> Imported successfully!
              </span>
            )}
            {importResult === "error" && (
              <span className="text-xs text-red-400 flex items-center gap-1 self-center">
                <AlertTriangle className="w-3 h-3" /> Invalid save data
              </span>
            )}
          </div>
        </div>

        <Separator className="my-3" />

        {/* Manual save */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Save className="w-4 h-4 text-primary" />
            Manual Save
          </h3>
          <p className="text-xs text-muted-foreground">
            The game auto-saves every 30 seconds. You can also save manually now.
          </p>
          <Button size="sm" variant="outline" onClick={() => saveGame()} className="h-8">
            <Save className="w-3 h-3 mr-1" />
            Save Now
          </Button>
        </div>

        <Separator className="my-3" />

        {/* Keyboard shortcuts */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-primary" />
            Keyboard Shortcuts
          </h3>
          <p className="text-xs text-muted-foreground">Power-user controls. Active when no input is focused.</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <Shortcut keys="Space" desc="Pause / resume" />
            <Shortcut keys="1-4" desc="Game speed (1×, 2×, 4×, 8×)" />
            <Shortcut keys="Q" desc="Actions tab" />
            <Shortcut keys="W" desc="Systems tab" />
            <Shortcut keys="E" desc="Production tab" />
            <Shortcut keys="R" desc="Tech tab" />
            <Shortcut keys="T" desc="Story tab" />
            <Shortcut keys="Y" desc="Codex tab" />
            <Shortcut keys="U" desc="Awards tab" />
            <Shortcut keys="I" desc="Archive tab" />
            <Shortcut keys="O" desc="Log tab" />
            <Shortcut keys="S" desc="Open Shop" />
            <Shortcut keys="B" desc="Open Evolve" />
            <Shortcut keys="," desc="Open Settings" />
            <Shortcut keys="Esc" desc="Close modal / dismiss popup" />
          </div>
        </div>

        <Separator className="my-3" />

        {/* Danger zone */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
          {!confirmReset ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmReset(true)}
              className="h-8 border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Hard Reset
            </Button>
          ) : (
            <div className="space-y-2 p-3 rounded border border-red-500/40 bg-red-500/5">
              <p className="text-xs text-red-300">
                This will erase <span className="font-bold">ALL progress</span> — every run, every upgrade,
                every achievement, every story beat. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setConfirmReset(false)} className="h-8">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    hardReset();
                    setShowSettings(false);
                    setConfirmReset(false);
                  }}
                  className="h-8"
                >
                  Erase Everything
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setShowSettings(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat-card text-center py-2">
      <div className="flex items-center justify-center gap-1 text-muted-foreground text-[0.6rem] mb-1 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-sm font-bold tabular-nums truncate">{value}</div>
    </div>
  );
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/40 text-[0.6rem] font-mono font-semibold text-foreground min-w-[2rem] text-center shrink-0">
        {keys}
      </kbd>
      <span className="text-xs text-muted-foreground truncate">{desc}</span>
    </div>
  );
}
