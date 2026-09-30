"use client";

import { useGameStore } from "@/game/state/store";
import { STORY_MAP } from "@/game/data/story";
import { STAGES } from "@/game/data/stages";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function StoryPopup() {
  const activeStoryPopup = useGameStore((s) => s.activeStoryPopup);
  const dismissStory = useGameStore((s) => s.dismissStory);

  if (!activeStoryPopup) return null;
  const story = STORY_MAP[activeStoryPopup];
  if (!story) return null;

  const stage = STAGES.find((s) => s.id === story.stage);

  return (
    <div
      className="story-popup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissStory(story.id);
      }}
    >
      <div className="story-popup-card glass-strong rounded-xl overflow-hidden border border-accent/30">
        {/* Header with stage accent */}
        <div
          className="relative p-4 border-b border-border/60 overflow-hidden"
          style={{
            background: stage
              ? `linear-gradient(135deg, ${stage.accent}30 0%, transparent 70%)`
              : "linear-gradient(135deg, var(--accent)30 0%, transparent 70%)",
          }}
        >
          {/* Layer label as eyebrow, not corner tag */}
          <div className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground font-mono mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            {story.layer} Scripture
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
              style={{
                background: `${stage?.accent || "var(--accent)"}20`,
                border: `1px solid ${stage?.accent || "var(--accent)"}40`,
              }}
            >
              {stage?.icon || "✨"}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight">{story.title}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                {/* Differentiate: category gets a filled chip, trigger context gets an outline */}
                <span
                  className="text-[0.6rem] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
                  style={{
                    background: `${stage?.accent || "var(--accent)"}25`,
                    color: stage?.accent || "var(--accent)",
                    border: `1px solid ${stage?.accent || "var(--accent)"}40`,
                  }}
                >
                  {story.category}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {stage?.name || "Meta"} · {story.trigger}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm leading-relaxed text-foreground/95 italic">
            &ldquo;{story.body}&rdquo;
          </p>
        </div>

        {/* Footer — full-width centered Continue */}
        <div className="px-5 pb-5">
          <Button
            onClick={() => dismissStory(story.id)}
            variant="default"
            size="lg"
            className="w-full"
            style={stage ? { background: stage.accent, color: "#0a0a1a" } : undefined}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
