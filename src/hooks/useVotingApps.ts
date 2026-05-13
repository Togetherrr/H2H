"use client";

import { useEffect, useState } from "react";
import {
  getVotingAppsByCategory,
  type VotingApp,
  type AppStrategy,
  type VotingRound, // import thêm type mới từ service
} from "@/lib/supabase/voting-service";

// ─── shape mà votingappcard nhận vào (đã thêm rounds) ──────────────────────────

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
  // thêm trường này để giao diện awards có thể check thời gian
  rounds: VotingRound[]; 
};

function mapToCardProps(app: VotingApp, strategies: AppStrategy[]): MappedApp {
  // lọc chiến thuật tương ứng với app này và sắp xếp theo thứ tự
  const appStrategies = strategies
    .filter((s) => s.app_id === app.id)
    .sort((a, b) => a.order_num - b.order_num);

  return {
    id: app.id,
    name: app.name,
    // giữ nguyên logic: ưu tiên program_name, ko có thì dùng category
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
    // lấy dữ liệu voting_rounds từ db, nếu ko có thì mặc định là mảng rỗng
    rounds: app.voting_rounds ?? [],
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
          // chuyển đổi dữ liệu thô (đã có thêm rounds) sang dạng card hiển thị
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