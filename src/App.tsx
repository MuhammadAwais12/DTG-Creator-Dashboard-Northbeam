import React, { useEffect, useState, useCallback } from "react";
import { AdMetric, CreatorUser, DateRange, KpiMetrics, TopAdMetric } from "./types";
import { fetchCreatorCodes, fetchCreatorMetrics, fetchTopAds } from "./services/api";
import { extractCreatorName } from "./utils/creator";
import { LoginScreen } from "./components/LoginScreen";
import { Header } from "./components/Header";
import { DateFilter } from "./components/DateFilter";
import { KpiCards } from "./components/KpiCards";
import { AdsTable } from "./components/AdsTable";
import { TopAdsGrid } from "./components/TopAdsGrid";
import { VideoModal } from "./components/VideoModal";
import { KpiSkeletons, TableSkeleton } from "./components/Skeletons";

export default function App() {
  const [user, setUser] = useState<CreatorUser | null>(null);
  const [validCodes, setValidCodes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [kpis, setKpis] = useState<KpiMetrics | null>(null);
  const [ads, setAds] = useState<AdMetric[]>([]);
  const [topAds, setTopAds] = useState<TopAdMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAdForModal, setSelectedAdForModal] = useState<AdMetric | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedUserJson = localStorage.getItem("influencer_user");
      if (savedUserJson) {
        const parsed = JSON.parse(savedUserJson);
        if (parsed?.name && parsed?.code) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Error reading session from localStorage:", e);
    }
  }, []);

  // Fetch valid active creator codes on startup
  useEffect(() => {
    fetchCreatorCodes()
      .then((codes) => setValidCodes(codes))
      .catch((err) => console.error("Could not fetch active creator codes:", err));
  }, []);

  // Load metrics data whenever user or dateRange changes
  const loadDashboardData = useCallback(async (creatorCode: string, range: DateRange) => {
    setIsLoading(true);
    try {
      const [metricsRes, topAdsRes] = await Promise.all([
        fetchCreatorMetrics(creatorCode, range),
        fetchTopAds("14d"), // Top 10 section defaults to 14d global range
      ]);

      setKpis(metricsRes.kpis);
      setAds(metricsRes.ads);
      setTopAds(topAdsRes);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.code) {
      loadDashboardData(user.code, dateRange);
    }
  }, [user, dateRange, loadDashboardData]);

  const handleLoginSuccess = (loggedInUser: CreatorUser) => {
    setUser(loggedInUser);
  };

  const handleSignOut = () => {
    localStorage.removeItem("influencer_user");
    setUser(null);
    setKpis(null);
    setAds([]);
    setTopAds([]);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} validCodes={validCodes} />;
  }

  // Extract display name using robust utility (handles [Name], CR-100 | Name, etc.)
  const displayName = extractCreatorName(ads[0]?.adName, user.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500 selection:text-white flex flex-col justify-between font-sans">
      <div>
        {/* Fixed Header */}
        <Header user={user} onSignOut={handleSignOut} />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Welcome Header & Date Range Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
                Here's how your content is performing across all active campaigns.
              </p>
            </div>

            <DateFilter
              selectedRange={dateRange}
              onChange={handleDateRangeChange}
              isLoading={isLoading}
            />
          </div>

          {/* KPI Metric Cards */}
          {isLoading || !kpis ? (
            <KpiSkeletons />
          ) : (
            <KpiCards kpis={kpis} dateRange={dateRange} />
          )}

          {/* "All My Ads" Table Section */}
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <AdsTable
              ads={ads}
              dateRange={dateRange}
              onOpenVideoModal={(ad) => setSelectedAdForModal(ad)}
            />
          )}

          {/* Top 10 High Conversion Ads Section */}
          {topAds.length > 0 && (
            <TopAdsGrid
              topAds={topAds}
              onOpenVideoModal={(ad) => setSelectedAdForModal(ad)}
            />
          )}
        </main>
      </div>

      {/* Video Preview Modal */}
      <VideoModal
        ad={selectedAdForModal}
        onClose={() => setSelectedAdForModal(null)}
      />

      {/* Footer Branding */}
      <footer className="py-8 text-center text-[11px] font-mono tracking-widest text-zinc-600 uppercase border-t border-white/5 mt-12">
        POWERED BY TRIPLE WHALE DATA ENGINE
      </footer>
    </div>
  );
}
