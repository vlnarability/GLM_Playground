"use client";

import { useGameStore } from "@/game/state/store";
import { STORY_MAP } from "@/game/data/story";
import { STAGES } from "@/game/data/stages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles } from "lucide-react";

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
          <div className="absolute top-2 right-2 text-xs text-muted-foreground flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span className="uppercase tracking-wide">Scripture</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: `${stage?.accent || "var(--accent)"}30`, border: `1px solid ${stage?.accent || "var(--accent)"}50` }}
            >
              {stage?.icon || "✨"}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{story.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[0.6rem]">{story.layer}</Badge>
                <Badge variant="secondary" className="text-[0.6rem]">{story.category}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm leading-relaxed text-foreground/95 italic">
            &ldquo;{story.body}&rdquo;
          </p>
          <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Triggered: {story.trigger}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/60 flex justify-end">
          <Button onClick={() => dismissStory(story.id)} variant="default" size="sm">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
