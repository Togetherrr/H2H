"use client";

import { useEffect, useState } from "react";
import {
  getVotingAppsByCategory,
  type VotingApp,
  type AppStrategy,
} from "@/lib/supabase/voting-service";

// ─── shape mà votingappcard nhận vào ────────────────────────────────────────

export type MappedApp = {
  id: string;
  name: string;
  badge: string;
  categoryId: string;
  iconImageSrc: string | undefined;
  androidHref: string | undefined;
  iosHref: string | undefined;
  guideHref: string;
  sections: { title: string; items: string[] }[];
};

function mapToCardProps(app: VotingApp, strategies: AppStrategy[]): MappedApp {
  // lọc chiến thuật tương ứng với app này và sắp xếp theo thứ tự
  const appStrategies = strategies
    .filter((s) => s.app_id === app.id)
    .sort((a, b) => a.order_num - b.order_num);

  return {
    id: app.id,
    name: app.name,
    // ưu tiên program_name (ví dụ: INKIGAYO), nếu null thì dùng category (ví dụ: MUSIC SHOWS)
    badge: (app.program_name || app.category).replace(/_/g, " ").toUpperCase(),
    categoryId: app.category,
    iconImageSrc: app.logo_url ?? undefined,
    androidHref: app.android_url ?? undefined,
    iosHref: app.ios_url ?? undefined,
    guideHref: `#guide-${app.id}`,
    sections: [
      { title: "currencies", items: app.currencies ?? [] },
      { title: "collection", items: app.collection_methods ?? [] },
      { title: "strategy",   items: appStrategies.map((s) => s.content) },
    ],
  };
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useVotingApps(category: string) {
  const [apps, setApps] = useState<MappedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getVotingAppsByCategory(category).then(
      ({ apps: raw, strategies, error: err }) => {
        if (cancelled) return;
        
        if (err) {
          setError(err);
        } else {
          // chuyển đổi dữ liệu thô từ supabase sang dạng card có thể hiển thị
          setApps(raw.map((app) => mapToCardProps(app, strategies)));
        }
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { apps, loading, error };
}