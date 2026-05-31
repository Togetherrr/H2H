"use client";

import { useEffect, useState } from "react";
import {
  getVotingAppsByCategory,
  type VotingApp,
  type AppStrategy,
  type VotingRound,
  type GuideStep,
} from "@/lib/supabase/voting-service";

export type MappedApp = {
  id: string;
  name: string;
  badge: string;
  categoryId: string;
  iconImageSrc: string | undefined;
  androidHref: string | undefined;
  iosHref: string | undefined;
  websiteHref: string | undefined;
  guideHref: string;
  sections: { title: string; items: string[] }[];
  rounds: VotingRound[];
  guideSteps: GuideStep[];
  description: string | null;
  reflection_rate: string[] | null;
  ceremony_at: string | null;
};

function mapToCardProps(app: VotingApp, strategies: AppStrategy[]): MappedApp {
  const appStrategies = strategies
    .filter((strategy) => strategy.app_id === app.id)
    .sort((a, b) => a.order_num - b.order_num);

  const guideSteps = (app.guide_steps ?? []).slice().sort((a, b) => a.step_num - b.step_num)
  const guideItems = guideSteps.map((step) => {
    const title = step.title?.trim() || `Step ${step.step_num}`
    const description = step.description?.trim()
    return description ? `${step.step_num}. ${title} — ${description}` : `${step.step_num}. ${title}`
  })

  return {
    id: app.id,
    name: app.name,
    badge: (app.program_name || app.category).replace(/_/g, " ").toUpperCase(),
    categoryId: app.category,
    iconImageSrc: app.logo_url ?? undefined,
    androidHref: app.android_url ?? undefined,
    iosHref: app.ios_url ?? undefined,
    websiteHref: (app as any).website_url ?? undefined,
    guideHref: `#guide-${app.id}`,
    sections: [
      { title: "currencies", items: app.currencies ?? [] },
      { title: "collection", items: app.collection_methods ?? [] },
      { title: "strategy", items: appStrategies.map((strategy) => strategy.content) },
      { title: "guide", items: guideItems },
    ],
    rounds: app.voting_rounds ?? [],
    guideSteps,
    description: app.description ?? null,
    reflection_rate: app.reflection_rate ?? null,
    ceremony_at: app.ceremony_at ?? null,
  };
}

export function useVotingApps(category: string) {
  const [apps, setApps] = useState<MappedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getVotingAppsByCategory(category).then(({ apps: raw, strategies, error: err }) => {
      if (cancelled) return;

      if (err) {
        setError(err);
      } else {
        setApps(raw.map((app) => mapToCardProps(app, strategies)));
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { apps, loading, error };
}
