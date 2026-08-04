import React from "react";
import { TrendingUp, Play } from "lucide-react";
import { TopAdMetric } from "../types";

interface TopAdsGridProps {
  topAds: TopAdMetric[];
  onOpenVideoModal: (ad: TopAdMetric) => void;
}

export const TopAdsGrid: React.FC<TopAdsGridProps> = ({
  topAds,
  onOpenVideoModal,
}) => {
  return (
    <div className="bg-[#141416] border border-white/5 rounded-2xl p-5 shadow-xl">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/5">
        <TrendingUp className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">
          Top 10 High Conversion Ads
        </h2>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1 hidden sm:inline">
          GLOBAL PERFORMANCE — LAST 14 DAYS
        </span>
      </div>

      {/* Grid of 10 Video Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {topAds.map((ad, idx) => (
          <div
            key={ad.adId || idx}
            onClick={() => onOpenVideoModal(ad)}
            className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition duration-300 flex flex-col justify-between p-3"
          >
            {/* Background Image */}
            <img
              src={ad.adImageUrl}
              alt={ad.adName}
              className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />

            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:via-black/20 transition duration-300" />

            {/* Top Rank Badge */}
            <div className="relative z-10 flex justify-between items-center">
              <span className="bg-black/60 backdrop-blur-md text-white font-mono text-[10px] px-2 py-0.5 rounded-full border border-white/10 font-bold">
                #{idx + 1}
              </span>
            </div>

            {/* Center Play Button Overlay */}
            <div className="relative z-10 my-auto self-center w-11 h-11 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-indigo-600 transition duration-300 shadow-xl">
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            </div>

            {/* Bottom Info Overlay */}
            <div className="relative z-10 space-y-1">
              <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight drop-shadow-md">
                {ad.creatorTag || ad.adName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono bg-zinc-900/90 text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
                  {ad.channel}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
