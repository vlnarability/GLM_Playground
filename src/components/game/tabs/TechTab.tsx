"use client";

import { useGameStore } from "@/game/state/store";
import { techsForStage, TECH_MAP } from "@/game/data/techs";
import { STAGES } from "@/game/data/stages";
import { ARCHETYPE_MAP } from "@/game/data/archetypes";
import { formatNumber, resourceColor, resourceIcon } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

export function TechTab() {
  const stageIndex = useGameStore((s) => s.stageIndex);
  const resources = useGameStore((s) => s.resources);
  const technologies = useGameStore((s) => s.technologies);
  const buyTech = useGameStore((s) => s.buyTech);

  const stage = STAGES[stageIndex];
  const techs = techsForStage(stage.id);

  // Group by branch
  const branches = techs.reduce((acc, t) => {
    (acc[t.branch] = acc[t.branch] || []).push(t);
    return acc;
  }, {} as Record<string, typeof techs>);

  return (
    <div className="space-y-4">
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            {stage.name} Technology
          </CardTitle>
          <CardDescription>
            Research permanent bonuses. Prerequisites must be met before higher tiers unlock.
          </CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(branches).map(([branch, list]) => (
        <Card key={branch} className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-accent" />
              {branch} Path
              <Badge variant="outline" className="text-xs ml-auto">
                {list.filter((t) => technologies[t.id]).length}/{list.length} researched
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {list
                .sort((a, b) => a.tier - b.tier)
                .map((tech) => {
                  const owned = !!technologies[tech.id];
                  const prereqMet = !tech.requires || tech.requires.every((r) => technologies[r]);
                  const canAfford = Object.entries(tech.cost).every(([r, v]) => (resources[r] || 0) >= (v as number));
                  return (
                    <div
                      key={tech.id}
                      className={`stat-card transition-opacity ${owned ? "opacity-60" : !prereqMet ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {owned ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : !prereqMet ? (
                            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold leading-tight truncate">
                              {tech.name}
                            </div>
                            <Badge variant="outline" className="text-[0.6rem] mt-0.5">Tier {tech.tier} · {tech.branch}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 leading-snug">{tech.desc}</p>
                      {/* Prerequisite list */}
                      {!owned && tech.requires && tech.requires.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mb-2 text-xs">
                          <span className="text-muted-foreground">Requires:</span>
                          {tech.requires.map((req) => {
                            const met = technologies[req];
                            const reqTech = TECH_MAP[req];
                            return (
                              <span
                                key={req}
                                className={cn(
                                  "px-1.5 py-0.5 rounded border text-[0.65rem]",
                                  met
                                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                                    : "border-red-500/30 text-red-400 bg-red-500/5"
                                )}
                              >
                                {met ? "✓" : "✗"} {reqTech?.name || req}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {/* Affinity grant */}
                      {tech.grantsAffinity && (
                        <Badge
                          variant="outline"
                          className="text-[0.6rem] mb-2"
                          style={{
                            borderColor: `${ARCHETYPE_MAP[tech.grantsAffinity.archetype].color}50`,
                            color: ARCHETYPE_MAP[tech.grantsAffinity.archetype].color,
                          }}
                          title={`Shifts lineage toward ${ARCHETYPE_MAP[tech.grantsAffinity.archetype].name}`}
                        >
                          {ARCHETYPE_MAP[tech.grantsAffinity.archetype].glyph} {ARCHETYPE_MAP[tech.grantsAffinity.archetype].name} drift +{tech.grantsAffinity.amount}
                        </Badge>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {!owned && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {Object.entries(tech.cost).map(([r, v]) => {
                              const have = (resources[r] || 0);
                              const enough = have >= (v as number);
                              return (
                                <span
                                  key={r}
                                  className={enough ? "" : "text-red-400"}
                                  style={enough ? { color: resourceColor(r) } : undefined}
                                >
                                  {resourceIcon(r)}{formatNumber(v as number, 0)}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant={owned ? "outline" : "default"}
                          className="h-7 ml-auto"
                          disabled={owned || !prereqMet || !canAfford}
                          onClick={() => buyTech(tech.id)}
                        >
                          {owned ? "Researched" : !prereqMet ? "Locked" : "Research"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
