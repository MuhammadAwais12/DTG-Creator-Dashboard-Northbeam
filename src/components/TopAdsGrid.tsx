import React from "react";
import { Award, DollarSign, TrendingUp, ShoppingBag, Layers, User } from "lucide-react";
import { DateRange, TopAdMetric } from "../types";

interface TopAdsGridProps {
  topAds: TopAdMetric[];
  isLoading?: boolean;
  dateRange?: DateRange;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val >= 1000 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
};

const formatOrders = (val: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(val || 0);
};

export const TopAdsGrid: React.FC<TopAdsGridProps> = ({
  topAds,
  isLoading = false,
  dateRange = "14d",
}) => {
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10";
      case 2:
        return "bg-slate-300/20 text-slate-200 border-slate-300/40 shadow-sm shadow-slate-300/10";
      case 3:
        return "bg-amber-700/20 text-amber-400 border-amber-600/40 shadow-sm shadow-amber-700/10";
      default:
        return "bg-zinc-800 text-zinc-300 border-white/10";
    }
  };

  const getChannelBadge = (channel: string) => {
    const isTikTok = channel.toLowerCase().includes("tiktok");
    return (
      <span
        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
          isTikTok
            ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
            : "bg-blue-500/10 text-blue-300 border-blue-500/30"
        }`}
      >
        {isTikTok ? "TikTok" : "Meta Ads"}
      </span>
    );
  };

  return (
    <section
      id="top-high-conversion-ads-section"
      className="bg-[#141416] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Top 10 High Conversion Ads
            </h2>
            <p className="text-[11px] text-zinc-400 font-normal">
              Global brand benchmark ranked by highest conversion value
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-zinc-900 px-2.5 py-1 rounded-lg border border-white/5 self-start sm:self-auto">
          RANGE: {dateRange.toUpperCase()}
        </span>
      </div>

      {/* Grid of 10 Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="w-8 h-5 bg-zinc-800 rounded-full" />
                <div className="w-14 h-5 bg-zinc-800 rounded" />
              </div>
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-8 bg-zinc-800 rounded w-full" />
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="h-7 bg-zinc-800 rounded" />
                <div className="h-7 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : topAds.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-zinc-600 opacity-60" />
          <p className="text-xs font-medium text-zinc-400">
            No top ads data returned for this reporting period.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topAds.slice(0, 10).map((ad, idx) => {
            const rank = idx + 1;
            const roasValue = ad.roas || (ad.spend > 0 ? ad.convValue / ad.spend : 0);
            const creatorDisplayName = ad.creatorTag || "Creator Ad";

            return (
              <div
                key={ad.adId || idx}
                id={`top-ad-card-${rank}`}
                className="group relative bg-[#18181b]/70 hover:bg-[#1c1c21] border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-md space-y-3.5"
              >
                {/* Header: Rank + Channel */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded-full border font-bold ${getRankBadgeStyle(
                      rank
                    )}`}
                  >
                    #{rank}
                  </span>
                  {getChannelBadge(ad.channel)}
                </div>

                {/* Creator & Ad Title */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <User className="w-3 h-3 shrink-0" />
                    <span
                      className="text-[11px] font-semibold tracking-tight line-clamp-1"
                      title={creatorDisplayName}
                    >
                      {creatorDisplayName}
                    </span>
                  </div>
                  <h3
                    className="text-xs font-medium text-white line-clamp-2 leading-snug group-hover:text-indigo-100 transition-colors"
                    title={ad.adName}
                  >
                    {ad.adName}
                  </h3>
                </div>

                {/* Highlighted ROAS Badge */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                    ROAS
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-300">
                    {roasValue.toFixed(2)}x
                  </span>
                </div>

                {/* Performance Metrics Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                  {/* Conv. Value */}
                  <div className="bg-zinc-900/90 rounded-lg p-2 border border-white/5">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase block mb-0.5">
                      Conv. Value
                    </span>
                    <span className="font-bold font-mono text-white text-xs block truncate">
                      {formatCurrency(ad.convValue)}
                    </span>
                  </div>

                  {/* Spend */}
                  <div className="bg-zinc-900/90 rounded-lg p-2 border border-white/5">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase block mb-0.5">
                      Spend
                    </span>
                    <span className="font-semibold font-mono text-zinc-300 text-xs block truncate">
                      {formatCurrency(ad.spend)}
                    </span>
                  </div>

                  {/* Orders */}
                  <div className="bg-zinc-900/90 rounded-lg p-2 border border-white/5">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase block mb-0.5">
                      Orders
                    </span>
                    <span className="font-semibold font-mono text-zinc-300 text-xs block truncate">
                      {formatOrders(ad.orders)}
                    </span>
                  </div>

                  {/* AOV */}
                  <div className="bg-zinc-900/90 rounded-lg p-2 border border-white/5">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase block mb-0.5">
                      AOV
                    </span>
                    <span className="font-semibold font-mono text-zinc-300 text-xs block truncate">
                      {formatCurrency(ad.aov || 0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
