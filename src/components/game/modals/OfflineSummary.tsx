"use client";

import { formatNumber, formatTime, resourceColor, resourceIcon, resourceName } from "../shared/format";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface OfflineSummaryProps {
  elapsed: number; // seconds
  resourcesGained: Record<string, number>;
  onClose: () => void;
}

export function OfflineSummary({ elapsed, resourcesGained, onClose }: OfflineSummaryProps) {
  const gains = Object.entries(resourcesGained)
    .filter(([, v]) => Math.abs(v) > 0.01)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  const positiveGains = gains.filter(([, v]) => v > 0);
  const negativeGains = gains.filter(([, v]) => v < 0);

  return (
    <div className="story-popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="story-popup-card glass-strong rounded-xl overflow-hidden border border-primary/30 max-w-md">
        {/* Header */}
        <div className="relative p-4 border-b border-border/60 bg-primary/10">
          <div className="text-[0.65rem] uppercase tracking-[0.25em] text-primary font-mono mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Offline Progress
          </div>
          <h2 className="text-lg font-bold leading-tight">
            You were away for {formatTime(elapsed)}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your civilization continued to produce while you were gone.
          </p>
        </div>

        {/* Body — resource gains */}
        <div className="p-5 space-y-3">
          {gains.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No significant changes while away.
            </p>
          ) : (
            <>
              {positiveGains.length > 0 && (
                <div>
                  <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Gained
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {positiveGains.map(([r, v]) => (
                      <div key={r} className="stat-card flex items-center gap-2 py-1.5">
                        <span className="text-base">{resourceIcon(r)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[0.65rem] text-muted-foreground truncate">{resourceName(r)}</div>
                          <div className="text-sm font-bold tabular-nums" style={{ color: resourceColor(r) }}>
                            +{formatNumber(v)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {negativeGains.length > 0 && (
                <div>
                  <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    Consumed
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {negativeGains.map(([r, v]) => (
                      <div key={r} className="stat-card flex items-center gap-2 py-1.5 opacity-70">
                        <span className="text-base">{resourceIcon(r)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[0.65rem] text-muted-foreground truncate">{resourceName(r)}</div>
                          <div className="text-sm font-bold tabular-nums text-red-400">
                            {formatNumber(v)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Button onClick={onClose} variant="default" size="lg" className="w-full">
            Welcome Back
          </Button>
        </div>
      </div>
    </div>
  );
}
