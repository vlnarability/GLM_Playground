"use client";

import { useGameStore } from "@/game/state/store";
import { techsForStage } from "@/game/data/techs";
import { STAGES } from "@/game/data/stages";
import { formatNumber, resourceColor, resourceIcon } from "../shared/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, GitBranch } from "lucide-react";

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
                      className={`stat-card transition-opacity ${owned ? "opacity-60" : !prereqMet ? "opacity-40" : ""}`}
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
                            <Badge variant="outline" className="text-[0.6rem] mt-0.5">Tier {tech.tier}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 leading-snug">{tech.desc}</p>
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
